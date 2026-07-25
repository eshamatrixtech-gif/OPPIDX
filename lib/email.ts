import { Resend } from 'resend'
import { signUnsubscribeToken } from '@/lib/unsubscribeToken'
import { SITE_URL } from '@/lib/siteUrl'

// Separate from lib/mayatara/email.ts on purpose — same Resend account and
// free tier, but a different FROM identity and template voice for OppIDX
// proper vs. the Mayatara sub-brand.
const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.EMAIL_FROM || 'OppIDX <onboarding@resend.dev>'

export interface DailyDigestEmailData {
  dateLabel: string
  totalOpportunities: number
  newLast24h: number
  picks: { title: string; org: string | null; id: string }[]
}

/**
 * Sends the same daily-digest content already posted to Telegram/Discord
 * and shown on /newsletter — the actual email delivery channel that never
 * existed until now. Every send gets its own unsubscribe link (required,
 * not optional — never ship a marketing/content email without a working
 * one), and only ever flips Subscriber.unsubscribedFromDigest, never
 * deletes the row.
 */
export async function sendDailyDigestEmail(subscriberId: string, toEmail: string, digest: DailyDigestEmailData) {
  const unsubscribeUrl = `${SITE_URL}/api/subscribe/unsubscribe?token=${signUnsubscribeToken(subscriberId)}`

  const picksHtml = digest.picks.map(p => `
    <div style="margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid #e0d6c4;">
      <a href="${SITE_URL}/opportunities/${p.id}" style="color:#c0432a;font-weight:bold;font-size:14px;text-decoration:none;">${p.title}</a>
      ${p.org ? `<div style="color:#5b5346;font-size:12.5px;margin-top:2px;">${p.org}</div>` : ''}
    </div>`).join('')

  await resend.emails.send({
    from: FROM,
    to: toEmail,
    subject: `Today's picks from OppIDX — ${digest.dateLabel}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background:#f5f0e8;font-family:'Courier New',monospace;margin:0;padding:0;">
  <div style="max-width:480px;margin:40px auto;background:#faf6ee;border:2px solid #c0432a;padding:32px 28px;">
    <div style="color:#2b2620;font-size:20px;font-weight:bold;letter-spacing:2px;margin-bottom:6px;">OPPIDX DAILY</div>
    <div style="color:#5b5346;font-size:13px;margin-bottom:22px;">${digest.dateLabel}</div>

    <div style="display:table;width:100%;margin-bottom:24px;">
      <div style="display:table-cell;text-align:center;">
        <div style="color:#c0432a;font-size:22px;font-weight:bold;">${digest.totalOpportunities.toLocaleString()}</div>
        <div style="color:#5b5346;font-size:10.5px;text-transform:uppercase;">On the board</div>
      </div>
      <div style="display:table-cell;text-align:center;">
        <div style="color:#c0432a;font-size:22px;font-weight:bold;">${digest.newLast24h}</div>
        <div style="color:#5b5346;font-size:10.5px;text-transform:uppercase;">Added in 24h</div>
      </div>
    </div>

    ${picksHtml}

    <a href="${SITE_URL}/browse" style="display:inline-block;margin-top:8px;padding:11px 20px;background:#c0432a;color:#faf6ee;text-decoration:none;font-weight:bold;font-size:13px;">
      See the full board →
    </a>

    <p style="color:#5b5346;font-size:11px;margin:28px 0 0;line-height:1.6;">
      Real, hand-verified opportunities — no hype, no fake urgency.
      <br><a href="${unsubscribeUrl}" style="color:#5b5346;">Unsubscribe from this digest</a>
    </p>
  </div>
</body>
</html>`,
  })
}

export async function sendInstitutionVerificationEmail(toEmail: string, verifyUrl: string) {
  await resend.emails.send({
    from: FROM,
    to: toEmail,
    subject: 'Verify your email for OppIDX',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background:#F4EEDD;font-family:'Courier New',monospace;margin:0;padding:0;">
  <div style="max-width:480px;margin:40px auto;background:#FAF4E4;border:2px solid #C4A45A;padding:32px 28px;">
    <p style="color:#2B2620;font-size:15px;line-height:1.7;margin:0 0 20px;">
      Click below to verify <strong>${toEmail}</strong> on OppIDX. This proves you control the address — it'll show on your profile so others can judge it for themselves.
    </p>
    <a href="${verifyUrl}" style="display:inline-block;padding:12px 22px;background:#8B4513;color:#FAF0D7;text-decoration:none;font-weight:bold;font-size:13px;">
      Verify email →
    </a>
    <p style="color:#6B5B3E;font-size:12px;margin:24px 0 0;">
      Didn't request this? Ignore this email — nothing happens unless you click the link.
    </p>
  </div>
</body>
</html>`,
  })
}
