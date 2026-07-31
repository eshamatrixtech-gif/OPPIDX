import type { RawListing } from '../types'
import { stripHtml } from '../util'

// Adzuna job-search API — real, first-party, covers 19 countries including
// India, the US, and the UK. Free self-service key from developer.adzuna.com
// (email signup, no approval wait, no cost within the free-tier rate limit).
// Dormant until both env vars are set — returns [] quietly rather than
// erroring every hourly pass when unconfigured.
const COUNTRIES = ['in', 'us', 'gb'] as const

// Exported so app/opportunities/[id]/page.tsx can key its required on-page
// attribution off the exact same sourceUrl this adapter stores.
export const SOURCE_URL = 'https://www.adzuna.com/'

// Matches the ENTRY_LEVEL pattern other sources (e.g. arbeitnow.ts) use to
// tag internships from the title — Adzuna's own "internship" search term
// only scopes the query, it isn't echoed back as a category or tag field.
const INTERNSHIP_TITLE = /\bintern(ship)?\b/i

interface AdzunaJob {
  id?: string
  title?: string
  description?: string
  redirect_url?: string
  company?: { display_name?: string }
  location?: { display_name?: string }
  category?: { label?: string }
}

async function fetchCountry(country: string, appId: string, appKey: string): Promise<RawListing[]> {
  const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=15&what=internship%20OR%20graduate%20OR%20entry%20level&content-type=application/json`
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; OppIDXScraper/1.0)' } })
  if (!res.ok) throw new Error(`Adzuna (${country}) responded ${res.status}`)

  const data = (await res.json()) as { results?: AdzunaJob[] }
  const jobs = data.results ?? []

  return jobs
    .filter(j => j.id && j.title && j.redirect_url)
    .map((j): RawListing => {
      const tags = [
        j.category?.label?.toLowerCase(),
        INTERNSHIP_TITLE.test(j.title!) ? 'internship' : null,
      ].filter((t): t is string => Boolean(t)).join(',')

      return {
        title: j.title!,
        url: j.redirect_url!,
        org: j.company?.display_name,
        rawDescription: stripHtml(j.description ?? ''),
        location: j.location?.display_name,
        audienceHint: 'EARLY_CAREER',
        tags: tags || undefined,
        sourceLabel: 'Adzuna',
        sourceUrl: SOURCE_URL,
      }
    })
}

export async function fetchAdzuna(): Promise<RawListing[]> {
  const appId = process.env.ADZUNA_APP_ID
  const appKey = process.env.ADZUNA_APP_KEY
  if (!appId || !appKey) return []

  const perCountry = await Promise.all(
    COUNTRIES.map(c => fetchCountry(c, appId, appKey).catch(err => {
      console.error(`[scraper] Adzuna (${c}) failed:`, err)
      return [] as RawListing[]
    })),
  )
  return perCountry.flat()
}
