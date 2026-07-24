import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'

async function getResource(id: string) {
  const item = await prisma.resource.findUnique({ where: { id } })
  if (!item || item.deletedAt || !item.verified) return null
  return item
}

function hostOf(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url }
}

async function getSimilar(item: { id: string; category: string }) {
  return prisma.resource.findMany({
    where: { id: { not: item.id }, category: item.category, verified: true, deletedAt: null },
    orderBy: { addedAt: 'desc' },
    take: 4,
  })
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await getResource(id)
  if (!item) return { title: 'Not found — OppIDX' }
  return {
    title: `${item.title} — OppIDX Resources`,
    description: item.description.slice(0, 160),
  }
}

export default async function ResourcePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await getResource(id)
  if (!item) notFound()

  const similar = await getSimilar(item)

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px 80px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <Link href="/resources" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-2)', textDecoration: 'none' }}>
          ← Back to Resources
        </Link>

        <div className="card-box" style={{ marginTop: 20, padding: '36px 32px' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--pin)',
            }}>
              {item.category}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>
              {item.audience.replace('_', ' ')}
            </span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, lineHeight: 1.3, marginBottom: 16, color: 'var(--ink)' }}>
            {item.title}
          </h1>

          <p style={{ fontSize: 14.5, color: 'var(--ink-2)', lineHeight: 1.75, marginBottom: item.body ? 24 : 0, whiteSpace: 'pre-wrap' }}>
            {item.description}
          </p>

          {item.body && (
            <div style={{
              fontSize: 14.5, color: 'var(--ink)', lineHeight: 1.85, whiteSpace: 'pre-wrap',
              paddingTop: 24, borderTop: '1px solid var(--line)', marginBottom: 24,
            }}>
              {item.body}
            </div>
          )}

          <a href={item.url} target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-block', fontFamily: 'var(--font-mono)', fontSize: 13,
            color: 'var(--pin)', fontWeight: 700, textDecoration: 'none',
          }}>
            {item.body ? 'Further reading' : 'Open'} → {hostOf(item.url)}
          </a>
        </div>

        {similar.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <div className="divider" style={{ marginBottom: 20 }}>
              <span>◆ More in {item.category} ◆</span>
            </div>
            <div style={{ display: 'grid', gap: 14 }}>
              {similar.map(s => (
                <Link key={s.id} href={`/resources/${s.id}`} className="card-box" style={{ padding: '16px 18px', textDecoration: 'none', display: 'block' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--ink)', marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {s.description}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
