import webpush from 'web-push'
import { prisma } from '@/lib/db'
import { SITE_URL } from '@/lib/siteUrl'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY
const configured = Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY)

if (configured) {
  webpush.setVapidDetails('mailto:hello@oppidx.com', VAPID_PUBLIC_KEY!, VAPID_PRIVATE_KEY!)
}

// At most one push per subscriber per window, even if several scrape passes
// in that time each turn up a match — a "new opportunity" ping every hour
// would be worse than no notifications at all.
const NOTIFY_THROTTLE_MS = 6 * 60 * 60 * 1000

type NewOpportunity = { id: string; audience: string }

/**
 * Sends a push to every subscriber whose saved opportunities share an
 * audience with at least one newly added opportunity. Never throws — a
 * failed or expired push subscription is cleaned up, not treated as an
 * error that should interrupt the scrape cron that calls this.
 */
export async function notifyMatchingSubscribers(newOpportunities: NewOpportunity[]) {
  if (!configured || newOpportunities.length === 0) return

  const subscriptions = await prisma.pushSubscription.findMany()
  if (subscriptions.length === 0) return

  for (const sub of subscriptions) {
    if (sub.lastNotifiedAt && Date.now() - sub.lastNotifiedAt.getTime() < NOTIFY_THROTTLE_MS) continue

    const saved = await prisma.savedOpportunity.findMany({
      where: { subscriberId: sub.subscriberId },
      select: { opportunityId: true },
    })
    if (saved.length === 0) continue

    const savedOpps = await prisma.opportunity.findMany({
      where: { id: { in: saved.map(s => s.opportunityId) } },
      select: { audience: true },
    })
    const interestedAudiences = new Set(savedOpps.map(o => o.audience))
    const matchCount = newOpportunities.filter(o => interestedAudiences.has(o.audience)).length
    if (matchCount === 0) continue

    const payload = JSON.stringify({
      title: 'New on OppIDX',
      body: `${matchCount} new opportunit${matchCount === 1 ? 'y matches' : 'ies match'} what you've saved.`,
      url: `${SITE_URL}/browse`,
    })

    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      )
      await prisma.pushSubscription.update({ where: { id: sub.id }, data: { lastNotifiedAt: new Date() } })
    } catch (err: unknown) {
      const statusCode = (err as { statusCode?: number })?.statusCode
      if (statusCode === 404 || statusCode === 410) {
        // Browser unsubscribed or the push service expired it — stop trying.
        await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {})
      } else {
        console.error(`[push] send failed for subscription=${sub.id}:`, err)
      }
    }
  }
}
