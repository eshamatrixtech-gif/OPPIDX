import type { RawListing } from '../types'
import { stripHtml } from '../util'

const FEED_URL = 'https://remoteok.com/api'
// RemoteOK is a general remote job board — filter down to roles that actually
// fit an "opportunities for students/early career" site, not senior hires.
const ENTRY_LEVEL = /\b(intern(ship)?|junior|entry[- ]level|graduate|new grad|apprentice|trainee)\b/i

interface RemoteOkJob {
  id?: string
  position?: string
  company?: string
  description?: string
  tags?: string[]
}

export async function fetchRemoteOK(): Promise<RawListing[]> {
  const res = await fetch(FEED_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; OppIDXScraper/1.0)' },
  })
  if (!res.ok) throw new Error(`RemoteOK responded ${res.status}`)

  const rows = (await res.json()) as RemoteOkJob[]
  // First entry is always RemoteOK's API terms-of-service notice, not a job.
  const jobs = Array.isArray(rows) ? rows.slice(1) : []

  return jobs
    .filter(j => j.id && j.position && ENTRY_LEVEL.test(`${j.position} ${(j.tags ?? []).join(' ')}`))
    .slice(0, 15)
    .map((j): RawListing => ({
      title: j.position!,
      url: `https://remoteok.com/remote-jobs/${j.id}`,
      org: j.company,
      rawDescription: stripHtml(j.description ?? ''),
      location: 'Remote',
      audienceHint: 'EARLY_CAREER',
      tags: (j.tags ?? []).slice(0, 5).join(','),
      sourceLabel: 'RemoteOK',
      sourceUrl: FEED_URL,
    }))
}
