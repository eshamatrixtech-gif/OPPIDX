import { Resend } from 'resend'
import { signUnsubscribeToken } from '@/lib/unsubscribeToken'
import { SITE_URL } from '@/lib/siteUrl'

// Separate from lib/mayatara/email.ts on purpose — same Resend account and
// free tier, but a different FROM identity and template voice for OppIDX
// proper vs. the Mayatara sub-brand. Exported (not just used internally) so
// the webhook route can call resend.webhooks.verify with the same client.
export const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.EMAIL_FROM || 'OppIDX <onboarding@resend.dev>'

// Resend's batch endpoint caps at 100 emails per call — chunk rather than
// assume the subscriber list always fits in one request.
const BATCH_SIZE = 100

export interface WeeklyDigestEmailData {
  weekRangeLabel: string
  totalOpportunities: number
  newLast7Days: number
  topPicks: { title: string; org: string | null; id: string }[]
}

function weeklyDigestHtml(digest: WeeklyDigestEmailData, unsubscribeUrl: string): string {
  const picksHtml = digest.topPicks.map((p, i) => `
    <div style="margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid #e0d6c4;">
      <span style="color:#5b5346;font-size:12px;font-weight:bold;">${i + 1}.</span>
      <a href="${SITE_URL}/opportunities/${p.id}" style="color:#c0432a;font-weight:bold;font-size:14px;text-decoration:none;">${p.title}</a>
      ${p.org ? `<div style="color:#5b5346;font-size:12.5px;margin-top:2px;margin-left:16px;">${p.org}</div>` : ''}
    </div>`).join('')

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background:#f5f0e8;font-family:'Courier New',monospace;margin:0;padding:0;">
  <div style="max-width:480px;margin:40px auto;background:#faf6ee;border:2px solid #c0432a;padding:32px 28px;">
    <div style="color:#2b2620;font-size:20px;font-weight:bold;letter-spacing:2px;margin-bottom:6px;">OPPIDX WEEKLY</div>
    <div style="color:#5b5346;font-size:13px;margin-bottom:4px;">${digest.weekRangeLabel}</div>
    <div style="color:#2b2620;font-size:14px;font-weight:bold;margin-bottom:22px;">This week's top ${digest.topPicks.length} opportunities</div>

    <div style="display:table;width:100%;margin-bottom:24px;">
      <div style="display:table-cell;text-align:center;">
        <div style="color:#c0432a;font-size:22px;font-weight:bold;">${digest.totalOpportunities.toLocaleString()}</div>
        <div style="color:#5b5346;font-size:10.5px;text-transform:uppercase;">On the board</div>
      </div>
      <div style="display:table-cell;text-align:center;">
        <div style="color:#c0432a;font-size:22px;font-weight:bold;">${digest.newLast7Days}</div>
        <div style="color:#5b5346;font-size:10.5px;text-transform:uppercase;">Added this week</div>
      </div>
    </div>

    <!-- Launch-week Product Hunt promo — remove this block once the launch
         push is over, since weeklyDigestHtml fires on every future send and
         this would otherwise keep announcing a "live today" launch forever. -->
    <div style="margin-bottom:22px;padding:16px;background:#faf6ee;border:1px solid #c0432a;text-align:center;">
      <img src="https://ph-files.imgix.net/7f6b2119-bdc3-4ff3-a9d5-4699a2a9903d.png?auto=compress,format&codec=mozjpeg&cs=strip&fit=crop&h=80&w=80" alt="OppIDX" width="48" height="48" style="border-radius:8px;display:block;margin:0 auto 8px;">
      <div style="color:#2b2620;font-size:14px;font-weight:bold;margin-bottom:4px;">We're live on Product Hunt today</div>
      <div style="color:#5b5346;font-size:12px;margin-bottom:12px;">If OppIDX has been useful, an upvote helps more students find it.</div>
      <a href="https://www.producthunt.com/products/oppidx?embed=true&utm_source=embed&utm_medium=post_embed" style="display:inline-block;padding:8px 16px;background:#ff6154;color:#ffffff;text-decoration:none;border-radius:4px;font-size:12.5px;font-weight:bold;">
        Check it out on Product Hunt →
      </a>
    </div>

    ${picksHtml}

    <a href="${SITE_URL}/browse" style="display:inline-block;margin-top:8px;padding:11px 20px;background:#c0432a;color:#faf6ee;text-decoration:none;font-weight:bold;font-size:13px;">
      See the full board →
    </a>

    <p style="color:#5b5346;font-size:12px;margin:20px 0 0;line-height:1.6;">
      Also this week: <a href="${SITE_URL}/mayatara/pulse" style="color:#c0432a;">Mayatara Pulse</a> — a daily, apolitical read on real government and regulatory action, written from real headlines.
    </p>

    <p style="color:#5b5346;font-size:11px;margin:20px 0 0;line-height:1.6;">
      Real, hand-verified opportunities — ranked by genuine views, not hype or fake urgency.
      <br><a href="${unsubscribeUrl}" style="color:#5b5346;">Unsubscribe from this weekly email</a>
    </p>
  </div>
</body>
</html>`
}

export interface DigestRecipient {
  subscriberId: string
  email: string
}

export interface DigestSendResult {
  subscriberId: string
  resendId: string | null
  error: string | null
}

/**
 * Sends the week's top-10-by-real-viewcount opportunities to every
 * recipient in one batch call per 100 (Resend's own limit) instead of one
 * request per subscriber — fewer round trips, and 'permissive' validation
 * means one bad address in a batch doesn't block the other 99. Every send
 * still gets its own unsubscribe link; the caller (the weekly cron) is
 * responsible for logging each result against DigestEmailLog for
 * idempotency and webhook correlation. This is deliberately the only
 * recurring email OppIDX sends — no daily email, by design.
 */
export async function sendWeeklyDigestBatch(
  recipients: DigestRecipient[],
  digest: WeeklyDigestEmailData
): Promise<DigestSendResult[]> {
  const results: DigestSendResult[] = []

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const chunk = recipients.slice(i, i + BATCH_SIZE)
    const payload = chunk.map(r => ({
      from: FROM,
      to: r.email,
      subject: `This week's top opportunities from OppIDX — ${digest.weekRangeLabel}`,
      html: weeklyDigestHtml(digest, `${SITE_URL}/api/subscribe/unsubscribe?token=${signUnsubscribeToken(r.subscriberId)}`),
    }))

    try {
      const { data, error } = await resend.batch.send(payload, { batchValidation: 'permissive' })
      if (error) {
        chunk.forEach(r => results.push({ subscriberId: r.subscriberId, resendId: null, error: error.message }))
        continue
      }
      const permissiveErrors = new Map((data as { errors?: { index: number; message: string }[] })?.errors?.map(e => [e.index, e.message]) ?? [])
      chunk.forEach((r, idx) => {
        const errMsg = permissiveErrors.get(idx)
        results.push({
          subscriberId: r.subscriberId,
          resendId: errMsg ? null : data?.data[idx]?.id ?? null,
          error: errMsg ?? null,
        })
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown'
      chunk.forEach(r => results.push({ subscriberId: r.subscriberId, resendId: null, error: message }))
    }
  }

  return results
}

