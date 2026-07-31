import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentSubscriber } from '@/lib/subscriberSession'

/**
 * POST /api/account/newsletter — toggles the weekly digest preference for the
 * logged-in/cookied subscriber. Session-based, unlike
 * /api/subscribe/unsubscribe (which is a token link clicked from an email by
 * someone who may have no active session at all) — this is the dashboard's
 * "flip my own preference while I'm looking at it" version of the same flag.
 */
export async function POST() {
  const subscriber = await getCurrentSubscriber()
  if (!subscriber) return NextResponse.json({ error: 'No active session.' }, { status: 401 })

  const updated = await prisma.subscriber.update({
    where: { id: subscriber.id },
    data: { unsubscribedFromDigest: !subscriber.unsubscribedFromDigest },
  })

  return NextResponse.json({ subscribedToDigest: !updated.unsubscribedFromDigest })
}
