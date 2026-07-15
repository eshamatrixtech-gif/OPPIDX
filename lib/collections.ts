import { prisma } from '@/lib/db'
import { getCurrentPaidSubscriber } from '@/lib/subscriberSession'
import { FREE_SEARCH_LIMIT } from '@/lib/limits'
import type { Opportunity } from '@/types'

/**
 * Shared fetch for /collections/* landing pages — same free-tier cap as
 * /browse and the RSS feed, so a collection page can't become an
 * unauthenticated back door around the paywall.
 */
export async function getCollectionOpportunities(audience: string) {
  const paidSubscriber = await getCurrentPaidSubscriber()
  const total = await prisma.opportunity.count({ where: { verified: true, deletedAt: null, audience } })

  const rows = await prisma.opportunity.findMany({
    where: { verified: true, deletedAt: null, audience },
    orderBy: { addedAt: 'desc' },
    take: paidSubscriber ? undefined : FREE_SEARCH_LIMIT,
  })

  const items = rows.map(r => ({ ...r, addedAt: r.addedAt.toISOString() })) as unknown as Opportunity[]
  const restricted = !paidSubscriber && total > items.length

  return { items, total, restricted }
}
