/**
 * One-off backfill: the real, original AI-written `summary` (see
 * lib/scraper/summarize.ai.ts) for opportunities that predate it — every
 * new listing gets one automatically at ingestion time now (see
 * lib/scraper/run.ts). Bounded and prioritized by viewCount, same
 * reasoning as scripts/backfill-images.ts: this costs a real OpenAI call
 * per row, so a small worker pool and a hard cap keep one run a
 * reasonable, re-runnable chunk of the backlog rather than a blind pass
 * over the whole table.
 *
 * Usage: npx tsx scripts/backfill-summaries.ts [limit]
 * Defaults to the top 150 most-viewed opportunities missing a summary.
 */
import { prisma } from '../lib/db'
import { writeOpportunitySummary } from '../lib/scraper/summarize.ai'

const CONCURRENCY = 5

async function main() {
  const limit = parseInt(process.argv[2] ?? '150', 10) || 150

  const targets = await prisma.opportunity.findMany({
    where: { summary: null, verified: true, deletedAt: null },
    orderBy: { viewCount: 'desc' },
    take: limit,
    select: { id: true, title: true, org: true, description: true },
  })

  console.log(`Backfilling summaries for ${targets.length} opportunities (top ${limit} by views)…`)

  let filled = 0
  let checked = 0
  let cursor = 0

  async function worker() {
    while (cursor < targets.length) {
      const target = targets[cursor++]
      const summary = await writeOpportunitySummary(target.title, target.org, target.description)
      checked++

      if (summary) {
        await prisma.opportunity.update({ where: { id: target.id }, data: { summary } })
        filled++
        console.log(`✓ [${checked}/${targets.length}] ${target.title}`)
      } else {
        console.log(`· [${checked}/${targets.length}] ${target.title} — AI call failed, left null`)
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker))

  console.log(`\nDone. ${filled} of ${targets.length} got a summary.`)
}

main()
  .catch(err => { console.error(err); process.exitCode = 1 })
  .finally(() => prisma.$disconnect())
