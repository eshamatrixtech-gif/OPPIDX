import { NextRequest, NextResponse } from 'next/server'
import { runScrapePass } from '@/lib/scraper/run'
import { prisma } from '@/lib/db'
import { notifyMatchingSubscribers } from '@/lib/push'

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

  // Paid "Featured" upserts are only good for a fixed window (see
  // lib/billing/razorpay.ts's FEATURED_DURATION_DAYS) — unset featured once
  // it passes so the homepage's featured pool doesn't keep a stale paid
  // listing forever. Piggybacks on this already-hourly cron rather than
  // adding a new schedule.
  await prisma.opportunity.updateMany({
    where: { featured: true, featuredUntil: { lt: new Date() } },
    data: { featured: false },
  })

  const result = await runScrapePass()

  if (result.added > 0) {
    const newOpportunities = await prisma.opportunity.findMany({
      where: { verified: true, deletedAt: null, addedAt: { gte: result.startedAt } },
      select: { id: true, audience: true },
    })
    await notifyMatchingSubscribers(newOpportunities).catch(err =>
      console.error('[scrape cron] push notification pass failed:', err)
    )
  }

  return NextResponse.json(result)
}
