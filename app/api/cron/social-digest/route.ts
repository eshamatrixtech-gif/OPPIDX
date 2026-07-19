import { NextRequest, NextResponse } from 'next/server'
import { SITE_URL } from '@/lib/siteUrl'
import { getDailyPicks, AUDIENCE_LABEL } from '@/lib/dailyPicks'
import { sendTelegramMessage, escapeTelegramHtml, TELEGRAM_CHANNEL_URL } from '@/lib/telegram'
import { sendDiscordMessage, escapeDiscordMarkdown, DISCORD_INVITE_URL } from '@/lib/discord'
import { getActiveSponsorSlot } from '@/lib/sponsor'

/**
 * GET /api/cron/social-digest — posts today's random pick (see
 * lib/dailyPicks.ts) to every configured distribution channel. Each
 * channel independently no-ops (not an error) if its own env vars aren't
 * set yet, so adding a new platform here never requires the others to be
 * configured too.
 *
 * Every message ends with a link back to the site — this is a
 * distribution channel meant to drive traffic to OppIDX, not a bypass of
 * it. Same shared-secret auth pattern as the other crons — see
 * .github/workflows/social-digest-cron.yml for the schedule.
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

  const items = await getDailyPicks()
  if (items.length === 0) {
    return NextResponse.json({ sent: false, reason: 'nothing to pick from' })
  }

  // A manually-booked sponsor line (see lib/sponsor.ts) — no self-serve
  // purchase flow, just a row someone added from /admin after an off-platform
  // deal. Silently absent (not an error) on every ordinary day.
  const sponsor = await getActiveSponsorSlot()

  // ── Telegram (HTML) ──
  const telegramLines = items.map(o => {
    const audience = AUDIENCE_LABEL[o.audience] ?? o.audience
    const meta = [audience, o.difficulty, o.location].filter(Boolean).join(' · ')
    const org = o.org ? `${escapeTelegramHtml(o.org)}\n` : ''
    return `<b>${escapeTelegramHtml(o.title)}</b>\n${org}${escapeTelegramHtml(meta)}\n<a href="${SITE_URL}/opportunities/${o.id}">View &amp; apply →</a>`
  })
  const telegramSponsorLine = sponsor
    ? `<i>Today's picks brought to you by <a href="${sponsor.sponsorUrl}">${escapeTelegramHtml(sponsor.sponsorName)}</a> — ${escapeTelegramHtml(sponsor.tagline)}</i>\n\n`
    : ''
  const telegramFooter = `<a href="${SITE_URL}/browse">See the full board →</a> · <a href="${DISCORD_INVITE_URL}">Join us on Discord →</a>`
  let telegramMessage = `✦ <b>Today's picks from OppIDX</b>\n\n${telegramSponsorLine}${telegramLines.join('\n\n')}\n\n${telegramFooter}`
  if (telegramMessage.length > 4000) {
    telegramMessage = `${telegramMessage.slice(0, 3980 - telegramFooter.length)}…\n\n${telegramFooter}`
  }

  // ── Discord (Markdown) ──
  const discordLines = items.map(o => {
    const audience = AUDIENCE_LABEL[o.audience] ?? o.audience
    const meta = [audience, o.difficulty, o.location].filter(Boolean).join(' · ')
    const org = o.org ? `${escapeDiscordMarkdown(o.org)}\n` : ''
    return `**${escapeDiscordMarkdown(o.title)}**\n${org}${escapeDiscordMarkdown(meta)}\n[View & apply →](${SITE_URL}/opportunities/${o.id})`
  })
  const discordSponsorLine = sponsor
    ? `*Today's picks brought to you by [${escapeDiscordMarkdown(sponsor.sponsorName)}](${sponsor.sponsorUrl}) — ${escapeDiscordMarkdown(sponsor.tagline)}*\n\n`
    : ''
  const discordFooter = `[See the full board →](${SITE_URL}/browse) · [Join us on Telegram →](${TELEGRAM_CHANNEL_URL})`
  let discordMessage = `✦ **Today's picks from OppIDX**\n\n${discordSponsorLine}${discordLines.join('\n\n')}\n\n${discordFooter}`
  // Discord's webhook content field caps at 2000 chars, tighter than Telegram's.
  if (discordMessage.length > 1900) {
    discordMessage = `${discordMessage.slice(0, 1880 - discordFooter.length)}…\n\n${discordFooter}`
  }

  const [telegramSent, discordSent] = await Promise.all([
    sendTelegramMessage(telegramMessage),
    sendDiscordMessage(discordMessage),
  ])

  return NextResponse.json({ count: items.length, telegramSent, discordSent, sponsored: !!sponsor })
}
