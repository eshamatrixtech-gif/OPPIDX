'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { SaveButton } from '@/components/ui/SaveButton'
import type { Opportunity } from '@/types'

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

function hostOf(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url }
}

/** Clicking "Apply" straight from the card skips the internal detail page
 * entirely (it's a direct external link) — which means ViewTracker (which
 * only lives on /opportunities/[id]) never fires, and a real, genuine
 * "someone chose to apply" moment goes uncounted. Fire the same view
 * increment here too, fire-and-forget, so the count reflects real
 * engagement either way someone reaches the application. */
function trackView(id: string) {
  fetch(`/api/opportunities/${id}/view`, { method: 'POST' }).catch(() => {})
}

export function OpportunityCard({ opp }: { opp: Opportunity }) {
  const tags = opp.tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 3)

  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.2 }}>
      <div className="card-box" style={{ minHeight: 220 }}>
        <Link
          href={`/opportunities/${opp.id}`}
          style={{ display: 'block', padding: '20px 18px 14px', textDecoration: 'none' }}
        >
          <div style={{ marginBottom: 12 }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: 'var(--pin)',
            }}>
              {AUDIENCE_LABEL[opp.audience] ?? opp.audience}
            </span>
          </div>

          <h3 style={{
            fontFamily: 'var(--font-display)', fontSize: 16.5, lineHeight: 1.35,
            color: 'var(--ink)', marginBottom: 6,
          }}>
            {opp.title}
          </h3>

          {opp.org && (
            <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginBottom: 10 }}>{opp.org}</div>
          )}

          <p style={{
            fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.6, marginBottom: 14,
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {opp.description}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {opp.location && (
              <span style={{ fontSize: 10.5, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>📍 {opp.location}</span>
            )}
            {opp.compType && (
              <span style={{ fontSize: 10.5, color: 'var(--green)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{opp.compType}</span>
            )}
            <span style={{ fontSize: 10.5, color: DIFFICULTY_COLOR[opp.difficulty] ?? 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
              {opp.difficulty}
            </span>
          </div>

          {tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {tags.map(t => (
                <span key={t} style={{
                  fontSize: 10, color: 'var(--ink-2)', background: 'rgba(43,38,32,0.06)',
                  borderRadius: 2, padding: '2px 8px', fontFamily: 'var(--font-mono)',
                }}>#{t}</span>
              ))}
            </div>
          )}
        </Link>

        {/* Raw link, right on the card — no button chrome */}
        <div style={{
          borderTop: '1px solid var(--line)', padding: '10px 18px',
          fontFamily: 'var(--font-mono)', fontSize: 11,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
        }}>
          <a
            href={opp.url} target="_blank" rel="noopener noreferrer"
            onClick={() => trackView(opp.id)}
            style={{ color: 'var(--pin)', textDecoration: 'none' }}
          >
            Apply → {hostOf(opp.url)}
          </a>
          <SaveButton opportunityId={opp.id} />
        </div>
      </div>
    </motion.div>
  )
}
