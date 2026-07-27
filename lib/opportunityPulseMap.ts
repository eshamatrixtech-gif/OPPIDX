import { prisma } from '@/lib/db'
import { PULSE_OPPORTUNITY_KEYWORDS } from '@/lib/mayatara/pulseOpportunityMap'
import type { DigestItem } from '@/lib/policyDigest/generate'

/**
 * The reverse of lib/mayatara/pulseOpportunityMap.ts — given an
 * opportunity, which real Pulse policy categories are genuinely relevant
 * to it (the fourth graph edge: Opportunities → Policy, after Resources,
 * Gatherings, and the existing Policy → Opportunities edge that already
 * runs the other way on Pulse category pages). Same narrow keyword rule:
 * a listing with nothing genuinely policy-relevant matches no category.
 */
function relatedPulseCategories(opp: { tags: string; audience: string }): string[] {
  const haystack = `${opp.tags} ${opp.audience}`.toLowerCase()
  const categories: string[] = []
  for (const [category, keywords] of Object.entries(PULSE_OPPORTUNITY_KEYWORDS)) {
    if (keywords.some(k => haystack.includes(k.toLowerCase()))) categories.push(category)
  }
  return categories
}

export interface PolicyRead extends DigestItem {
  period: string
}

/** One query for the whole page of cards — the last two weeks of daily
 * digests, each already storing its real headline items (title, url,
 * category, source) at generation time (lib/policyDigest/generate.ts).
 * Same degrade-to-empty guard as this file's siblings (fetchDirectoryPool,
 * fetchUpcomingGatheringsPool) — a database or connection issue here
 * should never take down the whole feed. */
export async function fetchRecentPolicyItemsPool(): Promise<PolicyRead[]> {
  let digests: Awaited<ReturnType<typeof prisma.policyDigest.findMany>>
  try {
    digests = await prisma.policyDigest.findMany({
      where: { periodType: 'daily' },
      orderBy: { createdAt: 'desc' },
      take: 14,
    })
  } catch {
    return []
  }
  const items: PolicyRead[] = []
  for (const d of digests) {
    try {
      const parsed = JSON.parse(d.items) as DigestItem[]
      for (const it of parsed) items.push({ ...it, period: d.period })
    } catch {
      // malformed snapshot — skip rather than fail the whole pool
    }
  }
  return items
}

export function matchPolicyReadsFromPool(
  opp: { tags: string; audience: string },
  pool: PolicyRead[]
): PolicyRead[] {
  const categories = relatedPulseCategories(opp)
  if (categories.length === 0 || pool.length === 0) return []
  const set = new Set(categories)
  const seen = new Set<string>()
  const out: PolicyRead[] = []
  for (const item of pool) {
    if (!set.has(item.category) || seen.has(item.url)) continue
    seen.add(item.url)
    out.push(item)
    if (out.length >= 3) break
  }
  return out
}
