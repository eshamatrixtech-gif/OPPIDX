import { prisma } from '@/lib/db'
import { SOURCES } from './sources'
import { normalize } from './normalize'

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

/** One full pass: fetch every source, skip URLs already in the DB, classify and insert the rest. */
export async function runScrapePass(): Promise<RunResult> {
  const startedAt = new Date()
  const perSource: Record<string, SourceStats> = {}
  let added = 0

  for (const source of SOURCES) {
    const stats: SourceStats = { fetched: 0, added: 0, error: null }

    try {
      const listings = await source.fetch()
      stats.fetched = listings.length

      for (const raw of listings) {
        const exists = await prisma.opportunity.findFirst({ where: { url: raw.url }, select: { id: true } })
        if (exists) continue

        const normalized = normalize(raw)

        await prisma.opportunity.create({
          data: {
            title: raw.title.trim(),
            description: normalized.description,
            url: raw.url,
            org: raw.org ?? null,
            audience: normalized.audience,
            eligibility: normalized.eligibility,
            prepResources: normalized.prepResources,
            difficulty: normalized.difficulty,
            tags: normalized.tags,
            location: raw.location ?? null,
            region: normalized.region,
            country: normalized.country,
            compType: normalized.compType,
            verified: true,
            featured: false,
            source: 'scraped',
            sourceUrl: raw.sourceUrl,
          },
        })
        stats.added++
        added++
      }
    } catch (err) {
      stats.error = err instanceof Error ? err.message : String(err)
      console.error(`[scraper] source "${source.name}" failed:`, stats.error)
    }

    perSource[source.name] = stats
  }

  const finishedAt = new Date()

  await prisma.scrapeRun
    .create({ data: { startedAt, finishedAt, added, details: JSON.stringify(perSource) } })
    .catch(err => console.error('[scraper] failed to record ScrapeRun:', err))

  console.log(`[scraper] pass finished — added ${added} new opportunities across ${SOURCES.length} sources`)

  return { startedAt, finishedAt, added, perSource }
}
