import type { Audience } from '@/types'

/** Normalized shape every resource source adapter must return. */
export interface RawResource {
  title: string
  url: string
  description: string
  category: string
  audienceHint: Audience
  sourceLabel: string
}

export interface ResourceScraperSource {
  name: string
  fetch(): Promise<RawResource[]>
}
