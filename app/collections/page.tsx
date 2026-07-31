import Link from 'next/link'
import { COLLECTION_DEFS } from '@/lib/collectionDefs'

export const metadata = {
  title: 'Browse by Audience & Topic — OppIDX',
  description: 'Every real, verified opportunity on OppIDX, organized by audience, topic, and location.',
}

const GROUPS = ['Audience', 'Topic', 'Location'] as const

export default function CollectionsIndexPage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <header style={{ padding: '40px 24px 24px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <Link href="/" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-2)', textDecoration: 'none' }}>
            ← OppIDX
          </Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 4.5vw, 38px)', color: 'var(--ink)', marginTop: 14, textTransform: 'uppercase' }}>
            Browse the board
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 10, maxWidth: 640, lineHeight: 1.65 }}>
            Every real, verified opportunity — organized by who it's for, what it is, and where it is.
          </p>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 80px' }}>
        {GROUPS.map(group => {
          const defs = COLLECTION_DEFS.filter(c => c.group === group)
          if (defs.length === 0) return null
          return (
            <div key={group} style={{ marginBottom: 34 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--pin)', marginBottom: 12 }}>
                By {group.toLowerCase()}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {defs.map(c => (
                  <Link key={c.slug} href={`/collections/${c.slug}`} className="card-box" style={{
                    padding: '10px 16px', textDecoration: 'none', color: 'var(--ink)',
                    fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700,
                  }}>
                    {c.title}
                  </Link>
                ))}
              </div>
            </div>
          )
        })}

        <div style={{ marginTop: 20 }}>
          <Link href="/companies" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--pin)', textDecoration: 'none' }}>
            Browse by company →
          </Link>
        </div>
      </main>
    </div>
  )
}
