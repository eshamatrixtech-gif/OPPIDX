import { runScrapePass } from './run'

const HOUR_MS = 60 * 60 * 1000

// Guarded on globalThis so Next.js dev-mode module reloads can't stack up duplicate intervals.
const g = globalThis as unknown as { __oppidxScraperStarted?: boolean }

/** Starts the native, in-process hourly scraper. Runs entirely inside this Node
 * process — no external cron, webhook, or Claude session required to keep it going. */
export function startScraperScheduler() {
  if (g.__oppidxScraperStarted) return
  g.__oppidxScraperStarted = true

  const tick = () => {
    runScrapePass().catch(err => console.error('[scraper] pass threw:', err))
  }

  tick() // first pass right away on server boot
  setInterval(tick, HOUR_MS)

  console.log('[scraper] native hourly scheduler started')
}
