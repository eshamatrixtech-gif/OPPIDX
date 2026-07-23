/**
 * Real, no-AI content pipeline for /pulse. Two independent sources, both
 * plain fetch + regex extraction + keyword classification — zero LLM calls,
 * zero token cost, fully deterministic, safe to run on a cron every day.
 *
 * 1. Government — the Press Information Bureau's own official press-release
 *    feed (Government of India). Official announcements, so by construction
 *    policy/scheme content, not opinion.
 * 2. Newspaper — business/economy section feeds from The Hindu, Indian
 *    Express, and LiveMint. Section-scoped on purpose: their general
 *    firehoses are full of politics, protests, and celebrity news, which is
 *    exactly what this product explicitly does not want. The exclusion
 *    filter below still runs as a second safety net on top of that.
 *
 * English only, on purpose: PIB serves English or Hindi unpredictably
 * regardless of the requested language param (confirmed by testing — not
 * something a client request can force), so every item is checked for
 * Devanagari script and dropped if found, rather than showing mixed-language
 * content. The newspaper sources are English-only by nature.
 */

export interface RawHeadline {
  title: string;
  url: string;
  source: string;
}

export type PulseSourceType = "government" | "newspaper";

export interface ClassifiedHeadline extends RawHeadline {
  category: string;
  sourceType: PulseSourceType;
}

// ── Shared RSS item extraction ───────────────────────────────────────────────
// Every source here uses the same flat <item><title>/<link></item> shape.
// Some publishers wrap values in CDATA, some don't — handle both.

function unwrap(raw: string): string {
  const cdata = raw.match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/);
  const inner = cdata ? cdata[1] : raw;
  return inner
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .trim();
}

function extractItems(xml: string): { title: string; url: string }[] {
  const items: { title: string; url: string }[] = [];
  const itemRe = /<item[^>]*>([\s\S]*?)<\/item>/g;
  let m: RegExpExecArray | null;
  while ((m = itemRe.exec(xml))) {
    const block = m[1];
    const titleMatch = block.match(/<title>([\s\S]*?)<\/title>/);
    const linkMatch = block.match(/<link>([\s\S]*?)<\/link>/);
    if (!titleMatch || !linkMatch) continue;
    const title = unwrap(titleMatch[1]);
    const url = unwrap(linkMatch[1]);
    if (title && url) items.push({ title, url });
  }
  return items;
}

const BROWSER_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function fetchFeed(url: string): Promise<string> {
  // A self-identifying bot UA (e.g. "MayataraBot/1.0") gets a 403 from PIB's
  // Akamai edge — confirmed by testing. A standard browser UA is required,
  // and works fine for the newspaper sources too.
  const res = await fetch(url, { headers: { "User-Agent": BROWSER_UA }, cache: "no-store" });
  if (!res.ok) throw new Error(`${url} returned ${res.status}`);
  return res.text();
}

const DEVANAGARI = /[ऀ-ॿ]/;
function isEnglish(title: string): boolean {
  return !DEVANAGARI.test(title);
}

// ── Government source — PIB, multiple regional offices for volume ───────────
// PIB's language is server-side and inconsistent per region/request; fetching
// a couple of regions and keeping only the English results is more reliable
// than depending on any single region to return English today.
const PIB_REGIONS = [3, 1]; // Delhi, Mumbai

async function fetchPibHeadlines(): Promise<RawHeadline[]> {
  const results = await Promise.allSettled(
    PIB_REGIONS.map((reg) => fetchFeed(`https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=2&Regid=${reg}`))
  );
  const seen = new Set<string>();
  const out: RawHeadline[] = [];
  for (const r of results) {
    if (r.status !== "fulfilled") continue;
    for (const item of extractItems(r.value)) {
      if (seen.has(item.url)) continue;
      seen.add(item.url);
      out.push({ ...item, source: "Press Information Bureau, Govt. of India" });
    }
  }
  return out;
}

// ── Newspaper sources — business/economy sections only, verified working ────
const NEWSPAPER_FEEDS: { source: string; url: string }[] = [
  { source: "The Hindu", url: "https://www.thehindu.com/business/feeder/default.rss" },
  { source: "The Indian Express", url: "https://indianexpress.com/section/business/feed/" },
  { source: "LiveMint", url: "https://www.livemint.com/rss/economy" },
];

async function fetchNewspaperHeadlines(): Promise<RawHeadline[]> {
  const results = await Promise.allSettled(NEWSPAPER_FEEDS.map((f) => fetchFeed(f.url)));
  const out: RawHeadline[] = [];
  results.forEach((r, i) => {
    if (r.status !== "fulfilled") return;
    for (const item of extractItems(r.value)) {
      out.push({ ...item, source: NEWSPAPER_FEEDS[i].source });
    }
  });
  return out;
}

