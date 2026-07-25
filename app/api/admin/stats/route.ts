import { NextResponse } from 'next/server'
import { prisma }       from '@/lib/db'
import { requireAuth }  from '@/lib/auth'

const DAYS = 30
const DAY_MS = 86_400_000

/** Buckets a list of dates into daily counts for the last `DAYS` days,
 * oldest first — zero-filled so the frontend never has to guess about a
 * missing day (no signal that day vs. no data that day). */
function bucketByDay(dates: Date[]): { date: string; count: number }[] {
  const buckets = new Map<string, number>()
  const now = new Date()
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * DAY_MS)
    buckets.set(d.toISOString().slice(0, 10), 0)
  }
  for (const date of dates) {
    const key = date.toISOString().slice(0, 10)
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1)
  }
  return [...buckets.entries()].map(([date, count]) => ({ date, count }))
}

/** GET /api/admin/stats — admin-only aggregate dashboard data across every
 * content type. Nothing here is cached — small enough tables (low
 * thousands of rows) that a live count is cheap and always accurate,
 * which matters more than shaving a few hundred ms for a page only the
 * site owner loads. */
export async function GET() {
  const admin = await requireAuth()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const since = new Date(Date.now() - DAYS * DAY_MS)
  const sinceDateStr = since.toISOString().slice(0, 10)

  const [
    oppTotal, oppVerified, oppByAudience, oppBySource, oppRecentDates,
    resTotal, resVerified, resByCategory, resBySource, resRecentDates,
    subTotal, subPaid, subRecentDates,
    submissionsByStatus,
    scrapeRuns, resourceScrapeRuns,
    digests,
    visitorDayCounts, recentVisitDates,
  ] = await Promise.all([
    prisma.opportunity.count({ where: { deletedAt: null } }),
    prisma.opportunity.count({ where: { deletedAt: null, verified: true } }),
    prisma.opportunity.groupBy({ by: ['audience'], where: { deletedAt: null }, _count: true }),
    prisma.opportunity.groupBy({ by: ['source'], where: { deletedAt: null }, _count: true }),
    prisma.opportunity.findMany({ where: { deletedAt: null, addedAt: { gte: since } }, select: { addedAt: true } }),

    prisma.resource.count({ where: { deletedAt: null } }),
    prisma.resource.count({ where: { deletedAt: null, verified: true } }),
    prisma.resource.groupBy({ by: ['category'], where: { deletedAt: null }, _count: true }),
    prisma.resource.groupBy({ by: ['source'], where: { deletedAt: null }, _count: true }),
    prisma.resource.findMany({ where: { deletedAt: null, addedAt: { gte: since } }, select: { addedAt: true } }),

    prisma.subscriber.count(),
    prisma.subscriber.count({ where: { plan: 'paid' } }),
    prisma.subscriber.findMany({ where: { subscribedAt: { gte: since } }, select: { subscribedAt: true } }),

    prisma.opportunitySubmission.groupBy({ by: ['status'], _count: true }),

    prisma.scrapeRun.findMany({ orderBy: { startedAt: 'desc' }, take: 10 }),
    prisma.resourceScrapeRun.findMany({ orderBy: { startedAt: 'desc' }, take: 10 }),

    prisma.policyDigest.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),

    // Gate-0 retention: one row per (anonId, date) already means the count
    // of rows per anonId IS the count of distinct days they showed up —
    // "returning" is simply anyone with 2 or more.
    prisma.visitLog.groupBy({ by: ['anonId'], _count: { date: true } }),
    prisma.visitLog.findMany({ where: { date: { gte: sinceDateStr } }, select: { date: true } }),
  ])

  const digestItemCount = (items: string) => {
    try { return (JSON.parse(items) as unknown[]).length } catch { return 0 }
  }

  const totalVisitors = visitorDayCounts.length
  const returningVisitors = visitorDayCounts.filter(v => v._count.date >= 2).length

  return NextResponse.json({
    opportunities: {
      total: oppTotal,
      verified: oppVerified,
      unverified: oppTotal - oppVerified,
      byAudience: oppByAudience.map(r => ({ label: r.audience, count: r._count })),
      bySource: oppBySource.map(r => ({ label: r.source, count: r._count })),
      last30Days: bucketByDay(oppRecentDates.map(r => r.addedAt)),
    },
    resources: {
      total: resTotal,
      verified: resVerified,
      unverified: resTotal - resVerified,
      byCategory: resByCategory.map(r => ({ label: r.category, count: r._count })),
      bySource: resBySource.map(r => ({ label: r.source, count: r._count })),
      last30Days: bucketByDay(resRecentDates.map(r => r.addedAt)),
    },
    subscribers: {
      total: subTotal,
      paid: subPaid,
      free: subTotal - subPaid,
      last30Days: bucketByDay(subRecentDates.map(r => r.subscribedAt)),
    },
    submissions: {
      byStatus: submissionsByStatus.map(r => ({ label: r.status, count: r._count })),
    },
    scraperRuns: {
      opportunities: scrapeRuns.map(r => ({ startedAt: r.startedAt, added: r.added })),
      resources: resourceScrapeRuns.map(r => ({ startedAt: r.startedAt, added: r.added })),
    },
    digests: digests.map(d => ({
      period: d.period, periodType: d.periodType, itemCount: digestItemCount(d.items), createdAt: d.createdAt,
    })),
    retention: {
      totalVisitors,
      returningVisitors,
      returnRatePct: totalVisitors > 0 ? Math.round((returningVisitors / totalVisitors) * 100) : 0,
      last30Days: bucketByDay(recentVisitDates.map(v => new Date(`${v.date}T00:00:00Z`))),
    },
  })
}
