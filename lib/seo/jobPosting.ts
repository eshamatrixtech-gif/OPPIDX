/** Shared eligibility gate for JobPosting markup and the Google Indexing API.
 * Google only permits Indexing API notifications for pages that actually
 * contain JobPosting structured data, so these two paths must never drift. */
export const NON_JOB_TAGS = ['scholarship', 'fellowship', 'grant', 'hackathon', 'competition', 'contest', 'award']

export interface JobPostingCandidate {
  tags: string
  org: string | null
  location: string | null
  country: string
}

export function isEligibleJobPosting(opp: JobPostingCandidate): boolean {
  const tags = opp.tags.toLowerCase()
  return Boolean(opp.org) && Boolean(opp.location || opp.country) && !NON_JOB_TAGS.some(tag => tags.includes(tag))
}
