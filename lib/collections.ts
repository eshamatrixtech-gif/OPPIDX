import { prisma } from '@/lib/db'
import { listOrEmpty } from '@/lib/buildParams'
import { matchPool } from '@/lib/opportunityPool'
import { getCurrentPaidSubscriber } from '@/lib/subscriberSession'
import { FREE_SEARCH_LIMIT, PAYWALL_ENABLED } from '@/lib/limits'
import { COLLECTION_DEFS, getCollectionDef, type CollectionDef } from '@/lib/collectionDefs'
import { getGeneratedCombos } from '@/lib/collectionCombos'
import type { Opportunity } from '@/types'

/** Single-dimension defs plus every generated combo that cleared the real
 * listing-count threshold — the full, current set of collection pages.
 *
 * The static defs need no database, so an unreachable one costs the combos
 * and nothing else: the core collections still render. */
export async function getAllCollectionDefs(): Promise<CollectionDef[]> {
  const combos = await listOrEmpty('getGeneratedCombos', getGeneratedCombos)
  return [...COLLECTION_DEFS, ...combos]
}

/** Looks up a slug across both the static defs and the generated combos —
 * a combo slug (e.g. "remote-ai-and-machine-learning") only exists here,
 * not in the static list, so the plain getCollectionDef() lookup misses it. */
export async function resolveCollectionDef(slug: string): Promise<CollectionDef | undefined> {
  return getCollectionDef(slug) ?? (await getGeneratedCombos()).find(c => c.slug === slug)
}

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
/**
 * The most listings a collection page renders.
 *
 * Previously uncapped, so /collections/students emitted 485 full cards and
 * /collections/early-career would emit over a thousand. That's a multi-
 * megabyte HTML document nobody scrolls to the end of, and at build time it
 * was a meaningful share of the per-page export budget. `total` below is
 * still the real, uncapped count, so the page keeps telling the truth about
 * how many exist — it just links to /browse for the rest.
 */
const MAX_ITEMS_PER_PAGE = 96

export async function getCollectionOpportunities(def: CollectionDef) {
  const paidSubscriber = PAYWALL_ENABLED ? await getCurrentPaidSubscriber() : true

  // Match against the cached, minimal pool rather than re-reading every
  // column of every row on this page — see lib/opportunityPool.ts. Only the
  // handful of rows actually being rendered get fetched in full below.
  const pool = await matchPool()
  const matchedIds = pool.filter(def.match).map(r => r.id)
  const total = matchedIds.length

  const limit = paidSubscriber ? MAX_ITEMS_PER_PAGE : Math.min(FREE_SEARCH_LIMIT, MAX_ITEMS_PER_PAGE)
  const visibleIds = matchedIds.slice(0, limit)

  const rows = visibleIds.length
    ? await prisma.opportunity.findMany({
        where: { id: { in: visibleIds } },
        orderBy: { addedAt: 'desc' },
      })
    : []

  const items = rows.map(r => ({ ...r, addedAt: r.addedAt.toISOString() })) as unknown as Opportunity[]
  // True whenever the paywall is holding something back — deliberately not
  // set merely because the display cap is in effect, since that isn't a
  // restriction and the page shouldn't offer to sell its way past it.
  const restricted = !paidSubscriber && total > items.length

  return { items, total, restricted }
}
