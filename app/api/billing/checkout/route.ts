import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { rateLimit } from '@/lib/rateLimit'
import { getClientIp } from '@/lib/ip'
import { razorpay, SUBSCRIPTION_CYCLES } from '@/lib/billing/razorpay'

function isPlausibleEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) && s.length <= 320
}

/**
 * POST /api/billing/checkout — public. Starts a paid-subscription checkout.
 *
 * This never marks anyone as paid. It creates a Razorpay subscription and
 * records its id against the Subscriber row so the webhook (the only thing
 * allowed to flip `plan` to "paid") knows which row to update once Razorpay
 * confirms the payment actually went through.
 */
export async function POST(req: NextRequest) {
  if (!razorpay || !process.env.RAZORPAY_PLAN_ID) {
    return NextResponse.json({ error: 'Billing is not set up yet.' }, { status: 503 })
  }

  const rl = rateLimit(`billing-checkout:${getClientIp(req)}`, 60_000, 5)
  if (!rl.ok) {
    return NextResponse.json({ error: 'Slow down.' }, { status: 429 })
  }

  const body = await req.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!isPlausibleEmail(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  try {
    const subscription = await razorpay.subscriptions.create({
      plan_id: process.env.RAZORPAY_PLAN_ID,
      total_count: SUBSCRIPTION_CYCLES,
      customer_notify: true,
      notify_info: { notify_email: email },
    })

    await prisma.subscriber.upsert({
      where: { email },
      create: {
        email,
        paymentProvider: 'razorpay',
        paymentSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
      },
      update: {
        paymentProvider: 'razorpay',
        paymentSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
      },
    })

    return NextResponse.json({ ok: true, subscriptionId: subscription.id, checkoutUrl: subscription.short_url })
  } catch (err) {
    console.error('[billing] checkout failed:', err)
    return NextResponse.json({ error: 'Could not start checkout. Please try again.' }, { status: 500 })
  }
}
