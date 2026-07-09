import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { prisma } from '@/lib/db'

const ACTIVATING_EVENTS = new Set(['subscription.activated', 'subscription.charged'])
const DEACTIVATING_EVENTS = new Set(['subscription.cancelled', 'subscription.halted', 'subscription.completed'])

/**
 * POST /api/billing/webhook — called by Razorpay's servers, not a browser.
 *
 * This is the ONLY code path allowed to mark a Subscriber as "paid" — the
 * checkout route only ever records that a subscription was *started*.
 * Nothing here is trusted until the signature check passes: the raw body
 * must be verified byte-for-byte against X-Razorpay-Signature before it's
 * even parsed as JSON, otherwise anyone could POST a fake "payment
 * succeeded" event and grant themselves a free paid account.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Billing is not set up yet.' }, { status: 503 })
  }

  const signature = req.headers.get('x-razorpay-signature')
  const rawBody = await req.text()

  if (!signature || !Razorpay.validateWebhookSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 })
  }

  const event = JSON.parse(rawBody) as {
    event?: string
    payload?: { subscription?: { entity?: { id?: string; status?: string; current_end?: number } } }
  }

  const subscriptionEntity = event.payload?.subscription?.entity
  const subscriptionId = subscriptionEntity?.id
  if (!event.event || !subscriptionId) {
    // Not a subscription event we care about (e.g. a payment-only event) — ack and move on.
    return NextResponse.json({ ok: true })
  }

  const data: { subscriptionStatus?: string; plan?: string; currentPeriodEnd?: Date | null } = {
    subscriptionStatus: subscriptionEntity?.status,
  }
  if (ACTIVATING_EVENTS.has(event.event)) {
    data.plan = 'paid'
    data.currentPeriodEnd = subscriptionEntity?.current_end ? new Date(subscriptionEntity.current_end * 1000) : null
  } else if (DEACTIVATING_EVENTS.has(event.event)) {
    data.plan = 'free'
  }

  await prisma.subscriber.updateMany({
    where: { paymentSubscriptionId: subscriptionId },
    data,
  })

  return NextResponse.json({ ok: true })
}
