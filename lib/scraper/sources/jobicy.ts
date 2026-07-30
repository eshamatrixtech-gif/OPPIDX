import type { RawListing } from '../types'
import { stripHtml } from '../util'

// Exported so app/opportunities/[id]/page.tsx can key its required on-page
// attribution off the exact same sourceUrl this adapter stores.
export const FEED_URL = 'https://jobicy.com/api/v2/remote-jobs?count=50'
// Jobicy's own API terms ask that "Jobicy is clearly credited with a direct
// link to the source" — the per-listing credit lives on the opportunity
// detail page (see JOBICY_SOURCE_HOST in app/opportunities/[id]/page.tsx,
// keyed off this exact sourceUrl), and application links point straight at
// their own job URL below, never rehosted.
const ENTRY_LEVEL = /\b(entry|junior|intern)/i

interface JobicyJob {
  id?: number
  url?: string
  jobTitle?: string
  companyName?: string
  jobGeo?: string
  jobLevel?: string
  jobExcerpt?: string
  jobDescription?: string
  jobIndustry?: string[]
}

export async function fetchJobicy(): Promise<RawListing[]> {
  const res = await fetch(FEED_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; OppIDXScraper/1.0)' },
  })
  if (!res.ok) throw new Error(`Jobicy responded ${res.status}`)

  const body = (await res.json()) as { jobs?: JobicyJob[] }
  const jobs = Array.isArray(body.jobs) ? body.jobs : []

  return jobs
    .filter(j => j.id && j.jobTitle && j.url && ENTRY_LEVEL.test(j.jobLevel ?? ''))
    .slice(0, 15)
    .map((j): RawListing => ({
      title: j.jobTitle!,
      url: j.url!,
      org: j.companyName,
      rawDescription: stripHtml(j.jobDescription || j.jobExcerpt || ''),
      location: j.jobGeo === 'Anywhere' ? 'Remote' : (j.jobGeo || 'Remote'),
      audienceHint: 'EARLY_CAREER',
      tags: (j.jobIndustry ?? []).slice(0, 5).join(','),
      sourceLabel: 'Jobicy',
      sourceUrl: FEED_URL,
    }))
}
