import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { rateLimit } from '@/lib/rateLimit'
import { getClientIp } from '@/lib/ip'
import { getCurrentSubscriber, createSubscriberSession } from '@/lib/subscriberSession'
import { checkContentSafety } from '@/lib/mayatara/moderation.ai'
import { isUniqueConstraintError } from '@/lib/isUniqueConstraintError'

const VALID_LOOKING_FOR = ['friend', 'dating', 'cofounder']

function isPlausibleEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) && s.length <= 320
}

/** GET /api/directory — every visible, opted-in profile, optionally
 * narrowed by ?tag=. Never includes contact info — a profile only ever
 * exposes displayName/lookingFor/bio; reaching someone goes through
 * POST /api/directory/[id]/connect instead. */
export async function GET(req: NextRequest) {
  const tag = req.nextUrl.searchParams.get('tag')?.trim().toLowerCase()

  let rows: Awaited<ReturnType<typeof prisma.directoryProfile.findMany>>
  try {
    rows = await prisma.directoryProfile.findMany({
      where: { visible: true, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 200,
    })
  } catch {
    // Same degrade-to-empty rule as lib/directoryMap.ts's fetchDirectoryPool
    // — a database that hasn't picked up this migration yet just shows an
    // empty directory, not a broken page.
    return NextResponse.json({ items: [] })
  }

  const items = rows
    .filter(r => !tag || r.tags.toLowerCase().includes(tag) || r.bio.toLowerCase().includes(tag))
    .map(r => ({
      id: r.id,
      displayName: r.displayName,
      lookingFor: r.lookingFor.split(',').map(s => s.trim()).filter(Boolean),
      tags: r.tags.split(',').map(s => s.trim()).filter(Boolean),
      bio: r.bio,
      createdAt: r.createdAt,
    }))

  return NextResponse.json({ items })
}

/**
 * POST /api/directory — join the directory (create your own profile; one
 * per subscriber, same lightweight email-based identity as /api/saved).
 * The bio is the one open free-text field here, so it's the one that runs
 * through moderation before anything is stored.
 */
export async function POST(req: NextRequest) {
  const rl = rateLimit(`directory-join:${getClientIp(req)}`, 60_000, 5)
  if (!rl.ok) return NextResponse.json({ error: 'Slow down.' }, { status: 429 })

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const displayName = typeof body.displayName === 'string' ? body.displayName.trim().slice(0, 60) : ''
  const bio = typeof body.bio === 'string' ? body.bio.trim().slice(0, 500) : ''
  const tags = typeof body.tags === 'string' ? body.tags.trim().slice(0, 200) : ''
  const lookingFor = Array.isArray(body.lookingFor)
    ? body.lookingFor.filter((v: unknown) => typeof v === 'string' && VALID_LOOKING_FOR.includes(v))
    : []

  if (!displayName) return NextResponse.json({ error: 'A display name is required.' }, { status: 400 })
  if (lookingFor.length === 0) return NextResponse.json({ error: 'Pick at least one of friend, dating, or cofounder.' }, { status: 400 })

  const safety = await checkContentSafety([displayName, bio, tags])
  if (safety.flagged) {
    return NextResponse.json({ error: 'That profile could not be submitted. Try rewording it.' }, { status: 400 })
  }

  let subscriber = await getCurrentSubscriber()

  if (!subscriber) {
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    if (!isPlausibleEmail(email)) {
      return NextResponse.json({ error: 'needsEmail' }, { status: 401 })
    }
    try {
      subscriber = await prisma.subscriber.create({ data: { email } })
    } catch (err) {
      if (isUniqueConstraintError(err)) {
        subscriber = await prisma.subscriber.findUnique({ where: { email } })
      } else {
        throw err
      }
    }
    if (!subscriber) return NextResponse.json({ error: 'Could not create a session.' }, { status: 500 })
    await createSubscriberSession(subscriber.id)
  }

  const profile = await prisma.directoryProfile.upsert({
    where: { subscriberId: subscriber.id },
    update: { displayName, bio, tags, lookingFor: lookingFor.join(','), visible: true, deletedAt: null },
    create: { subscriberId: subscriber.id, displayName, bio, tags, lookingFor: lookingFor.join(',') },
  })

  return NextResponse.json({ ok: true, id: profile.id })
}
