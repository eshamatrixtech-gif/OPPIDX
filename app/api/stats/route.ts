import { NextResponse } from 'next/server'
import { prisma }       from '@/lib/db'

/** GET /api/stats — public, real DB-derived counts for the homepage counters. */
export async function GET() {
  const [opportunities, subscribers, viewAgg] = await Promise.all([
    prisma.opportunity.count({ where: { verified: true, deletedAt: null } }),
    prisma.subscriber.count(),
    prisma.opportunity.aggregate({
      where: { verified: true, deletedAt: null },
      _sum: { viewCount: true },
    }),
  ])

  return NextResponse.json({
    opportunities,
    subscribers,
    viewed: viewAgg._sum.viewCount ?? 0,
  })
}
