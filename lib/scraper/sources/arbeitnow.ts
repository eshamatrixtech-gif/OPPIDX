import type { RawListing } from '../types'
import { stripHtml } from '../util'

const FEED_URL = 'https://www.arbeitnow.com/api/job-board-api'
// Arbeitnow is a general job board (mostly Europe) — filter down to roles
// that actually fit an "opportunities for students/early career" site,
// same rule as the RemoteOK source.
const ENTRY_LEVEL = /\b(intern(ship)?|junior|entry[- ]level|graduate|new grad|apprentice|trainee|working student|werkstudent)\b/i

interface ArbeitnowJob {
  slug?: string
  company_name?: string
  title?: string
  description?: string
  remote?: boolean
  url?: string
  tags?: string[]
  job_types?: string[]
  location?: string
}

export async function fetchArbeitnow(): Promise<RawListing[]> {
  const res = await fetch(FEED_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; OppIDXScraper/1.0)' },
  })
  if (!res.ok) throw new Error(`Arbeitnow responded ${res.status}`)

  const body = (await res.json()) as { data?: ArbeitnowJob[] }
  const jobs = Array.isArray(body.data) ? body.data : []

  return jobs
    .filter(j => j.slug && j.title && ENTRY_LEVEL.test(`${j.title} ${(j.tags ?? []).join(' ')}`))
    .slice(0, 15)
    .map((j): RawListing => ({
      title: j.title!,
      url: j.url || `https://www.arbeitnow.com/jobs/companies/${j.slug}`,
      org: j.company_name,
      rawDescription: stripHtml(j.description ?? ''),
      location: j.remote ? 'Remote' : (j.location || undefined),
      audienceHint: 'EARLY_CAREER',
      tags: (j.tags ?? []).slice(0, 5).join(','),
      sourceLabel: 'Arbeitnow',
      sourceUrl: FEED_URL,
    }))
}
