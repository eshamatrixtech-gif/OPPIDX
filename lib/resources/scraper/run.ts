import { prisma } from '@/lib/db'
import { RESOURCE_SOURCES } from './sources'
import { checkUrlReachable, normalizeUrl, getExistingNormalizedUrls } from '@/lib/resources/verify'

interface SourceStats {
  fetched: number
  added: number
  error: string | null
}

export interface RunResult {
  startedAt: Date
  finishedAt: Date
  added: number
  perSource: Record<string, SourceStats>
}

/**
 * One full resource-scraper pass: fetch every source, then run each
 * candidate through the exact same gate a public submission goes through
 * (live-link reachability + duplicate check, lib/resources/verify.ts) before
 * creating it — scraped resources are held to the same "only verified
 * resources get added" bar, not a lower one.
 */
export async function runResourceScrapePass(): Promise<RunResult> {
  const startedAt = new Date()
  const perSource: Record<string, SourceStats> = {}
  let added = 0

  const seen = await getExistingNormalizedUrls()

  for (const source of RESOURCE_SOURCES) {
    const stats: SourceStats = { fetched: 0, added: 0, error: null }

    try {
      const raws = await source.fetch()
      stats.fetched = raws.length

      for (const raw of raws) {
        const key = normalizeUrl(raw.url)
        if (seen.has(key)) continue

        if (!raw.preVerified) {
          const reachable = await checkUrlReachable(raw.url)
          if (!reachable.ok) continue
        }

        await prisma.resource.create({
          data: {
            title: raw.title.trim().slice(0, 300),
            description: raw.description.trim().slice(0, 600),
            url: raw.url,
            category: raw.category,
            audience: raw.audienceHint,
            verified: true,
            source: 'scraped',
          },
        })
        seen.add(key)
        stats.added++
        added++
      }
    } catch (err) {
      stats.error = err instanceof Error ? err.message : String(err)
      console.error(`[resource-scraper] source "${source.name}" failed:`, stats.error)
    }

    perSource[source.name] = stats
  }

  const finishedAt = new Date()

  await prisma.resourceScrapeRun
    .create({ data: { startedAt, finishedAt, added, details: JSON.stringify(perSource) } })
    .catch(err => console.error('[resource-scraper] failed to record ResourceScrapeRun:', err))

  console.log(`[resource-scraper] pass finished — added ${added} new resources across ${RESOURCE_SOURCES.length} sources`)

  return { startedAt, finishedAt, added, perSource }
}
