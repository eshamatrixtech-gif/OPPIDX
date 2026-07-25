import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { SITE_URL } from '@/lib/siteUrl'
import { getDailyPicks, AUDIENCE_LABEL } from '@/lib/dailyPicks'
import { sendTelegramMessage, escapeTelegramHtml, TELEGRAM_CHANNEL_URL } from '@/lib/telegram'
import { sendDiscordMessage, escapeDiscordMarkdown, DISCORD_INVITE_URL } from '@/lib/discord'
import { getActiveSponsorSlot } from '@/lib/sponsor'
import { snapshotDailyDigest, todayDateString } from '@/lib/dailyDigest'
import { sendDailyDigestEmail } from '@/lib/email'

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

  // Durable, shareable web page for today's picks — see /newsletter.
  // Independent of the Telegram/Discord sends below; a failure here never
  // blocks the actual distribution.
  await snapshotDailyDigest(items.map(o => o.id)).catch(err => {
    console.error('[social-digest] snapshot failed:', err)
  })

  // A manually-booked sponsor line (see lib/sponsor.ts) — no self-serve
  // purchase flow, just a row someone added from /admin after an off-platform
  // deal. Silently absent (not an error) on every ordinary day.
  const sponsor = await getActiveSponsorSlot()
  const digestUrl = `${SITE_URL}/newsletter/${todayDateString()}`

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
  const telegramFooter = `<a href="${digestUrl}">See today's digest online →</a> · <a href="${SITE_URL}/browse">Full board →</a> · <a href="${DISCORD_INVITE_URL}">Discord →</a>`
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
  const discordFooter = `[See today's digest online →](${digestUrl}) · [Full board →](${SITE_URL}/browse) · [Telegram →](${TELEGRAM_CHANNEL_URL})`
  let discordMessage = `✦ **Today's picks from OppIDX**\n\n${discordSponsorLine}${discordLines.join('\n\n')}\n\n${discordFooter}`
  // Discord's webhook content field caps at 2000 chars, tighter than Telegram's.
  if (discordMessage.length > 1900) {
    discordMessage = `${discordMessage.slice(0, 1880 - discordFooter.length)}…\n\n${discordFooter}`
  }

  const [telegramSent, discordSent] = await Promise.all([
    sendTelegramMessage(telegramMessage),
    sendDiscordMessage(discordMessage),
  ])

  // ── Email (real subscribers, not Telegram/Discord followers) ──
  // No-ops entirely (not an error) if RESEND_API_KEY isn't configured in
  // this environment, same as every other distribution channel above.
  let emailsSent = 0
  if (process.env.RESEND_API_KEY) {
    const [totalOpportunities, newLast24h, subscribers] = await Promise.all([
      prisma.opportunity.count({ where: { verified: true, deletedAt: null } }),
      prisma.opportunity.count({
        where: { verified: true, deletedAt: null, addedAt: { gte: new Date(Date.now() - 24 * 60 * 60_000) } },
      }),
      prisma.subscriber.findMany({ where: { unsubscribedFromDigest: false }, select: { id: true, email: true } }),
    ])

    const dateLabel = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
    const picks = items.map(o => ({ title: o.title, org: o.org, id: o.id }))

    // Sequential, not Promise.all — this is a plain loop over individual
    // sends (fine at current subscriber counts), not a batch API call. One
    // recipient's failure is logged and skipped rather than aborting the
    // rest of the run.
    for (const sub of subscribers) {
      try {
        await sendDailyDigestEmail(sub.id, sub.email, { dateLabel, totalOpportunities, newLast24h, picks })
        emailsSent++
      } catch (err) {
        console.error('[social-digest] email failed for', sub.email, err)
      }
    }
  }

  return NextResponse.json({ count: items.length, telegramSent, discordSent, emailsSent, sponsored: !!sponsor })
}
