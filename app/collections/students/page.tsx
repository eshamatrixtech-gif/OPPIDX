import Link from 'next/link'
import { OpportunityCard } from '@/components/ui/OpportunityCard'
import { getCollectionOpportunities } from '@/lib/collections'

export const metadata = {
  title: 'Internships, Scholarships & Fellowships for Students — OppIDX',
  description: 'A hand-curated, constantly updated board of real internships, scholarships, and fellowships for students — no scraped junk, no bait, every listing checked before it goes up.',
}

export default async function StudentsCollectionPage() {
  const { items, total, restricted } = await getCollectionOpportunities('STUDENT')

  return (
    <div style={{ minHeight: '100vh' }}>
      <header style={{ padding: '40px 24px 24px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Link href="/" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-2)', textDecoration: 'none' }}>
            ← OppIDX
          </Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 4.5vw, 38px)', color: 'var(--ink)', marginTop: 14, textTransform: 'uppercase' }}>
            For students
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 10, maxWidth: 640, lineHeight: 1.65 }}>
            Internships, scholarships, and fellowships — hand-checked, not scraped junk. {total.toLocaleString()} real opportunities for students right now.
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
              {(total - items.length).toLocaleString()} more student opportunities are subscriber-only.
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
          <Link href="/browse?audience=STUDENT" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--pin)', textDecoration: 'none' }}>
            Search all student opportunities →
          </Link>
        </div>
      </main>
    </div>
  )
}
