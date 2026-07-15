import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { rateLimit } from '@/lib/rateLimit'
import { getClientIp } from '@/lib/ip'
import { getCurrentSubscriber, createSubscriberSession } from '@/lib/subscriberSession'
import { generateReferralCode, REFERRALS_ENABLED } from '@/lib/referral'

function isPlausibleEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) && s.length <= 320
}

/** GET /api/saved — this visitor's saved opportunities, newest first. Empty
 * list (not an error) if they have no session yet. */
export async function GET() {
  const subscriber = await getCurrentSubscriber()
  if (!subscriber) return NextResponse.json({ items: [] })

  const saved = await prisma.savedOpportunity.findMany({
    where: { subscriberId: subscriber.id },
    orderBy: { savedAt: 'desc' },
  })
  if (saved.length === 0) return NextResponse.json({ items: [] })

  const items = await prisma.opportunity.findMany({
    where: { id: { in: saved.map(s => s.opportunityId) }, deletedAt: null },
  })
  // Preserve save order rather than the DB's default ordering.
  const byId = new Map(items.map(o => [o.id, o]))
  const ordered = saved.map(s => byId.get(s.opportunityId)).filter((o): o is NonNullable<typeof o> => !!o)

  return NextResponse.json({ items: ordered })
}

/**
 * POST /api/saved — save an opportunity for this visitor. If they have no
 * subscriber session yet, an email is required to create one on the spot —
 * same lightweight, no-password identity model already used for browsing
 * and the newsletter, not a new account system.
 */
export async function POST(req: NextRequest) {
  const rl = rateLimit(`saved-write:${getClientIp(req)}`, 60_000, 30)
  if (!rl.ok) return NextResponse.json({ error: 'Slow down.' }, { status: 429 })

  const body = await req.json().catch(() => null)
  const opportunityId = typeof body?.opportunityId === 'string' ? body.opportunityId : ''
  if (!opportunityId) return NextResponse.json({ error: 'opportunityId is required.' }, { status: 400 })

  let subscriber = await getCurrentSubscriber()

  if (!subscriber) {
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    if (!isPlausibleEmail(email)) {
      return NextResponse.json({ error: 'needsEmail' }, { status: 401 })
    }

    const referredBy = REFERRALS_ENABLED && typeof body?.ref === 'string' && body.ref.trim() ? body.ref.trim().toUpperCase() : null

    subscriber = await prisma.subscriber.upsert({
      where: { email },
      create: { email, referralCode: REFERRALS_ENABLED ? generateReferralCode() : null, referredBy },
      update: {},
    })
    await createSubscriberSession(subscriber.id)
  }

  const opp = await prisma.opportunity.findUnique({ where: { id: opportunityId } })
  if (!opp || opp.deletedAt) return NextResponse.json({ error: 'Opportunity not found.' }, { status: 404 })

  await prisma.savedOpportunity.upsert({
    where: { subscriberId_opportunityId: { subscriberId: subscriber.id, opportunityId } },
    create: { subscriberId: subscriber.id, opportunityId },
    update: {},
  })

  return NextResponse.json({ ok: true })
}

/** DELETE /api/saved — unsave an opportunity. No-op if it wasn't saved. */
export async function DELETE(req: NextRequest) {
  const subscriber = await getCurrentSubscriber()
  if (!subscriber) return NextResponse.json({ error: 'No active session.' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const opportunityId = typeof body?.opportunityId === 'string' ? body.opportunityId : ''
  if (!opportunityId) return NextResponse.json({ error: 'opportunityId is required.' }, { status: 400 })

  await prisma.savedOpportunity.deleteMany({
    where: { subscriberId: subscriber.id, opportunityId },
  })

  return NextResponse.json({ ok: true })
}
