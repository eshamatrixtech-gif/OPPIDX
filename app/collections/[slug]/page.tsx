import { notFound } from 'next/navigation'
import { CollectionView } from '@/components/ui/CollectionView'
import { getCollectionOpportunities, getAllCollectionDefs, resolveCollectionDef } from '@/lib/collections'
import { SITE_URL } from '@/lib/siteUrl'
import { pageMetadata } from '@/lib/pageMetadata'
import { listOrEmpty } from '@/lib/buildParams'

export async function generateStaticParams() {
  const defs = await listOrEmpty('/collections/[slug]', getAllCollectionDefs)
  return defs.map(c => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const def = await resolveCollectionDef(slug)
  if (!def) return { title: 'Not found — OppIDX' }
  return pageMetadata({
    title: def.pageTitle,
    description: def.description,
    canonical: `${SITE_URL}/collections/${slug}`,
  })
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const def = await resolveCollectionDef(slug)
  if (!def) notFound()

  const { items, total, restricted, page, pageCount } = await getCollectionOpportunities(def, 1)

  return (
    <CollectionView
      def={def}
      slug={slug}
      items={items}
      total={total}
      restricted={restricted}
      page={page}
      pageCount={pageCount}
    />
  )
}
