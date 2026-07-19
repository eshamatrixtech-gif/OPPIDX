import { prisma } from '@/lib/db'

/**
 * Whichever SponsoredSlot (if any) covers today — there's no enforcement
 * against overlapping bookings since these are created by hand, one at a
 * time, by whoever runs OppIDX; just takes the first match. Returns null
 * (not an error) when nothing's booked, which is the normal case.
 */
export async function getActiveSponsorSlot() {
  const now = new Date()
  return prisma.sponsoredSlot.findFirst({
    where: { startDate: { lte: now }, endDate: { gte: now } },
    orderBy: { startDate: 'desc' },
  })
}
