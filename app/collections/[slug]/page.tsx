import Link from 'next/link'
import { notFound } from 'next/navigation'
import { OpportunityCard } from '@/components/ui/OpportunityCard'
import { getCollectionOpportunities, getAllCollectionDefs, resolveCollectionDef } from '@/lib/collections'
import { SITE_URL } from '@/lib/siteUrl'

export async function generateStaticParams() {
  const defs = await getAllCollectionDefs()
  return defs.map(c => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const def = await resolveCollectionDef(slug)
  if (!def) return { title: 'Not found — OppIDX' }
  return {
    title: def.pageTitle,
    description: def.description,
    alternates: { canonical: `${SITE_URL}/collections/${slug}` },
  }
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const def = await resolveCollectionDef(slug)
  if (!def) notFound()

  const { items, total, restricted } = await getCollectionOpportunities(def)

  return (
    <div style={{ minHeight: '100vh' }}>
      <header style={{ padding: '40px 24px 24px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Link href="/" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-2)', textDecoration: 'none' }}>
            ← OppIDX
          </Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 4.5vw, 38px)', color: 'var(--ink)', marginTop: 14, textTransform: 'uppercase' }}>
            {def.title}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 10, maxWidth: 640, lineHeight: 1.65 }}>
            {def.description} {total.toLocaleString()} real opportunities right now.
          </p>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 80px' }}>
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
            Nothing here yet — check back soon.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 26, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', marginBottom: 30 }}>
            {items.map(opp => <OpportunityCard key={opp.id} opp={opp} />)}
          </div>
        )}

        {restricted && (
          <div className="card-box" style={{ textAlign: 'center', padding: '26px 24px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13.5, color: 'var(--ink)', marginBottom: 12 }}>
              {(total - items.length).toLocaleString()} more are subscriber-only.
            </div>
            <Link href="/pricing" style={{
              display: 'inline-block', padding: '11px 24px', borderRadius: 2,
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
