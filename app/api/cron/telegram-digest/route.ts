import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { SITE_URL } from '@/lib/siteUrl'
import { sendTelegramMessage, escapeTelegramHtml } from '@/lib/telegram'

const MAX_LISTED = 8

const AUDIENCE_LABEL: Record<string, string> = {
  STUDENT: 'Student',
  EARLY_CAREER: 'Early Career',
  FOUNDER: 'Founder',
  GENERAL: 'General',
}

/**
 * GET /api/cron/telegram-digest — posts a daily message to the configured
 * Telegram channel/group listing opportunities added in the last 24 hours.
 * Skips sending (not an error) if there's nothing new, or if the bot isn't
 * configured yet. Same shared-secret auth pattern as the other crons — see
 * .github/workflows/telegram-digest-cron.yml for the schedule.
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

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const [items, total] = await Promise.all([
    prisma.opportunity.findMany({
      where: { verified: true, deletedAt: null, addedAt: { gte: since } },
      orderBy: { addedAt: 'desc' },
      take: MAX_LISTED,
    }),
    prisma.opportunity.count({
      where: { verified: true, deletedAt: null, addedAt: { gte: since } },
    }),
  ])

  if (total === 0) {
    return NextResponse.json({ sent: false, reason: 'no new listings in the last 24h' })
  }

  const lines = items.map(o => {
    const audience = AUDIENCE_LABEL[o.audience] ?? o.audience
    const meta = [audience, o.difficulty, o.location].filter(Boolean).join(' · ')
    const org = o.org ? `${escapeTelegramHtml(o.org)}\n` : ''
    return `<b>${escapeTelegramHtml(o.title)}</b>\n${org}${escapeTelegramHtml(meta)}\n<a href="${SITE_URL}/opportunities/${o.id}">View &amp; apply →</a>`
  })

  const extra = total > items.length ? `\n\n+${total - items.length} more new today — <a href="${SITE_URL}/browse">see the full board →</a>` : ''

  let message = `🎯 <b>New on OppIDX today</b>\n\n${lines.join('\n\n')}${extra}`
  // Telegram's sendMessage caps at 4096 chars — stay well clear of it.
  if (message.length > 4000) message = `${message.slice(0, 3980)}…\n\n<a href="${SITE_URL}/browse">See the full board →</a>`

  const sent = await sendTelegramMessage(message)
  return NextResponse.json({ sent, count: items.length, total })
}
