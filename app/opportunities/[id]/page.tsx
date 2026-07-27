import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { ViewTracker } from '@/components/ui/ViewTracker'
import { ShareBar } from '@/components/ui/ShareBar'
import { SaveButton } from '@/components/ui/SaveButton'
import { OpportunityCard } from '@/components/ui/OpportunityCard'
import { SITE_URL } from '@/lib/siteUrl'
import { relatedResourceCategories } from '@/lib/opportunityResourceMap'
import { fetchUpcomingGatheringsPool, matchGatheringsFromPool } from '@/lib/opportunityGatheringMap'
import { chasingCohortSize } from '@/lib/chasingCohort'
import { fetchRecentPolicyItemsPool, matchPolicyReadsFromPool } from '@/lib/opportunityPulseMap'
import { fetchDirectoryPool, matchDirectoryFromPool } from '@/lib/directoryMap'
import { Discussion } from '@/components/ui/Discussion'
import { SafeImage } from '@/components/ui/SafeImage'
import { VideoEmbed } from '@/components/ui/VideoEmbed'
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

/** The empty-state counterpart to a populated related-edge box — same
 * "leave it blank rather than fake it" rule, just turned into an
 * invitation instead of nothing at all. Never claims anything exists. */
function RelatedPrompt({ text, cta, href }: { text: string; cta: string; href: string }) {
  return (
    <div style={{
      marginBottom: 20, padding: '12px 16px', borderRadius: 2,
      border: '1px dashed var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 10, flexWrap: 'wrap',
    }}>
      <span style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>{text}</span>
      <Link href={href} style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--pin)', textDecoration: 'none', whiteSpace: 'nowrap' }}>{cta}</Link>
    </div>
  )
}

async function getOpportunity(id: string) {
  const opp = await prisma.opportunity.findUnique({ where: { id } })
  if (!opp || opp.deletedAt) return null
  return opp
}

/** A few other live listings sharing this one's audience or region — keeps a
 * visitor browsing instead of leaving after a single listing. */
async function getSimilar(opp: { id: string; audience: string; region: string }) {
  const rows = await prisma.opportunity.findMany({
    where: {
      id: { not: opp.id },
      verified: true,
      deletedAt: null,
      OR: [{ audience: opp.audience }, ...(opp.region ? [{ region: opp.region }] : [])],
    },
    orderBy: { addedAt: 'desc' },
    take: 4,
  })
  // OpportunityCard expects the shared Opportunity type (addedAt as an ISO string,
  // matching the client-side /api/opportunities JSON shape, and audience/difficulty
  // narrowed to their known literal unions), not Prisma's raw String columns.
  return rows.map(r => ({ ...r, addedAt: r.addedAt.toISOString() })) as unknown as Opportunity[]
}

/** Real Resources related to this opportunity — the Opportunities →
 * Resources graph edge. Empty when nothing genuinely matches, rather
 * than forcing an unrelated category onto the page. */
async function getRelatedResources(opp: { audience: string; tags: string }) {
  const categories = relatedResourceCategories(opp)
  if (categories.length === 0) return []
  return prisma.resource.findMany({
    where: { category: { in: categories }, verified: true, deletedAt: null },
    orderBy: { addedAt: 'desc' },
    take: 3,
  })
}

/** Real, upcoming, published Mayatara gatherings related to this
 * opportunity — the Opportunities → Gatherings graph edge
 * (lib/opportunityGatheringMap.ts). Empty when nothing's genuinely
 * scheduled, same rule as everywhere else. */
async function getRelatedGatherings(opp: { audience: string; tags: string }) {
  const pool = await fetchUpcomingGatheringsPool()
  return matchGatheringsFromPool(opp, pool)
}

/** Real Pulse policy headlines related to this opportunity — the
 * Opportunities → Policy graph edge (lib/opportunityPulseMap.ts). Empty
 * when nothing genuinely matches. */
async function getRelatedPolicyReads(opp: { audience: string; tags: string }) {
  const pool = await fetchRecentPolicyItemsPool()
  return matchPolicyReadsFromPool(opp, pool)
}

/** Opted-in people directory profiles related to this opportunity — the
 * newest graph edge (lib/directoryMap.ts). Only ever people who chose to
 * be found; never derived from who saved or applied. */
