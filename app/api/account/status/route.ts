import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { rateLimit } from '@/lib/rateLimit'
import { getClientIp } from '@/lib/ip'
import { getCurrentSubscriber } from '@/lib/subscriberSession'
import { isPaidSubscriber } from '@/lib/billing/entitlements'

function isPlausibleEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) && s.length <= 320
}

function shape(subscriber: { plan: string; subscriptionStatus: string | null; currentPeriodEnd: Date | null; email: string }) {
  return {
    found: true,
    email: subscriber.email,
    isPaid: isPaidSubscriber(subscriber),
    plan: subscriber.plan,
    subscriptionStatus: subscriber.subscriptionStatus,
    currentPeriodEnd: subscriber.currentPeriodEnd,
  }
}

/** GET /api/account/status — status for the current session, if any. */
export async function GET() {
  const subscriber = await getCurrentSubscriber()
  if (!subscriber) return NextResponse.json({ found: false })
  return NextResponse.json(shape(subscriber))
}

/**
 * POST /api/account/status — status lookup by email, for a visitor with no
 * active session (new device, cleared cookies). Same "knows the email"
 * identity model as restore-access — this is read-only and strictly less
 * powerful than restore-access already is, so it doesn't raise the bar.
 */
export async function POST(req: NextRequest) {
  const rl = rateLimit(`account-status:${getClientIp(req)}`, 60_000, 10)
  if (!rl.ok) {
    return NextResponse.json({ error: 'Slow down.' }, { status: 429 })
  }

  const body = await req.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!isPlausibleEmail(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  const subscriber = await prisma.subscriber.findUnique({ where: { email } })
  if (!subscriber) return NextResponse.json({ found: false })

  return NextResponse.json(shape(subscriber))
}
