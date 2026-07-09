import type { Audience } from '@/types'

/** Normalized shape every source adapter must return, before OpenAI classification. */
export interface RawListing {
  title: string
  url: string
  org?: string
  rawDescription: string
  location?: string
  audienceHint: Audience
  tags?: string            // comma-separated, from the source's own categories — omit rather than guess
  sourceLabel: string      // shown in ScrapeRun details, e.g. "RemoteOK"
  sourceUrl: string        // the feed/page this listing was found on, stored as Opportunity.sourceUrl
}

export interface ScraperSource {
  name: string
  fetch(): Promise<RawListing[]>
}