async function getRelatedDirectory(opp: { audience: string; tags: string }) {
  const pool = await fetchDirectoryPool()
  return matchDirectoryFromPool(opp, pool)
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
  const similar = await getSimilar(opp)
  const relatedResources = await getRelatedResources(opp)
  const relatedGatherings = await getRelatedGatherings(opp)
  const relatedPolicyReads = await getRelatedPolicyReads(opp)
  const relatedDirectory = await getRelatedDirectory(opp)
  const chasingCount = await chasingCohortSize(opp.id)
  const pageUrl = `${SITE_URL}/opportunities/${opp.id}`

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px 80px' }}>
      <ViewTracker id={opp.id} />
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <Link href="/" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-2)', textDecoration: 'none' }}>
          ← Back to the board
        </Link>

        {opp.videoUrl ? (
          <VideoEmbed src={opp.videoUrl} />
        ) : opp.imageUrl && (
          <SafeImage
            src={opp.imageUrl}
            alt=""
            style={{
              display: 'block', width: '100%', maxHeight: 280, objectFit: 'cover',
              marginTop: 20, borderRadius: 3, border: '1.5px solid var(--line)',
              boxShadow: '4px 4px 0 var(--shadow)',
            }}
          />
        )}

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

          {opp.prepResources && (
            <div style={{ marginBottom: 20, padding: '14px 16px', background: 'var(--board)', borderRadius: 2, border: '1px solid var(--line)' }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--pin)', marginBottom: 6 }}>
                How to prepare
              </div>
              <div style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{opp.prepResources}</div>
            </div>
          )}

          <div id="related">
            {relatedResources.length > 0 ? (
              <div style={{ marginBottom: 20, padding: '14px 16px', background: 'var(--board)', borderRadius: 2, border: '1px solid var(--line)' }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--pin)', marginBottom: 8 }}>
                  📚 Resources that might help
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {relatedResources.map(r => (
                    <Link key={r.id} href={`/resources/${r.id}`} style={{ fontSize: 13.5, color: 'var(--pin)', textDecoration: 'none' }}>
                      {r.title} <span style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>· {r.category}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <RelatedPrompt text="No guides linked to this one yet." cta="Wanna add a guide? →" href="/resources/submit" />
            )}

            {relatedPolicyReads.length > 0 && (
              <div style={{ marginBottom: 20, padding: '14px 16px', background: 'var(--board)', borderRadius: 2, border: '1px solid var(--line)' }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--terracotta)', marginBottom: 8 }}>
                  📰 Policy reads
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {relatedPolicyReads.map(p => (
                    <a key={p.url} href={p.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13.5, color: 'var(--pin)', textDecoration: 'none' }}>
                      {p.title} <span style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>· {p.source}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {relatedGatherings.length > 0 ? (
              <div style={{ marginBottom: 20, padding: '14px 16px', background: 'var(--board)', borderRadius: 2, border: '1px solid var(--line)' }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 8 }}>
                  📍 Gatherings for people chasing this
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {relatedGatherings.map(g => (
                    <a key={g.slug} href={`/mayatara/events/${g.slug}`} style={{ fontSize: 13.5, color: 'var(--pin)', textDecoration: 'none' }}>
                      {g.title} <span style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>· {g.location}</span>
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <RelatedPrompt text="No gathering for people chasing this — yet." cta="Wanna create one? →" href="/mayatara/events/new" />
            )}

            {relatedDirectory.length > 0 ? (
              <div style={{ marginBottom: 20, padding: '14px 16px', background: 'var(--board)', borderRadius: 2, border: '1px solid var(--line)' }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--pin)', marginBottom: 8 }}>
                  🤝 {relatedDirectory.length} open to connect over this
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.6, marginBottom: 8 }}>
                  {relatedDirectory.slice(0, 4).map(d => d.displayName).join(', ')}
                  {relatedDirectory.length > 4 ? ` +${relatedDirectory.length - 4} more` : ''} opted in to be found for friends, dating, or a cofounder around this.
                </div>
                <Link href="/connect" style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--pin)', textDecoration: 'none' }}>Browse the directory & connect →</Link>
              </div>
            ) : (
              <RelatedPrompt text="Nobody's opted in to connect over this yet." cta="Wanna connect with a person? →" href="/connect" />
            )}

            {chasingCount > 0 && (
              <div style={{ marginBottom: 20, padding: '14px 16px', background: 'var(--board)', borderRadius: 2, border: '1px solid var(--line)' }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--terracotta)', marginBottom: 6 }}>
                  💘 {chasingCount} others also chasing this
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.6 }}>
                  No browsable list here — that would out who's applying to what. If you're linked with{' '}
                  <Link href="/mayatara" style={{ color: 'var(--pin)' }}>Mayatara</Link>, a real match within this group (if there's a good one) reveals itself the usual way, this Friday.
                </div>
              </div>
            )}

            <Discussion opportunityId={opp.id} />
          </div>

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

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10, fontFamily: 'var(--font-mono)', fontSize: 13, marginBottom: 24 }}>
            <a href={opp.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--pin)', fontWeight: 700, textDecoration: 'none' }}>
              Apply → {opp.url}
            </a>
            <SaveButton opportunityId={opp.id} />
          </div>

          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 8 }}>
              Know someone this is for?
            </div>
            <ShareBar title={opp.title} url={pageUrl} />
          </div>
        </div>

        {similar.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <div className="divider" style={{ marginBottom: 20 }}>
              <span>◆ Similar opportunities ◆</span>
            </div>
            <div style={{
              display: 'grid', gap: 20,
              gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
            }}>
              {similar.map(s => <OpportunityCard key={s.id} opp={s} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
