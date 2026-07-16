import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { SITE_URL } from '@/lib/siteUrl'
import { sendTelegramMessage, escapeTelegramHtml } from '@/lib/telegram'

const PICK_COUNT = 3

const AUDIENCE_LABEL: Record<string, string> = {
  STUDENT: 'Student',
  EARLY_CAREER: 'Early Career',
  FOUNDER: 'Founder',
  GENERAL: 'General',
}

/**
 * GET /api/cron/telegram-digest — posts a small, random daily pick (up to
 * PICK_COUNT) to the configured Telegram channel/group. Deliberately not a
 * dump of everything new — the board adds dozens of listings a day, and a
 * firehose digest would read as spam and cut against the "elite,
 * hand-curated" brand the rest of the site is built on. A few genuinely
 * worth-seeing picks a day is the actual goal.
 *
 * Skips sending (not an error) if there's nothing to pick from, or if the
 * bot isn't configured yet. Same shared-secret auth pattern as the other
 * crons — see .github/workflows/telegram-digest-cron.yml for the schedule.
 *
 * Links point at the OppIDX listing page, not the raw application URL
 * directly — this is a distribution channel meant to drive traffic to the
 * site, not a bypass of it.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Cron is not set up yet.' }, { status: 503 })
  }
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const total = await prisma.opportunity.count({ where: { verified: true, deletedAt: null } })
  if (total === 0) {
    return NextResponse.json({ sent: false, reason: 'nothing to pick from' })
  }

  // Random, distinct offsets — cheap way to sample a few rows out of a large
  // table without pulling the whole thing into memory just to shuffle it.
  const pickCount = Math.min(PICK_COUNT, total)
  const offsets = new Set<number>()
  while (offsets.size < pickCount) {
    offsets.add(Math.floor(Math.random() * total))
  }

  const picks = await Promise.all(
    [...offsets].map(skip =>
      prisma.opportunity.findFirst({
        where: { verified: true, deletedAt: null },
        orderBy: { id: 'asc' },
        skip,
      })
    )
  )
  const items = picks.filter((o): o is NonNullable<typeof o> => !!o)

  const lines = items.map(o => {
    const audience = AUDIENCE_LABEL[o.audience] ?? o.audience
    const meta = [audience, o.difficulty, o.location].filter(Boolean).join(' · ')
    const org = o.org ? `${escapeTelegramHtml(o.org)}\n` : ''
    return `<b>${escapeTelegramHtml(o.title)}</b>\n${org}${escapeTelegramHtml(meta)}\n<a href="${SITE_URL}/opportunities/${o.id}">View &amp; apply →</a>`
  })

  let message = `✦ <b>Today's picks from OppIDX</b>\n\n${lines.join('\n\n')}\n\n<a href="${SITE_URL}/browse">See the full board →</a>`
  // Telegram's sendMessage caps at 4096 chars — a 3-item pick never gets
  // close, but stay defensive in case of an unusually long description.
  if (message.length > 4000) message = `${message.slice(0, 3980)}…\n\n<a href="${SITE_URL}/browse">See the full board →</a>`

  const sent = await sendTelegramMessage(message)
  return NextResponse.json({ sent, count: items.length })
}
