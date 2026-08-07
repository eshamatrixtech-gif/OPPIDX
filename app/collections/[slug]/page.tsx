import Link from 'next/link'
import { notFound } from 'next/navigation'
import { OpportunityCard } from '@/components/ui/OpportunityCard'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { FollowCollection } from '@/components/ui/FollowCollection'
import { ListingPageSchema } from '@/components/ui/ListingPageSchema'
import { getCollectionOpportunities, getAllCollectionDefs, resolveCollectionDef } from '@/lib/collections'
import { SITE_URL } from '@/lib/siteUrl'
import { pageMetadata } from '@/lib/pageMetadata'

export async function generateStaticParams() {
  const defs = await getAllCollectionDefs()
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

  const { items, total, restricted } = await getCollectionOpportunities(def)

  return (
    <div style={{ minHeight: '100vh' }}>
      <ListingPageSchema
        title={def.pageTitle}
        description={def.description}
        path={`/collections/${slug}`}
        items={items}
      />
      <header style={{ padding: '40px var(--gutter) 24px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Breadcrumbs items={[
            { name: 'OppIDX', href: '/' },
            { name: 'Collections', href: '/collections' },
            { name: def.title, href: `/collections/${slug}` },
          ]} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 4.5vw, 38px)', color: 'var(--ink)', marginTop: 14, textTransform: 'uppercase' }}>
            {def.title}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 10, maxWidth: 640, lineHeight: 1.65 }}>
            {def.description} {total.toLocaleString()} real opportunities right now.
          </p>
          <div style={{ marginTop: 16 }}>
            <FollowCollection slug={slug} title={def.title} />
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px var(--gutter) 80px' }}>
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
            Nothing here yet — check back soon.
          </div>
        ) : (
          <div className="card-grid" style={{ ['--card-min' as string]: '260px', marginBottom: 30 }}>
            {items.map(opp => <OpportunityCard key={opp.id} opp={opp} />)}
          </div>
        )}

        {/* Collection pages render at most MAX_ITEMS_PER_PAGE cards (see
            lib/collections.ts). `total` is still the real count, so rather
            than quietly showing 96 of 485 this says so and points at the
            search that can show the rest. Not a paywall prompt — that's the
            separate `restricted` block below, which only appears when
            something is genuinely being withheld. */}
        {!restricted && total > items.length && (
          <div style={{ textAlign: 'center', marginBottom: 30, fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-2)' }}>
            Showing {items.length} of {total.toLocaleString()}.{' '}
            <Link href={`/browse?search=${encodeURIComponent(def.title)}`} style={{ color: 'var(--pin)', fontWeight: 700 }}>
              Search the full board →
            </Link>
          </div>
        )}

        {restricted && (
          <div className="card-box" style={{ textAlign: 'center', padding: '26px var(--gutter)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13.5, color: 'var(--ink)', marginBottom: 12 }}>
              {(total - items.length).toLocaleString()} more are subscriber-only.
            </div>
            <Link href="/pricing" style={{
              display: 'inline-block', padding: '11px var(--gutter)', borderRadius: 2,
              background: 'var(--btn-bg)', color: 'var(--btn-text)', textDecoration: 'none',
              fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13,
            }}>
              Unlock full search — ₹299/yr
            </Link>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 30 }}>
          <Link href="/collections" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--pin)', textDecoration: 'none' }}>
            See all collections →
          </Link>
        </div>
      </main>
    </div>
  )
}
