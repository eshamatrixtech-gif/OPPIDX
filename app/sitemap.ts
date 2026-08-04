import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'
import { SITE_URL } from '@/lib/siteUrl'
import { PAYWALL_ENABLED } from '@/lib/limits'
import { getAllCollectionDefs } from '@/lib/collections'
import { getCompanyList } from '@/lib/companies'
import { getRegionList } from '@/lib/regions'
import { supabaseAdmin } from '@/lib/mayatara/supabase'

// Without this, sitemap.ts has no request-time API and no dynamic config,
// so Next prerenders it once at build time and freezes it there — new
// opportunities added by the hourly scraper (a DB write, not a deploy)
// would never appear until the next actual code push. Matches the
// scraper's own cadence (lib/scraper/scheduler.ts), so a new listing
// shows up in the sitemap within the hour, not "whenever someone next
// changes code."
export const revalidate = 3600

// `lastModified` below is deliberately NOT always "now" — Search Console
// and Google's own sitemap docs treat lastmod as a claim about real content
// change, and a sitemap that stamps every URL with the current instant on
// every regeneration (this ran hourly) teaches Googlebot the signal is
// unreliable, which makes it fall back to slower heuristic recrawl timing
// for the whole site — including the pages that genuinely do change every
// hour. Only routes whose content is actually live-computed from the
// database on every request (the feed, the live board) get `new Date()`;
// static informational pages get a fixed date that only moves when someone
// deliberately updates it alongside a real content change.
const STATIC_ROUTES: Array<{ path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number; lastModified?: Date }> = [
  { path: '', changeFrequency: 'hourly', priority: 1 },
  { path: '/browse', changeFrequency: 'hourly', priority: 0.9 },
  { path: '/collections', changeFrequency: 'daily', priority: 0.8 },
  { path: '/companies', changeFrequency: 'daily', priority: 0.8 },
  { path: '/regions', changeFrequency: 'daily', priority: 0.8 },
  { path: '/newsletter', changeFrequency: 'daily', priority: 0.8 },
  { path: '/resources', changeFrequency: 'daily', priority: 0.8 },
  { path: '/pulse', changeFrequency: 'daily', priority: 0.7 },
  { path: '/mayatara', changeFrequency: 'monthly', priority: 0.4, lastModified: new Date('2026-08-04') },
  { path: '/philosophy', changeFrequency: 'monthly', priority: 0.5, lastModified: new Date('2026-08-01') },
  ...(PAYWALL_ENABLED ? [{ path: '/pricing', changeFrequency: 'monthly' as const, priority: 0.5, lastModified: new Date('2026-08-01') }] : []),
  { path: '/advertise', changeFrequency: 'monthly', priority: 0.4, lastModified: new Date('2026-08-01') },
  { path: '/widget', changeFrequency: 'monthly', priority: 0.3, lastModified: new Date('2026-08-01') },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.2, lastModified: new Date('2026-08-01') },
]

// Events live in Supabase, not Prisma (see lib/mayatara/supabase.ts) — a
// separate query, and `supabaseAdmin` is null in any environment missing
// the service-role env vars, so this degrades to "no event URLs" rather
// than breaking the whole sitemap.
async function getListedEvents() {
  if (!supabaseAdmin) return []
  const { data } = await supabaseAdmin
    .from('events')
    .select('slug, created_at')
    .eq('is_published', true)
    .eq('is_cancelled', false)
    .eq('is_listed', true)
  return data ?? []
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [opportunities, resources, newsletters, pulseDigests, companies, collections, regions, events] = await Promise.all([
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
    getCompanyList(),
    getAllCollectionDefs(),
    getRegionList(),
    getListedEvents(),
  ])

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(r => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: r.lastModified ?? new Date(),
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
    url: `${SITE_URL}/pulse/digest/${p.period}`,
    lastModified: p.createdAt,
    changeFrequency: 'yearly',
    priority: 0.5,
  }))

  const collectionEntries: MetadataRoute.Sitemap = collections.map(c => ({
    url: `${SITE_URL}/collections/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'hourly',
    priority: c.group === 'Combo' ? 0.6 : 0.85,
  }))

  const companyEntries: MetadataRoute.Sitemap = companies.map(c => ({
    url: `${SITE_URL}/companies/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.65,
  }))

  const regionEntries: MetadataRoute.Sitemap = regions.map(r => ({
    url: `${SITE_URL}/regions/${r.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.65,
  }))

  const eventEntries: MetadataRoute.Sitemap = events.map(e => ({
    url: `${SITE_URL}/events/${e.slug}`,
    lastModified: e.created_at ? new Date(e.created_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.5,
  }))

  return [
    ...staticEntries, ...opportunityEntries, ...resourceEntries, ...newsletterEntries,
    ...pulseDigestEntries, ...collectionEntries, ...companyEntries, ...regionEntries, ...eventEntries,
  ]
}
