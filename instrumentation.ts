// Runs once when this Next.js server instance boots (dev or prod, `next dev`/`next start`).
// This is what makes opportunity scraping native to the app on a persistent server: as long
// as the process is running, the hourly pass runs itself — no external cron needed.
//
// Skipped on Vercel (and any other serverless host): those freeze/recycle function instances
// between requests, so a setInterval here isn't guaranteed to fire again after the first
// invocation — see app/api/cron/scrape/route.ts, which an external scheduler
// (.github/workflows/scrape-cron.yml) hits hourly instead in that environment.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && !process.env.VERCEL) {
    const { startScraperScheduler } = await import('./lib/scraper/scheduler')
    startScraperScheduler()
  }
}
