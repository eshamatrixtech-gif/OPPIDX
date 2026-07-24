import type { RawResource } from '../types'

// Each entry is a real, well-known, actively-maintained "awesome list" or
// open curriculum repo on GitHub — verified to exist before being added.
// One repo = one Resource (its own README is the actual curated list; we
// don't attempt to parse individual links out of markdown). To add another,
// confirm https://github.com/{path} is real and still maintained first.
const AWESOME_REPOS: { path: string; category: string; audienceHint: 'STUDENT' | 'EARLY_CAREER' | 'GENERAL' }[] = [
  { path: 'EbookFoundation/free-programming-books', category: 'Courses', audienceHint: 'STUDENT' },
  { path: 'freeCodeCamp/freeCodeCamp', category: 'Courses', audienceHint: 'STUDENT' },
  { path: 'ossu/computer-science', category: 'Courses', audienceHint: 'STUDENT' },
  { path: 'practical-tutorials/project-based-learning', category: 'Courses', audienceHint: 'STUDENT' },
  { path: 'codecrafters-io/build-your-own-x', category: 'Courses', audienceHint: 'EARLY_CAREER' },
  { path: 'jwasham/coding-interview-university', category: 'Test Prep', audienceHint: 'EARLY_CAREER' },
  { path: 'kdn251/interviews', category: 'Test Prep', audienceHint: 'EARLY_CAREER' },
  { path: 'public-apis/public-apis', category: 'Tools', audienceHint: 'GENERAL' },
  { path: 'sindresorhus/awesome', category: 'Tools', audienceHint: 'GENERAL' },
]

interface GithubRepo {
  full_name: string
  html_url: string
  description: string | null
  stargazers_count: number
}

async function fetchOne({ path, category, audienceHint }: (typeof AWESOME_REPOS)[number]): Promise<RawResource | null> {
  const res = await fetch(`https://api.github.com/repos/${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'OppIDX-ResourceScraper/1.0',
    },
  })
  if (!res.ok) return null

  const repo = (await res.json()) as GithubRepo
  return {
    title: repo.full_name,
    url: repo.html_url,
    description: (repo.description ? `${repo.description} ` : '') + `${repo.stargazers_count.toLocaleString()} stars on GitHub.`,
    category,
    audienceHint,
    sourceLabel: 'GitHub',
  }
}

export async function fetchGithubAwesomeLists(): Promise<RawResource[]> {
  const results = await Promise.allSettled(AWESOME_REPOS.map(fetchOne))
  return results.flatMap(r => (r.status === 'fulfilled' && r.value ? [r.value] : []))
}
