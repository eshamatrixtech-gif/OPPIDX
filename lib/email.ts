import { Resend } from 'resend'

// Separate from lib/mayatara/email.ts on purpose — same Resend account and
// free tier, but a different FROM identity and template voice for OppIDX
// proper vs. the Mayatara sub-brand.
const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.EMAIL_FROM || 'OppIDX <onboarding@resend.dev>'

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
