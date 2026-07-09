import { NextRequest, NextResponse } from 'next/server'
import { prisma }                    from '@/lib/db'
import { rateLimit }                 from '@/lib/rateLimit'
import { getClientIp }               from '@/lib/ip'

/**
 * POST /api/opportunities/[id]/view — public. Increments the real view
 * counter shown on the homepage. Rate-limited per IP+opportunity so the
 * "Opportunities Viewed" count can't be trivially spammed — beyond the
 * limit we just no-op and return ok, since a blocked increment shouldn't
 * surface as an error to a real visitor.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const rl = rateLimit(`view:${getClientIp(req)}:${id}`, 10 * 60_000, 5)

  if (rl.ok) {
    await prisma.opportunity.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => null)
  }

  return NextResponse.json({ ok: true })
}
