import { NextRequest, NextResponse } from 'next/server'
import { runScrapePass } from '@/lib/scraper/run'

/**
 * GET /api/cron/scrape — triggers one scraper pass. Meant to be called by an
 * external scheduler (see .github/workflows/scrape-cron.yml), not a browser.
 *
 * Serverless hosts (Vercel included) freeze/recycle function instances
 * between requests, so the in-process setInterval scheduler in
 * lib/scraper/scheduler.ts can't reliably fire on its own hourly cadence in
 * production — it only really works on a persistent server process (local
 * dev, a VPS). This route is what actually keeps the board "updated hourly"
 * once deployed serverless.
 *
 * Protected by a shared secret (not admin cookie auth) since the caller is a
 * scheduler, not a logged-in browser.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Cron is not set up yet.' }, { status: 503 })
  }

  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await runScrapePass()
  return NextResponse.json(result)
}
