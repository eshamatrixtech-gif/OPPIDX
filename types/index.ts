export type Audience = 'STUDENT' | 'EARLY_CAREER' | 'FOUNDER' | 'GENERAL'
export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export interface Opportunity {
  id: string
  title: string
  description: string
  url: string
  org: string | null
  audience: Audience
  eligibility: string
  prepResources: string
  difficulty: Difficulty
  tags: string
  location: string | null
  region: string
  country: string
  compType: string | null
  viewCount: number
  verified: boolean
  featured: boolean
  source: string
  sourceUrl: string | null
  addedAt: string
}

export interface Stats {
  opportunities: number
  viewed: number
  subscribers: number
}

export interface Facet {
  value: string
  count: number
}

export interface ScrapeRun {
  id: string
  startedAt: string
  finishedAt: string
  added: number
  details: string
}

export interface Subscriber {
  id: string
  email: string
  subscribedAt: string
  plan: string
  paymentProvider: string | null
  paymentSubscriptionId: string | null
  subscriptionStatus: string | null
  currentPeriodEnd: string | null
}

export interface SponsoredSlot {
  id: string
  sponsorName: string
  sponsorUrl: string
  tagline: string
  startDate: string
  endDate: string
  createdAt: string
}