export async function sendWelcomeEmail(toEmail: string) {
  await resend.emails.send({
    from: FROM,
    to: toEmail,
    subject: "You're on the list — OppIDX",
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background:#f5f0e8;font-family:'Courier New',monospace;margin:0;padding:0;">
  <div style="max-width:480px;margin:40px auto;background:#faf6ee;border:2px solid #c0432a;padding:32px 28px;">
    <div style="color:#2b2620;font-size:20px;font-weight:bold;letter-spacing:2px;margin-bottom:16px;">WELCOME TO OPPIDX</div>
    <p style="color:#2b2620;font-size:14px;line-height:1.7;margin:0 0 20px;">
      You're on the list for the weekly email — the real top 10 opportunities of the week, ranked by genuine views, once a week. No hype, no fake urgency, no inflated numbers. Just what's actually there.
    </p>
    <a href="${SITE_URL}/browse" style="display:inline-block;padding:11px 20px;background:#c0432a;color:#faf6ee;text-decoration:none;font-weight:bold;font-size:13px;">
      Browse the board now →
    </a>
    <p style="color:#5b5346;font-size:11px;margin:28px 0 0;line-height:1.6;">
      Didn't expect this? You (or someone with your email) signed up at oppidx.com — reply and let us know if that wasn't you.
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
