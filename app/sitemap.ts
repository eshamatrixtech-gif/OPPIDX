import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'
import { SITE_URL } from '@/lib/siteUrl'

const STATIC_ROUTES: Array<{ path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }> = [
  { path: '', changeFrequency: 'hourly', priority: 1 },
  { path: '/browse', changeFrequency: 'hourly', priority: 0.9 },
  { path: '/collections/students', changeFrequency: 'hourly', priority: 0.85 },
  { path: '/collections/founders', changeFrequency: 'hourly', priority: 0.85 },
  { path: '/philosophy', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/pricing', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/submit', changeFrequency: 'monthly', priority: 0.4 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.2 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const opportunities = await prisma.opportunity.findMany({
    where: { verified: true, deletedAt: null },
    select: { id: true, addedAt: true },
    orderBy: { addedAt: 'desc' },
  })

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

  return [...staticEntries, ...opportunityEntries]
}
