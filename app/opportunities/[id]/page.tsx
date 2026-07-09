import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { ViewTracker } from '@/components/ui/ViewTracker'

const AUDIENCE_LABEL: Record<string, string> = {
  STUDENT: 'Student',
  EARLY_CAREER: 'Early Career',
  FOUNDER: 'Founder',
  GENERAL: 'General',
}

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: 'var(--green)',
  Medium: 'var(--pin)',
  Hard: 'var(--danger)',
}

async function getOpportunity(id: string) {
  const opp = await prisma.opportunity.findUnique({ where: { id } })
  if (!opp || opp.deletedAt) return null
  return opp
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const opp = await getOpportunity(id)
  if (!opp) return { title: 'Not found — OppIDX' }
  return {
    title: `${opp.title} — OppIDX`,
    description: opp.description.slice(0, 160),
  }
}

export default async function OpportunityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const opp = await getOpportunity(id)
  if (!opp) notFound()

  const tags = opp.tags.split(',').map(t => t.trim()).filter(Boolean)

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px 80px' }}>
      <ViewTracker id={opp.id} />
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <Link href="/" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-2)', textDecoration: 'none' }}>
          ← Back to the board
        </Link>

        <div className="card-box" style={{ marginTop: 20, padding: '36px 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                color: 'var(--pin)',
              }}>
                {AUDIENCE_LABEL[opp.audience] ?? opp.audience}
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
                color: DIFFICULTY_COLOR[opp.difficulty] ?? 'var(--ink-3)',
              }}>
                {opp.difficulty}
              </span>
            </div>
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, lineHeight: 1.3, marginBottom: 8, color: 'var(--ink)' }}>
            {opp.title}
          </h1>
          {opp.org && <div style={{ fontSize: 14, color: 'var(--ink-2)', marginBottom: 20 }}>{opp.org}</div>}

          <p style={{ fontSize: 14.5, color: 'var(--ink-2)', lineHeight: 1.75, marginBottom: 24, whiteSpace: 'pre-wrap' }}>
            {opp.description}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 26, fontSize: 13, fontFamily: 'var(--font-mono)' }}>
            {opp.location && <span>📍 {opp.location}</span>}
            {opp.compType && <span style={{ color: 'var(--green)', fontWeight: 600 }}>{opp.compType}</span>}
          </div>

          {opp.eligibility && (
            <div style={{ marginBottom: 20, padding: '14px 16px', background: 'var(--board)', borderRadius: 2, border: '1px solid var(--line)' }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--pin)', marginBottom: 6 }}>
                Who can apply
              </div>
              <div style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.65 }}>{opp.eligibility}</div>
            </div>
          )}

          {tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 30 }}>
              {tags.map(t => (
                <span key={t} style={{
                  fontSize: 11, color: 'var(--ink-2)', background: 'rgba(43,38,32,0.06)',
                  borderRadius: 980, padding: '3px 10px', fontFamily: 'var(--font-mono)',
                }}>#{t}</span>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontFamily: 'var(--font-mono)', fontSize: 13 }}>
            <a href={opp.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--pin)', fontWeight: 700, textDecoration: 'none' }}>
              Apply → {opp.url}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
