import { supabaseAdmin } from "@/lib/mayatara/supabase";
import { getAllHeadlines } from "@/lib/mayatara/pulseFeed";
import { fetchGovDatapoints } from "@/lib/mayatara/govStats";

// ─── DAILY PULSE REFRESH JOB ──────────────────────────────────────────────────
// Runs once a day (see vercel.json). Pulls real headlines from PIB
// (government) and business/economy sections of The Hindu, Indian Express,
// and LiveMint (newspaper), plus real figures from data.gov.in if
// configured. No AI, no fabrication — pure fetch + keyword classification.
// Protected by CRON_SECRET header, same pattern as /api/match/find.
// ───────────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const secret = req.headers.get("x-cron-secret") || "";
  const expected = process.env.CRON_SECRET || "";
  const { timingSafeEqual } = await import("crypto");
  const ok = secret.length === expected.length &&
    timingSafeEqual(Buffer.from(secret), Buffer.from(expected));
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  if (!supabaseAdmin) return Response.json({ error: "Server config error." }, { status: 500 });

  let headlineCount = 0;
  let datapointCount = 0;
  const errors: string[] = [];

  try {
    const headlines = await getAllHeadlines();
    for (const h of headlines) {
      const { error } = await supabaseAdmin.from("pulse_headlines").upsert({
        title: h.title,
        url: h.url,
        category: h.category,
        source: h.source,
        source_type: h.sourceType,
        fetched_at: new Date().toISOString(),
      }, { onConflict: "url" });
      if (error) throw error;
      headlineCount++;
    }

    // Bounded growth — drop anything not seen in 14 days.
    await supabaseAdmin
      .from("pulse_headlines")
      .delete()
      .lt("fetched_at", new Date(Date.now() - 14 * 86400_000).toISOString());
  } catch (e) {
    errors.push(`headlines: ${e instanceof Error ? e.message : "unknown"}`);
  }

  try {
    const datapoints = await fetchGovDatapoints();
    for (const d of datapoints) {
      const { error } = await supabaseAdmin.from("pulse_datapoints").upsert({
        category: d.category,
        label: d.label,
        value: d.value,
        unit: d.unit,
        as_of: d.asOf,
        source_name: d.sourceName,
        source_url: d.sourceUrl,
        fetched_at: new Date().toISOString(),
      }, { onConflict: "category,label" });
      if (error) throw error;
      datapointCount++;
    }
  } catch (e) {
    errors.push(`datapoints: ${e instanceof Error ? e.message : "unknown"}`);
  }

  return Response.json({
    success: errors.length === 0,
    headlineCount,
    datapointCount,
    errors: errors.length ? errors : undefined,
  });
}
