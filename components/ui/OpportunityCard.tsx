'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { SaveButton } from '@/components/ui/SaveButton'
import { SafeImage } from '@/components/ui/SafeImage'
import { GeneratedBanner } from '@/components/ui/GeneratedBanner'
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

export interface CardExtras {
  heroStat: { kind: string; label: string } | null
  discussionCount: number
  resourceCount: number
  gatheringCount: number
  chasingCount: number
  policyReadCount: number
}

const ATTACHMENT_ICON: Record<string, string> = {
  resource: '📚',
  discussion: '💬',
  gathering: '📍',
  chasing: '💘',
  policy: '📰',
}

/** The attachment strip — resources, discussion, a real gathering, people
 * also chasing this. Every entry here already cleared its own threshold
 * server-side (lib/feedEnrichment.ts); this only ever decides layout, not
 * whether something's real enough to show. A card that clears none of
 * these renders no strip at all, same as a card with no stats gets no
 * stat badge — never a row of zeroes. */
function AttachmentStrip({ oppId, extras }: { oppId: string; extras: CardExtras }) {
  const entries: Array<{ kind: string; label: string }> = []
  if (extras.resourceCount > 0) entries.push({ kind: 'resource', label: `${extras.resourceCount} related guide${extras.resourceCount === 1 ? '' : 's'}` })
  if (extras.policyReadCount > 0) entries.push({ kind: 'policy', label: `${extras.policyReadCount} policy read${extras.policyReadCount === 1 ? '' : 's'}` })
  if (extras.discussionCount > 0) entries.push({ kind: 'discussion', label: `${extras.discussionCount} comment${extras.discussionCount === 1 ? '' : 's'}` })
  if (extras.gatheringCount > 0) entries.push({ kind: 'gathering', label: `${extras.gatheringCount} gathering${extras.gatheringCount === 1 ? '' : 's'} for people chasing this` })
  // Deliberately no "see who" — real identities only ever reveal through
  // Mayatara's own weekly match cadence (never a browsable list; that
  // would out who's applying to what), so the card promises exactly what
  // exists: a real count, not a place to look someone up.
  if (extras.chasingCount > 0) entries.push({ kind: 'chasing', label: `${extras.chasingCount} others also chasing this` })

  if (entries.length === 0) return null

  return (
    <Link
      href={`/opportunities/${oppId}#related`}
      style={{
        display: 'flex', flexWrap: 'wrap', gap: 12, padding: '9px 18px',
        borderTop: '1px solid var(--line)', textDecoration: 'none',
      }}
    >
      {entries.map(e => (
        <span key={e.kind} style={{ fontSize: 10.5, color: 'var(--ink-2)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span aria-hidden>{ATTACHMENT_ICON[e.kind]}</span>{e.label}
        </span>
      ))}
    </Link>
  )
}

export function OpportunityCard({ opp, extras }: { opp: Opportunity; extras?: CardExtras }) {
  const tags = opp.tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 3)

  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.2 }}>
      <div className="card-box" style={{ minHeight: 220, overflow: 'hidden' }}>
        <div style={{ position: 'relative' }}>
          {opp.imageUrl ? (
            <SafeImage
              src={opp.imageUrl}
              alt=""
              style={{ display: 'block', width: '100%', height: 132, objectFit: 'cover', borderBottom: '1px solid var(--line)' }}
              fallback={<GeneratedBanner id={opp.id} audience={opp.audience} height={132} />}
            />
          ) : (
            <GeneratedBanner id={opp.id} audience={opp.audience} height={132} />
          )}
          {opp.videoUrl && (
            <span style={{
              position: 'absolute', bottom: 8, left: 8,
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: 10, fontWeight: 700, color: '#fff', background: 'rgba(0,0,0,0.65)',
              borderRadius: 20, padding: '3px 9px', fontFamily: 'var(--font-mono)',
            }}>
              ▶ Video
            </span>
          )}
        </div>
        <Link
          href={`/opportunities/${opp.id}`}
          style={{ display: 'block', padding: '20px 18px 14px', textDecoration: 'none' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: 'var(--pin)',
            }}>
              {AUDIENCE_LABEL[opp.audience] ?? opp.audience}
            </span>
            {extras?.heroStat && (
              <span style={{
                fontSize: 10.5, fontWeight: 700, color: 'var(--terracotta)',
                background: 'rgba(168,85,46,0.1)', borderRadius: 20, padding: '3px 9px',
                fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap',
              }}>
                {extras.heroStat.label}
              </span>
            )}
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

        {extras && <AttachmentStrip oppId={opp.id} extras={extras} />}
      </div>
    </motion.div>
  )
}
