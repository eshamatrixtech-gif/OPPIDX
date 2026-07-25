import { NextResponse } from 'next/server'
import { getActiveSponsorSlot } from '@/lib/sponsor'

/**
 * GET /api/sponsor/active — public. Whichever SponsoredSlot (if any) covers
 * today, for the homepage credit line. This is the same data the daily
 * Telegram/Discord digest already credits — the first time it's actually
 * visible on the website itself rather than only in those messages.
 */
export async function GET() {
  const sponsor = await getActiveSponsorSlot()
  if (!sponsor) return NextResponse.json({ sponsor: null })
  return NextResponse.json({
    sponsor: { sponsorName: sponsor.sponsorName, sponsorUrl: sponsor.sponsorUrl, tagline: sponsor.tagline },
  })
}
