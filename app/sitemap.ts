import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'
import { SITE_URL } from '@/lib/siteUrl'
import { PAYWALL_ENABLED } from '@/lib/limits'

// Without this, sitemap.ts has no request-time API and no dynamic config,
// so Next prerenders it once at build time and freezes it there — new
// opportunities added by the hourly scraper (a DB write, not a deploy)
// would never appear until the next actual code push. Matches the
// scraper's own cadence (lib/scraper/scheduler.ts), so a new listing
// shows up in the sitemap within the hour, not "whenever someone next
// changes code."
export const revalidate = 3600

const STATIC_ROUTES: Array<{ path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }> = [
  { path: '', changeFrequency: 'hourly', priority: 1 },
  { path: '/browse', changeFrequency: 'hourly', priority: 0.9 },
  { path: '/collections/students', changeFrequency: 'hourly', priority: 0.85 },
  { path: '/collections/founders', changeFrequency: 'hourly', priority: 0.85 },
  { path: '/newsletter', changeFrequency: 'daily', priority: 0.8 },
  { path: '/resources', changeFrequency: 'daily', priority: 0.8 },
  { path: '/mayatara/pulse', changeFrequency: 'daily', priority: 0.7 },
  { path: '/philosophy', changeFrequency: 'monthly', priority: 0.5 },
  ...(PAYWALL_ENABLED ? [{ path: '/pricing', changeFrequency: 'monthly' as const, priority: 0.5 }] : []),
  { path: '/advertise', changeFrequency: 'monthly', priority: 0.4 },
  { path: '/widget', changeFrequency: 'monthly', priority: 0.3 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.2 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [opportunities, resources, newsletters, pulseDigests] = await Promise.all([
    prisma.opportunity.findMany({
      where: { verified: true, deletedAt: null },
      select: { id: true, addedAt: true },
      orderBy: { addedAt: 'desc' },
    }),
    prisma.resource.findMany({
      where: { verified: true, deletedAt: null },
      select: { id: true, addedAt: true },
      orderBy: { addedAt: 'desc' },
    }),
    prisma.dailyDigest.findMany({ select: { date: true, createdAt: true } }),
    prisma.policyDigest.findMany({ select: { period: true, createdAt: true } }),
  ])

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(r => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))

  const opportunityEntries: MetadataRoute.Sitemap = opportunities.map(o => ({
    url: `${SITE_URL}/opportunities/${o.id}`,
    lastModified: o.addedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const resourceEntries: MetadataRoute.Sitemap = resources.map(r => ({
    url: `${SITE_URL}/resources/${r.id}`,
    lastModified: r.addedAt,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  const newsletterEntries: MetadataRoute.Sitemap = newsletters.map(n => ({
    url: `${SITE_URL}/newsletter/${n.date}`,
    lastModified: n.createdAt,
    changeFrequency: 'yearly',
    priority: 0.5,
  }))

  const pulseDigestEntries: MetadataRoute.Sitemap = pulseDigests.map(p => ({
    url: `${SITE_URL}/mayatara/pulse/digest/${p.period}`,
    lastModified: p.createdAt,
    changeFrequency: 'yearly',
    priority: 0.5,
  }))

  return [...staticEntries, ...opportunityEntries, ...resourceEntries, ...newsletterEntries, ...pulseDigestEntries]
}
