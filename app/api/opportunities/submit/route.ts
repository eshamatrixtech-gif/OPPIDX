import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { rateLimit } from '@/lib/rateLimit'
import { getClientIp } from '@/lib/ip'
import { razorpay, SUBMISSION_FEE_PAISE } from '@/lib/billing/razorpay'
import { validateSubmission, type SubmissionInput } from '@/lib/submissions/validate'

/**
 * POST /api/opportunities/submit — public. "Enlist your opportunity."
 *
 * Takes a listing + payment together, but never creates an Opportunity here.
 * It validates content, opens a Razorpay order for the flat submission fee,
 * and stores the payload against that order. Only the webhook — once
 * Razorpay confirms the payment actually happened — creates the (unverified)
 * Opportunity, and even then it still has to clear the human review queue
 * like every other hand-submitted listing. Paying buys a review, not a spot.
 */
export async function POST(req: NextRequest) {
  if (!razorpay) {
    return NextResponse.json({ error: 'Billing is not set up yet.' }, { status: 503 })
  }

  const rl = rateLimit(`submit-opp:${getClientIp(req)}`, 60_000, 5)
  if (!rl.ok) {
    return NextResponse.json({ error: 'Slow down.' }, { status: 429 })
  }

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const input: Partial<SubmissionInput> = {
    title: typeof body.title === 'string' ? body.title.trim() : '',
    description: typeof body.description === 'string' ? body.description.trim() : '',
    url: typeof body.url === 'string' ? body.url.trim() : '',
    org: typeof body.org === 'string' ? body.org.trim() : '',
    audience: typeof body.audience === 'string' ? body.audience.trim() : '',
    eligibility: typeof body.eligibility === 'string' ? body.eligibility.trim() : '',
    prepResources: typeof body.prepResources === 'string' ? body.prepResources.trim() : '',
    difficulty: typeof body.difficulty === 'string' ? body.difficulty.trim() : 'Medium',
    tags: typeof body.tags === 'string' ? body.tags.trim() : '',
    location: typeof body.location === 'string' ? body.location.trim() : '',
    compType: typeof body.compType === 'string' ? body.compType.trim() : '',
    submitterEmail: typeof body.submitterEmail === 'string' ? body.submitterEmail.trim().toLowerCase() : '',
  }

  const { ok, errors } = validateSubmission(input)
  if (!ok) {
    return NextResponse.json({ error: errors[0], errors }, { status: 400 })
  }

  try {
    const order = await razorpay.orders.create({
      amount: SUBMISSION_FEE_PAISE,
      currency: 'INR',
      receipt: `submission_${Date.now()}`,
      notes: { title: input.title!, submitterEmail: input.submitterEmail! },
    })

    await prisma.opportunitySubmission.create({
      data: {
        razorpayOrderId: order.id,
        status: 'pending',
        submitterEmail: input.submitterEmail!,
        payload: JSON.stringify(input),
      },
    })

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    })
  } catch (err) {
    console.error('[submit] failed to create order:', err)
    return NextResponse.json({ error: 'Could not start checkout. Please try again.' }, { status: 500 })
  }
}
