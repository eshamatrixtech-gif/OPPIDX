import Link from 'next/link'
import { pageMetadata } from '@/lib/pageMetadata'
import { SITE_URL } from '@/lib/siteUrl'

export const metadata = pageMetadata({
  title: 'The Mayatara — A spark to life | OppIDX',
  description: 'A quieter way to find your person: answer honestly and receive one considered match every Friday.',
  canonical: `${SITE_URL}/mayatara`,
})

export default function MayataraPage() {
  return (
    <main style={{ minHeight: '100vh', padding: '56px 24px 80px', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 620, margin: '0 auto' }}>
        <Link href="/" style={{ color: 'var(--ink-2)', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: 12.5 }}>
          ← OppIDX
        </Link>

        <section className="card-box" style={{ marginTop: 34, padding: '44px 32px', textAlign: 'center', borderColor: 'var(--saffron)' }}>
          <div style={{ fontSize: 28, color: 'var(--saffron)', marginBottom: 18 }}>✦</div>
          <p style={{ marginBottom: 10, fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 11, color: 'var(--saffron)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            A spark to life
          </p>
          <h1 style={{ marginBottom: 16, fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 7vw, 52px)', lineHeight: 1.05, color: 'var(--ink)' }}>
            The Mayatara
          </h1>
          <p style={{ maxWidth: 440, margin: '0 auto 28px', color: 'var(--ink-2)', fontSize: 16, lineHeight: 1.7 }}>
            A quieter way to find your person. Answer honestly, and we make one considered introduction every Friday.
          </p>
          <Link href="/account/register" style={{ display: 'inline-block', padding: '11px 20px', background: 'var(--btn-bg)', color: 'var(--btn-text)', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13, boxShadow: '3px 3px 0 var(--shadow)' }}>
            Start your interview →
          </Link>
          <p style={{ marginTop: 20, color: 'var(--ink-3)', fontSize: 12.5, lineHeight: 1.6 }}>
            Dating, friendship, co-founder connections, or simply finding your people.
          </p>
        </section>
      </div>
    </main>
  )
}
