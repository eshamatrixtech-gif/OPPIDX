import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { prisma } from '@/lib/db'
import { inferGeo } from '@/lib/scraper/geo'
import type { SubmissionInput } from '@/lib/submissions/validate'

const ACTIVATING_EVENTS = new Set(['subscription.activated', 'subscription.charged'])
const DEACTIVATING_EVENTS = new Set(['subscription.cancelled', 'subscription.halted', 'subscription.completed'])

/**
 * POST /api/billing/webhook — called by Razorpay's servers, not a browser.
 *
 * This is the ONLY code path allowed to mark a Subscriber as "paid", and the
 * ONLY code path allowed to turn a paid OpportunitySubmission into a real
 * (still unverified) Opportunity row. Nothing here is trusted until the
 * signature check passes: the raw body must be verified byte-for-byte
 * against X-Razorpay-Signature before it's even parsed as JSON, otherwise
 * anyone could POST a fake "payment succeeded" event and grant themselves a
 * free paid account or a free listing.
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
    payload?: {
      subscription?: { entity?: { id?: string; status?: string; current_end?: number } }
      payment?: { entity?: { id?: string; order_id?: string; status?: string } }
    }
  }

  // One-time "enlist your opportunity" submission fee — separate flow from
  // recurring subscriptions below, keyed by Razorpay order id instead of
  // subscription id.
  const paymentEntity = event.payload?.payment?.entity
  if (event.event === 'payment.captured' && paymentEntity?.order_id) {
    await handleSubmissionPayment(paymentEntity.order_id)
    return NextResponse.json({ ok: true })
  }

  const subscriptionEntity = event.payload?.subscription?.entity
  const subscriptionId = subscriptionEntity?.id
  if (!event.event || !subscriptionId) {
    // Not an event we care about — ack and move on.
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

/**
 * Turns a paid submission fee into an unverified Opportunity row. Idempotent
 * against Razorpay's webhook retries: only acts if the submission is still
 * "pending" — a second `payment.captured` for the same order is a no-op.
 */
async function handleSubmissionPayment(razorpayOrderId: string) {
  const submission = await prisma.opportunitySubmission.findUnique({ where: { razorpayOrderId } })
  if (!submission || submission.status !== 'pending') return

  let input: Partial<SubmissionInput>
  try {
    input = JSON.parse(submission.payload)
  } catch (err) {
    console.error('[webhook] could not parse stored submission payload:', err)
    return
  }

  const geo = inferGeo(input.location)

  const created = await prisma.opportunity.create({
    data: {
      title: (input.title ?? '').trim(),
      description: (input.description ?? '').trim(),
      url: (input.url ?? '').trim(),
      org: input.org?.trim() || null,
      audience: input.audience ?? 'GENERAL',
      eligibility: (input.eligibility ?? '').trim(),
      prepResources: (input.prepResources ?? '').trim(),
      difficulty: input.difficulty ?? 'Medium',
      tags: (input.tags ?? '').trim(),
      location: input.location?.trim() || null,
      region: geo.region,
      country: geo.country,
      compType: input.compType?.trim() || null,
      verified: false, // paying buys a human review, not a spot on the board
      featured: false,
      source: 'user-provided',
      sourceUrl: null,
    },
  })

  await prisma.opportunitySubmission.update({
    where: { id: submission.id },
    data: { status: 'paid', opportunityId: created.id },
  })
}
