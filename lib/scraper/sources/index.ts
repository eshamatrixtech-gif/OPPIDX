import type { ScraperSource } from '../types'
import { fetchRemoteOK } from './remoteok'
import { fetchDevpost } from './devpost'
import { fetchGithubInternships } from './githubInternships'
import { fetchGrantsGov } from './grantsGov'
import { fetchNewGradJobs } from './newGradJobs'
import { fetchCompanyBoards } from './companyBoards'
import { fetchLeverBoards } from './leverBoards'
import { fetchUsaJobs } from './usaJobs'

// Add more countries/categories by pushing another { name, fetch } adapter here —
// each one just needs to return RawListing[] from lib/scraper/types.ts.
export const SOURCES: ScraperSource[] = [
  { name: 'RemoteOK', fetch: fetchRemoteOK },
  { name: 'Devpost', fetch: fetchDevpost },
  { name: 'Simplify Jobs (GitHub)', fetch: fetchGithubInternships },
  { name: 'Grants.gov', fetch: fetchGrantsGov },
  { name: 'New-Grad-Jobs (GitHub)', fetch: fetchNewGradJobs },
  { name: 'Company boards (Greenhouse)', fetch: fetchCompanyBoards },
  { name: 'Company boards (Lever)', fetch: fetchLeverBoards },
  { name: 'USAJobs', fetch: fetchUsaJobs }, // dormant until USAJOBS_API_KEY is set
]
