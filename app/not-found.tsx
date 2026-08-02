import Link from 'next/link'
import { Wordmark } from '@/components/ui/Wordmark'

export const metadata = {
  title: 'Page not found — OppIDX',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="card-box" style={{ padding: '36px 32px', maxWidth: 460, textAlign: 'center' }}>
        <div style={{ marginBottom: 14 }}><Wordmark size={20} /></div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink)', textTransform: 'uppercase', marginBottom: 12 }}>
          Nothing pinned here.
        </h1>
        <p style={{ color: 'var(--ink-2)', fontSize: 13.5, marginBottom: 20, lineHeight: 1.7 }}>
          That page doesn&apos;t exist, or the listing it pointed to has been taken down. Try the board instead.
        </p>
        <Link href="/browse" style={{
          display: 'inline-block', padding: '11px 22px', borderRadius: 2,
          background: 'var(--btn-bg)', color: 'var(--btn-text)', textDecoration: 'none',
          fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13,
        }}>
          Browse opportunities →
        </Link>
      </div>
    </div>
  )
}
