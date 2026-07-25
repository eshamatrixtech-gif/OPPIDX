import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { computeRetention, isoWeekString } from '@/lib/retention'
import { isUniqueConstraintError } from '@/lib/isUniqueConstraintError'

/**
 * GET /api/cron/retention-snapshot — durable weekly record of the Gate-0
 * retention numbers (see VisitLog / lib/retention.ts). The live admin
 * Stats tab only shows the current all-time figure, which makes "is this
 * actually improving" impossible to answer without remembering last
 * week's number by hand — this is what makes that a real trend instead.
 * Same shared-secret auth pattern as the other crons — see
 * .github/workflows/retention-snapshot-cron.yml for the schedule.
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

  const weekOf = isoWeekString(new Date())
  const { totalVisitors, returningVisitors, returnRatePct } = await computeRetention()

  try {
    await prisma.retentionSnapshot.create({
      data: { weekOf, totalVisitors, returningVisitors, returnRatePct },
    })
  } catch (e) {
    if (!isUniqueConstraintError(e)) throw e
    // already snapshotted this week — leave the existing row as the durable record
  }

  return NextResponse.json({ weekOf, totalVisitors, returningVisitors, returnRatePct })
}
