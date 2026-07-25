import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyUnsubscribeToken } from '@/lib/unsubscribeToken'

function page(message: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>OppIDX</title></head>
<body style="background:#f5f0e8;font-family:'Courier New',monospace;margin:0;padding:0;">
  <div style="max-width:480px;margin:80px auto;background:#faf6ee;border:2px solid #c0432a;padding:32px 28px;text-align:center;">
    <p style="color:#2b2620;font-size:15px;line-height:1.7;margin:0;">${message}</p>
    <a href="/" style="display:inline-block;margin-top:20px;color:#c0432a;font-size:13px;font-weight:bold;text-decoration:none;">← Back to OppIDX</a>
  </div>
</body>
</html>`
}

/** GET /api/subscribe/unsubscribe?token=... — clicked from a digest email.
 * Only ever flips unsubscribedFromDigest, never deletes the subscriber row
 * (that would also erase billing/referral history for a paid subscriber). */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') ?? ''
  const subscriberId = verifyUnsubscribeToken(token)

  if (!subscriberId) {
    return new NextResponse(page('That link is invalid or already used.'), {
      status: 400,
      headers: { 'Content-Type': 'text/html' },
    })
  }

  await prisma.subscriber.update({
    where: { id: subscriberId },
    data: { unsubscribedFromDigest: true },
  }).catch(() => null)

  return new NextResponse(page("You're unsubscribed from the daily digest. You won't get another one — everything else about your account stays the same."), {
    headers: { 'Content-Type': 'text/html' },
  })
}
