// Runs once when this Next.js server instance boots (dev or prod, `next dev`/`next start`).
// This is what makes opportunity scraping native to the app: as long as the server process
// is running, the hourly pass runs itself — no external cron, webhook, or Claude session needed.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startScraperScheduler } = await import('./lib/scraper/scheduler')
    startScraperScheduler()
  }
}
