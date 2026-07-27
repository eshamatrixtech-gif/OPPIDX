import { prisma } from '@/lib/db'

/**
 * The people's directory — opt-in only (see the DirectoryProfile model
 * comment in prisma/schema.prisma for why). Matching a profile to an
 * opportunity uses the exact same keyword-matched, blank-if-nothing-real
 * pattern as lib/opportunityGatheringMap.ts: a profile's own `tags`
 * against the opportunity's tags/audience, nothing stretched.
 */
export interface DirectoryMatch {
  id: string
  displayName: string
  lookingFor: string[]
  bio: string
}

function directoryKeywords(opp: { tags: string; audience: string }): string[] {
  const keywords = new Set<string>()
  for (const raw of opp.tags.split(',')) {
    const t = raw.trim().toLowerCase()
    if (t.length >= 4) keywords.add(t)
  }
  if (opp.audience === 'FOUNDER') keywords.add('startup')
  if (opp.audience === 'STUDENT') keywords.add('student')
  return [...keywords].slice(0, 5)
}

/** One query for the whole page of cards — every visible, opted-in
 * profile, matched in memory afterward. The directory is small by
 * construction (it only ever grows one deliberate join at a time), so
 * this stays cheap without per-opportunity round-trips.
 *
 * Wrapped in try/catch the same way fetchUpcomingGatheringsPool guards its
 * Supabase call: a database that hasn't picked up the DirectoryProfile
 * table yet (e.g. this migration hasn't been pushed to it) degrades to
 * "no directory matches," never a broken feed. */
export async function fetchDirectoryPool(): Promise<Array<DirectoryMatch & { haystack: string }>> {
  let rows: Awaited<ReturnType<typeof prisma.directoryProfile.findMany>>
  try {
    rows = await prisma.directoryProfile.findMany({
      where: { visible: true, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 200,
    })
  } catch {
    return []
  }
  return rows.map(r => ({
    id: r.id,
    displayName: r.displayName,
    lookingFor: r.lookingFor.split(',').map(s => s.trim()).filter(Boolean),
    bio: r.bio,
    haystack: `${r.tags} ${r.bio}`.toLowerCase(),
  }))
}

export function matchDirectoryFromPool(
  opp: { tags: string; audience: string },
  pool: Array<DirectoryMatch & { haystack: string }>
): DirectoryMatch[] {
  const keywords = directoryKeywords(opp)
  if (keywords.length === 0 || pool.length === 0) return []
  return pool.filter(p => keywords.some(k => p.haystack.includes(k))).slice(0, 6)
}
