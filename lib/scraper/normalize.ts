import type { Audience, Difficulty } from '@/types'
import type { RawListing } from './types'
import { inferGeo } from './geo'

export interface NormalizedListing {
  description: string
  eligibility: string
  prepResources: string
  difficulty: Difficulty
  audience: Audience
  tags: string
  compType: string | null
  region: string
  country: string
}

const HARD_HINTS = /\b(phd|senior|principal|staff|5\+ years|10\+ years|invite[- ]only)\b/i
const EASY_HINTS = /\b(intern(ship)?|entry[- ]level|junior|no experience|beginner|new grad)\b/i

function inferDifficulty(text: string, audience: Audience): Difficulty {
  if (HARD_HINTS.test(text)) return 'Hard'
  if (audience === 'FOUNDER') return 'Hard'
  if (EASY_HINTS.test(text)) return 'Easy'
  return 'Medium'
}

function inferCompType(text: string): string | null {
  const t = text.toLowerCase()
  if (/\bunpaid\b/.test(t)) return 'Unpaid'
  if (/\bstipend\b/.test(t)) return 'Stipend'
  if (/\bequity\b/.test(t)) return 'Equity'
  if (/\b(paid|salary|compensation|\$\d)/.test(t)) return 'Paid'
  return null
}

/** Maps a raw feed listing onto the Opportunity schema using plain rules —
 * no AI/LLM calls of any kind. Fields we can't honestly derive from the raw
 * feed (eligibility, prep resources) are left blank rather than invented. */
export function normalize(raw: RawListing): NormalizedListing {
  const text = `${raw.title} ${raw.rawDescription}`
  const geo = inferGeo(raw.location)
  return {
    description: (raw.rawDescription || raw.title).slice(0, 600),
    eligibility: '',
    prepResources: '',
    difficulty: inferDifficulty(text, raw.audienceHint),
    audience: raw.audienceHint,
    tags: raw.tags ?? '',
    compType: inferCompType(text),
    region: geo.region,
    country: geo.country,
  }
}
