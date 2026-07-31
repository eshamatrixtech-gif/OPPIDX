import { prisma } from '@/lib/db'
import { getCurrentPaidSubscriber } from '@/lib/subscriberSession'
import { FREE_SEARCH_LIMIT, PAYWALL_ENABLED } from '@/lib/limits'
import type { CollectionDef } from '@/lib/collectionDefs'
import type { Opportunity } from '@/types'

/**
 * Shared fetch for /collections/[slug] pages — same free-tier cap as
 * /browse and the RSS feed, so a collection page can't become an
 * unauthenticated back door around the paywall.
 *
 * Filters in JS rather than pushing every definition into SQL: the board
 * is ~1,800 verified rows (cheap to pull in full), and several collection
 * definitions match on OR'd substrings across a free-text tags column,
 * which SQLite has no clean way to express directly. Every other page that
 * does cross-row matching against the tags column (JobPosting eligibility,
 * the Pulse/Gathering/Resource edges) already follows this same pattern.
 */
export async function getCollectionOpportunities(def: CollectionDef) {
  const paidSubscriber = PAYWALL_ENABLED ? await getCurrentPaidSubscriber() : true

  const rows = await prisma.opportunity.findMany({
    where: { verified: true, deletedAt: null },
    orderBy: { addedAt: 'desc' },
  })

  const matched = rows.filter(def.match)
  const total = matched.length
  const capped = paidSubscriber ? matched : matched.slice(0, FREE_SEARCH_LIMIT)

  const items = capped.map(r => ({ ...r, addedAt: r.addedAt.toISOString() })) as unknown as Opportunity[]
  const restricted = !paidSubscriber && total > items.length

  return { items, total, restricted }
}
