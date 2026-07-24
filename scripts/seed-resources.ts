/**
 * One-time hand-curated seed for the Financial Literacy and Spiritual
 * Literacy resource categories — deliberately not scraped. Financial
 * literacy scams and "spiritual teacher" grifting are both real enough that
 * these two categories are seeded from a short, name-checked list of
 * well-established, non-commercial institutions and primary texts, not an
 * open crawl. Spiritual Literacy is scoped strictly to Advaita Vedanta, as
 * requested — not spirituality-in-general.
 *
 * Every entry still runs through the same live-link check (see
 * lib/resources/verify.ts) as a public submission before being inserted —
 * a URL that's gone stale since this list was written is skipped and
 * reported, not force-added.
 *
 *   npx ts-node scripts/seed-resources.ts
 */

import { prisma } from '../lib/db'
import { checkUrlReachable, getExistingNormalizedUrls, normalizeUrl } from '../lib/resources/verify'

interface SeedResource {
  title: string
  description: string
  url: string
  category: 'Financial Literacy' | 'Spiritual Literacy'
}

const SEED: SeedResource[] = [
  // ── Financial Literacy ──────────────────────────────────────────────
  {
    title: 'Zerodha Varsity',
    description: 'Free, module-by-module stock market and personal finance education from India\'s largest broker — from the fundamentals through options theory. No account or purchase required to read it.',
    url: 'https://zerodha.com/varsity/',
    category: 'Financial Literacy',
  },
  {
    title: 'RBI — Financial Education',
    description: 'The Reserve Bank of India\'s own financial literacy portal — savings, credit, digital payments and fraud awareness, explained by the regulator itself.',
    url: 'https://www.rbi.org.in/financialeducation/',
    category: 'Financial Literacy',
  },
  {
    title: 'SEBI Investor Education',
    description: 'India\'s securities market regulator\'s investor education resources — how markets actually work, and how to spot the schemes that prey on people who don\'t know yet.',
    url: 'https://investor.sebi.gov.in/',
    category: 'Financial Literacy',
  },
  {
    title: 'Khan Academy — Personal Finance',
    description: 'Free, structured course covering budgeting, credit, taxes, and investing basics — no ads, no product to sell you.',
    url: 'https://www.khanacademy.org/college-careers-more/personal-finance',
    category: 'Financial Literacy',
  },
  {
    title: 'r/IndiaInvestments Wiki',
    description: 'A community-maintained, heavily cross-checked wiki covering Indian personal finance specifically — taxes, mutual funds, insurance, and the scams unique to the Indian market.',
    url: 'https://www.reddit.com/r/IndiaInvestments/wiki/index/',
    category: 'Financial Literacy',
  },

  // ── Spiritual Literacy (Advaita Vedanta) ────────────────────────────
  {
    title: 'Sri Ramanasramam',
    description: 'The ashram of Sri Ramana Maharshi, and the primary source for his teachings on self-inquiry (atma-vichara) — talks, writings, and biographical material published directly by the institution he founded.',
    url: 'https://www.sriramanamaharshi.org/',
    category: 'Spiritual Literacy',
  },
  {
    title: 'Arsha Vidya Gurukulam',
    description: 'A traditional Vedanta teaching institution founded by Swami Dayananda Saraswati — structured study of Advaita Vedanta in the classical guru-shishya, text-based tradition rather than a single teacher\'s personal philosophy.',
    url: 'https://www.arshavidya.org/',
    category: 'Spiritual Literacy',
  },
  {
    title: 'Chinmaya Mission',
    description: 'A large, long-established Vedanta teaching organization founded by Swami Chinmayananda — study groups, texts, and courses grounded in classical Advaita Vedanta scholarship.',
    url: 'https://www.chinmayamission.com/',
    category: 'Spiritual Literacy',
  },
  {
    title: 'Vedanta Society of Northern California',
    description: 'Part of the Ramakrishna-Vivekananda lineage, teaching Advaita Vedanta in the West since the early 1900s — talks, texts, and introductory material for newcomers to the tradition.',
    url: 'https://www.vedanta.org/',
    category: 'Spiritual Literacy',
  },
  {
    title: 'Advaita Vision',
    description: 'A long-running, carefully edited resource for studying Advaita Vedanta — book reviews, essays, and Q&A that engage with the tradition\'s actual texts and arguments rather than pop-spirituality paraphrasing.',
    url: 'https://www.advaita-vision.org/',
    category: 'Spiritual Literacy',
  },
  {
    title: 'Stanford Encyclopedia of Philosophy — Śaṅkara',
    description: 'A peer-reviewed academic overview of Śaṅkara, Advaita Vedanta\'s most authoritative philosopher, and the tradition\'s core claims — the right starting point for understanding what Advaita actually argues, before going to primary texts.',
    url: 'https://plato.stanford.edu/entries/shankara/',
    category: 'Spiritual Literacy',
  },
  {
    title: '"I Am That" — Sri Nisargadatta Maharaj',
    description: 'The full text of Nisargadatta Maharaj\'s dialogues on self-realization, freely available — one of the most direct primary texts in the modern Advaita tradition.',
    url: 'https://archive.org/details/IAmThatBySriNisargadattaMaharaj',
    category: 'Spiritual Literacy',
  },
]

async function main() {
  const seen = await getExistingNormalizedUrls()
  let added = 0
  let skippedDuplicate = 0
  let skippedDead = 0

  for (const entry of SEED) {
    const key = normalizeUrl(entry.url)
    if (seen.has(key)) {
      console.log(`SKIP (duplicate): ${entry.title}`)
      skippedDuplicate++
      continue
    }

    const reachable = await checkUrlReachable(entry.url)
    if (!reachable.ok) {
      console.log(`SKIP (${reachable.reason}): ${entry.title} — ${entry.url}`)
      skippedDead++
      continue
    }

    await prisma.resource.create({
      data: {
        title: entry.title,
        description: entry.description,
        url: entry.url,
        category: entry.category,
        audience: 'GENERAL',
        verified: true,
        source: 'admin',
      },
    })
    seen.add(key)
    added++
    console.log(`ADDED: ${entry.title}`)
  }

  console.log(`\nDone — added ${added}, skipped ${skippedDuplicate} duplicate(s), skipped ${skippedDead} dead link(s).`)
}

main()
  .catch(err => { console.error(err); process.exit(1) })
  .finally(() => prisma.$disconnect())
