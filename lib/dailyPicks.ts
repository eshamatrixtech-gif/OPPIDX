import { prisma } from '@/lib/db'

const PICK_COUNT = 3

/**
 * A small, random daily pick of verified opportunities — shared by every
 * distribution channel (Telegram, Discord, ...) so they all show the same
 * picks instead of each rolling their own. Deliberately not a dump of
 * everything new: the board adds dozens of listings a day, and a firehose
 * digest would read as spam and cut against the "elite, hand-curated"
 * brand the rest of the site is built on.
 *
 * Samples via random offsets rather than pulling the whole table into
 * memory to shuffle it — cheap even as the board grows.
 */
export async function getDailyPicks() {
  const total = await prisma.opportunity.count({ where: { verified: true, deletedAt: null } })
  if (total === 0) return []

  const pickCount = Math.min(PICK_COUNT, total)
  const offsets = new Set<number>()
  while (offsets.size < pickCount) {
    offsets.add(Math.floor(Math.random() * total))
  }

  const picks = await Promise.all(
    [...offsets].map(skip =>
      prisma.opportunity.findFirst({
        where: { verified: true, deletedAt: null },
        orderBy: { id: 'asc' },
        skip,
      })
    )
  )
  return picks.filter((o): o is NonNullable<typeof o> => !!o)
}

export const AUDIENCE_LABEL: Record<string, string> = {
  STUDENT: 'Student',
  EARLY_CAREER: 'Early Career',
  FOUNDER: 'Founder',
  GENERAL: 'General',
}
