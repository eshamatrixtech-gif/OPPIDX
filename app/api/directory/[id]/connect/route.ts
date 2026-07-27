import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { rateLimit } from '@/lib/rateLimit'
import { getClientIp } from '@/lib/ip'
import { checkContentSafety } from '@/lib/mayatara/moderation.ai'
import { sendDirectoryIntroEmail } from '@/lib/email'

function isPlausibleEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) && s.length <= 320
}

/**
 * POST /api/directory/[id]/connect — send a directory profile owner an
 * email introduction. Neither party's address is ever shown on the page:
 * the target's real email is looked up server-side only, and the
 * requester's own email becomes the reply-to, so a real reply goes
 * straight to them without OppIDX relaying anything further.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ip = getClientIp(req)
  const rl = rateLimit(`directory-connect:${ip}`, 60_000, 5)
  if (!rl.ok) return NextResponse.json({ error: 'Slow down.' }, { status: 429 })

  // Per-IP alone doesn't stop one real directory member's inbox from being
  // repeatedly hit by rotating IPs — this second limit is keyed by the
  // target profile itself, capping how many intro emails any one person
  // can receive in an hour regardless of who's sending them.
  const targetRl = rateLimit(`directory-connect-target:${id}`, 60 * 60_000, 10)
  if (!targetRl.ok) return NextResponse.json({ error: 'This person has gotten a lot of messages recently — try again later.' }, { status: 429 })

  const body = await req.json().catch(() => null)
  const fromEmail = typeof body?.fromEmail === 'string' ? body.fromEmail.trim().toLowerCase() : ''
  const message = typeof body?.message === 'string' ? body.message.trim().slice(0, 1000) : ''

  if (!isPlausibleEmail(fromEmail)) return NextResponse.json({ error: 'A valid email is required so they can reply to you.' }, { status: 400 })
  if (!message || message.length < 5) return NextResponse.json({ error: 'Say a little about why you’re reaching out.' }, { status: 400 })

  const safety = await checkContentSafety([message])
  if (safety.flagged) {
    return NextResponse.json({ error: 'That message could not be sent. Try rewording it.' }, { status: 400 })
  }

  const profile = await prisma.directoryProfile.findUnique({ where: { id } })
  if (!profile || profile.deletedAt || !profile.visible) {
    return NextResponse.json({ error: 'That profile is no longer available.' }, { status: 404 })
  }

  const owner = await prisma.subscriber.findUnique({ where: { id: profile.subscriberId } })
  if (!owner) return NextResponse.json({ error: 'That profile is no longer available.' }, { status: 404 })

  await sendDirectoryIntroEmail({
    toEmail: owner.email,
    toName: profile.displayName,
    fromEmail,
    message,
  })

  return NextResponse.json({ ok: true })
}
