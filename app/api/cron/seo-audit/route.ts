import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendOpsReport } from '@/lib/alerts'
import { getSearchConsoleReport } from '@/lib/seo/googleIndexing'

/**
 * Weekly SEO health report. It measures only facts we can verify from the
 * board and (optionally) Search Console; it never creates pages or content.
 * Add the Google service-account variables to turn on search-performance
 * data, otherwise the content-quality report still runs and emails normally.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return NextResponse.json({ error: 'Cron is not set up yet.' }, { status: 503 })
  if (req.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60_000)
  const verified = { verified: true, deletedAt: null }
  const [total, addedLast7Days, missingSummary, duplicateTitles, searchConsole] = await Promise.all([
    prisma.opportunity.count({ where: verified }),
    prisma.opportunity.count({ where: { ...verified, addedAt: { gte: sevenDaysAgo } } }),
    prisma.opportunity.count({ where: { ...verified, OR: [{ summary: null }, { summary: '' }] } }),
    prisma.opportunity.groupBy({ by: ['title'], where: verified, _count: { _all: true }, having: { title: { _count: { gt: 1 } } } }),
    getSearchConsoleReport(),
  ])

  const report = [
    'Weekly SEO health report',
    '',
    `Indexable verified opportunities: ${total}`,
    `Added in the last 7 days: ${addedLast7Days}`,
    `Missing original summary: ${missingSummary}`,
    `Duplicate titles requiring review: ${duplicateTitles.length}`,
    '',
    searchConsole.configured
      ? `Google Search Console (last 7 complete days):\nClicks: ${searchConsole.clicks}\nImpressions: ${searchConsole.impressions}\nCTR: ${(searchConsole.ctr * 100).toFixed(1)}%\nAverage position: ${searchConsole.position.toFixed(1)}\n\nTop queries:\n${searchConsole.topQueries.map(row => `- ${row.query}: ${row.clicks} clicks / ${row.impressions} impressions / position ${row.position.toFixed(1)}`).join('\n') || 'No query data yet.'}`
      : 'Google Search Console: not configured. Add the service-account credentials and GOOGLE_SEARCH_CONSOLE_SITE_URL to enable query/performance reporting.',
  ].join('\n')

  const emailed = await sendOpsReport('weekly SEO health report', report)
  return NextResponse.json({ total, addedLast7Days, missingSummary, duplicateTitles: duplicateTitles.length, searchConsole, emailed })
}
