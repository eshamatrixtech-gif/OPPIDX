import { prisma } from '@/lib/db'
import { getCurrentPaidSubscriber } from '@/lib/subscriberSession'
import { FREE_SEARCH_LIMIT, PAYWALL_ENABLED } from '@/lib/limits'
import type { Opportunity } from '@/types'

// Below this, a company page would look thin — better to leave it out of
// the index/sitemap than publish a page with one or two listings on it.
// Checked against the real DB before picking this number: 96 companies
// clear it today, out of 1,013 distinct employers on the board.
const MIN_LISTINGS_FOR_PAGE = 3

export function slugifyCompany(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

/** Every company with enough real listings to earn its own page, most-listed first. */
export async function getCompanyList(): Promise<{ org: string; slug: string; count: number }[]> {
  const rows = await prisma.opportunity.groupBy({
    by: ['org'],
    where: { verified: true, deletedAt: null, org: { not: null } },
    _count: { _all: true },
  })

  return rows
    .filter(r => r.org && r._count._all >= MIN_LISTINGS_FOR_PAGE)
    .map(r => ({ org: r.org!, slug: slugifyCompany(r.org!), count: r._count._all }))
    .sort((a, b) => b.count - a.count)
}

/** Resolves a URL slug back to the real org name it was derived from — slugs
 * are computed on the fly (no stored column), so this re-slugifies every
 * distinct org and finds the match, same approach as the getCompanyList sort. */
export async function getCompanyOpportunities(slug: string) {
  const distinctOrgs = await prisma.opportunity.findMany({
    where: { verified: true, deletedAt: null, org: { not: null } },
    distinct: ['org'],
    select: { org: true },
  })
  const match = distinctOrgs.find(r => r.org && slugifyCompany(r.org) === slug)
  if (!match?.org) return null

  const paidSubscriber = PAYWALL_ENABLED ? await getCurrentPaidSubscriber() : true
  const rows = await prisma.opportunity.findMany({
    where: { verified: true, deletedAt: null, org: match.org },
    orderBy: { addedAt: 'desc' },
  })
  if (rows.length < MIN_LISTINGS_FOR_PAGE) return null

  const total = rows.length
  const capped = paidSubscriber ? rows : rows.slice(0, FREE_SEARCH_LIMIT)
  const items = capped.map(r => ({ ...r, addedAt: r.addedAt.toISOString() })) as unknown as Opportunity[]
  const restricted = !paidSubscriber && total > items.length

  return { org: match.org, items, total, restricted }
}