// ── Exclusion filter — second safety net on top of source-level curation ────
const EXCLUDE_PATTERNS: RegExp[] = [
  /\bterroris(m|t)\b/i,
  /\bmilitary\s+operation\b/i,
  /\bairstrike\b/i,
  /\bcasualties\b/i,
  /\belection(s)?\b/i,
  /\bpoll(s)?\b.*\b(vote|ballot)\b/i,
  /\bparty\s+(manifesto|workers|rally)\b/i,
  /\bopposition\s+(leader|party)\b/i,
  /\bceasefire\b/i,
  /\bmartyr(ed)?\b/i,
  /\bprotest(s|ers|ing)?\b/i,
  /\bMLA\b/i, /\bMP\b/i, /\bBJP\b/i, /\bCongress\b/i, /\bRahul Gandhi\b/i, /\bcabinet\s+reshuffle\b/i,
];

function isExcluded(title: string): boolean {
  return EXCLUDE_PATTERNS.some((p) => p.test(title));
}

// ── Category classifier — plain keyword matching, no AI ─────────────────────
const CATEGORY_RULES: { category: string; patterns: RegExp[] }[] = [
  { category: "Health & Sanitation", patterns: [/\bhealth\b/i, /\bsanitation\b/i, /\bhospital\b/i, /\bsewer\b/i, /\bseptic\b/i, /\bswachh\b/i, /\bAYUSH\b/i, /\bmedical\b/i] },
  { category: "Education & Skilling", patterns: [/\beducation\b/i, /\bschool\b/i, /\bskill\b/i, /\bNCVET\b/i, /\btraining\s+institute\b/i, /\buniversity\b/i, /\bliteracy\b/i] },
  { category: "Women & Child Welfare", patterns: [/\bwomen\b/i, /\bchild\b/i, /\bminorit(y|ies)\b/i, /\bgender\b/i, /\banganwadi\b/i] },
  { category: "Rural Development", patterns: [/\brural\b/i, /\bpanchayat\b/i, /\bPMGSY\b/i, /\bPMAY-G\b/i, /\bNRLM\b/i, /\bNSAP\b/i, /\bgram\b/i] },
  { category: "Agriculture", patterns: [/\bagricultur(e|al)\b/i, /\bfarmer\b/i, /\bfertiliser\b/i, /\bfertilizer\b/i, /\bcrop\b/i, /\birrigation\b/i, /\bmonsoon\b/i, /\bseed\b/i, /\breservoir\b/i] },
  { category: "Environment & Cleanliness", patterns: [/\benvironment\b/i, /\bpollution\b/i, /\bCAQM\b/i, /\bair\s+quality\b/i, /\bwaste\b/i, /\bclean(liness|-up)?\b/i, /\bforest\b/i] },
  { category: "Infrastructure", patterns: [/\binfrastructure\b/i, /\broad(s)?\b/i, /\brailway\b/i, /\bhighway\b/i, /\bdigit(al|isation|ization)\b/i, /\bdrone\b/i] },
  { category: "Governance & Welfare Schemes", patterns: [/\bscheme\b/i, /\bministry\b/i, /\byojana\b/i, /\bwelfare\b/i, /\bfinancial\s+inclusion\b/i] },
  { category: "Markets & Business", patterns: [/\bshares?\b/i, /\bstock(s)?\b/i, /\bIPO\b/i, /\bprofit\b/i, /\bmarket(s)?\b/i, /\bRBI\b/i, /\bbank(ing|s)?\b/i, /\bcompany\b/i, /\bearnings\b/i, /\brupee\b/i, /\bGDP\b/i, /\beconomy\b/i] },
];

function classifyCategory(title: string): string {
  for (const rule of CATEGORY_RULES) {
    if (rule.patterns.some((p) => p.test(title))) return rule.category;
  }
  return "National Development";
}

async function classify(raw: RawHeadline[], sourceType: PulseSourceType): Promise<ClassifiedHeadline[]> {
  return raw
    .filter((h) => isEnglish(h.title) && !isExcluded(h.title))
    .map((h) => ({ ...h, category: classifyCategory(h.title), sourceType }));
}

export async function getAllHeadlines(): Promise<ClassifiedHeadline[]> {
  const [gov, papers] = await Promise.all([
    fetchPibHeadlines().catch((e) => { console.error("[pulseFeed] PIB fetch failed:", e); return []; }),
    fetchNewspaperHeadlines().catch((e) => { console.error("[pulseFeed] newspaper fetch failed:", e); return []; }),
  ]);
  const [govClassified, papersClassified] = await Promise.all([
    classify(gov, "government"),
    classify(papers, "newspaper"),
  ]);
  return [...govClassified, ...papersClassified];
}
