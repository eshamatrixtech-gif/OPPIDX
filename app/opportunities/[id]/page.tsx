import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { ViewTracker } from '@/components/ui/ViewTracker'
import { ShareBar } from '@/components/ui/ShareBar'
import { SaveButton } from '@/components/ui/SaveButton'
import { OpportunityCard } from '@/components/ui/OpportunityCard'
import { SITE_URL } from '@/lib/siteUrl'
import { pageMetadata } from '@/lib/pageMetadata'
import { relatedResourceCategories } from '@/lib/opportunityResourceMap'
import { fetchUpcomingGatheringsPool, matchGatheringsFromPool } from '@/lib/opportunityGatheringMap'
import { chasingCohortSize } from '@/lib/chasingCohort'
import { fetchRecentPolicyItemsPool, matchPolicyReadsFromPool } from '@/lib/opportunityPulseMap'
import { Discussion } from '@/components/ui/Discussion'
import { SafeImage } from '@/components/ui/SafeImage'
import { VideoEmbed } from '@/components/ui/VideoEmbed'
import { GeneratedBanner } from '@/components/ui/GeneratedBanner'
import { EcosystemActions } from '@/components/ui/EcosystemActions'
import { isEligibleJobPosting } from '@/lib/seo/jobPosting'
import { Breadcrumbs, type BreadcrumbItem } from '@/components/ui/Breadcrumbs'
import { FEED_URL as JOBICY_SOURCE_URL } from '@/lib/scraper/sources/jobicy'
import { SOURCE_URL as ADZUNA_SOURCE_URL } from '@/lib/scraper/sources/adzuna'
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
async function getRelatedPolicyReads(opp: { audience: string; tags: string; country: string }) {
  const pool = await fetchRecentPolicyItemsPool()
  return matchPolicyReadsFromPool(opp, pool)
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const opp = await getOpportunity(id)
  if (!opp) return { title: 'Not found — OppIDX' }
  return pageMetadata({
    title: `${opp.title} — OppIDX`,
    // Prefer the original AI-written summary over a truncated raw
    // description — the raw text is usually scraped verbatim from the
    // original posting, so a meta description built from it tends to be
    // near-identical to what Indeed/LinkedIn/the employer's own listing
    // shows in the same search results. summary is genuinely unique copy.
    description: (opp.summary || opp.description).slice(0, 160),
    canonical: `${SITE_URL}/opportunities/${opp.id}`,
  })
}

// Real navigation path, not a fabricated one: Collections pages for
// STUDENT/EARLY_CAREER/FOUNDER already exist and are linked from the
// header nav (see lib/collectionDefs.ts); GENERAL has no dedicated
// collection, so it falls back to the real /browse listing instead.
const AUDIENCE_COLLECTION: Record<string, { slug: string; label: string }> = {
  STUDENT: { slug: 'students', label: 'Students' },
  EARLY_CAREER: { slug: 'early-career', label: 'Early Career' },
  FOUNDER: { slug: 'founders', label: 'Founders' },
}

function breadcrumbTrail(opp: { id: string; title: string; audience: string }): BreadcrumbItem[] {
  const collection = AUDIENCE_COLLECTION[opp.audience]
  return [
    { name: 'OppIDX', href: '/' },
    collection ? { name: collection.label, href: `/collections/${collection.slug}` } : { name: 'Browse', href: '/browse' },
    { name: opp.title, href: `/opportunities/${opp.id}` },
  ]
}

// Google's JobPosting rich result is for actual employment listings —
// applying it to a scholarship, grant, or competition would be structured-
// data misuse (and risks a manual action against the whole site), so this
// only fires for listings whose tags don't carry one of those non-job
// signals. No fabricated fields, ever: addressRegion/employmentType/
// baseSalary are only emitted when Opportunity actually has a real,
// source-derived value stored (see lib/scraper/normalize.ts and
// lib/scraper/sources/adzuna.ts for how those get populated honestly) —
// still omitted otherwise, same as validThrough/streetAddress/postalCode
// always are, since nothing in this pipeline captures those at all.
//
// hiringOrganization and a location signal (jobLocation, or jobLocationType
// "TELECOMMUTE" + applicantLocationRequirements) are both REQUIRED by
// Google's spec, not just recommended — a JobPosting missing either is
// invalid and won't qualify for the Google Jobs experience at all. Every
// branch below returns null rather than emit a script tag with one of
// those missing, since a page with no JobPosting markup is strictly better
// than one with structured data Google rejects.
function jobPostingJsonLd(opp: NonNullable<Awaited<ReturnType<typeof getOpportunity>>>, pageUrl: string): string | null {
  const tags = opp.tags.toLowerCase()
  if (!isEligibleJobPosting(opp)) return null // required org + location signal; never guess either

  const isRemote = /\bremote\b/i.test(opp.location ?? '') || /\bremote\b/i.test(opp.region ?? '')

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: opp.title,
    description: opp.description,
    datePosted: opp.addedAt.toISOString(),
    hiringOrganization: { '@type': 'Organization', name: opp.org },
    employmentType: opp.employmentType || (tags.includes('internship') || tags.includes('intern') ? 'INTERN' : undefined),
    directApply: false,
    url: pageUrl,
  }

  if (opp.salaryMin != null && opp.salaryMax != null && opp.salaryCurrency) {
    jsonLd.baseSalary = {
      '@type': 'MonetaryAmount',
      currency: opp.salaryCurrency,
      value: { '@type': 'QuantitativeValue', minValue: opp.salaryMin, maxValue: opp.salaryMax, unitText: 'YEAR' },
    }
  }

  // applicantLocationRequirements is required whenever jobLocationType is
  // TELECOMMUTE — a remote listing whose country we don't know can't
  // honestly satisfy that, so it falls through to the physical-location
  // branch instead (using its own location text, e.g. "Remote", verbatim)
  // rather than emit a TELECOMMUTE job with no applicantLocationRequirements.
  if (isRemote && opp.country) {
    jsonLd.jobLocationType = 'TELECOMMUTE'
    jsonLd.applicantLocationRequirements = { '@type': 'Country', name: opp.country }
  } else if (opp.location || opp.country) {
    jsonLd.jobLocation = {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: opp.location || undefined,
        addressRegion: opp.addressRegion || undefined,
        addressCountry: opp.country || undefined,
      },
    }
  } else {
    return null // no location signal at all — required property can't be satisfied
  }

  // Escaping "<" stops a "</script>" inside a scraped description from
  // closing the script tag early — standard JSON-LD embedding safeguard.
  return JSON.stringify(jsonLd).replace(/</g, '\\u003c')
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
  const chasingCount = await chasingCohortSize(opp.id)
  const pageUrl = `${SITE_URL}/opportunities/${opp.id}`
  const jobLd = jobPostingJsonLd(opp, pageUrl)

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px 80px' }}>
      {jobLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jobLd }} />}
      <ViewTracker id={opp.id} />
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <Breadcrumbs items={breadcrumbTrail(opp)} />

        {opp.videoUrl ? (
          <VideoEmbed src={opp.videoUrl} />
        ) : opp.imageUrl ? (
          <div style={{
            position: 'relative', height: 220, marginTop: 20, borderRadius: 3,
            border: '1.5px solid var(--line)', boxShadow: '4px 4px 0 var(--shadow)', overflow: 'hidden',
          }}>
            <SafeImage
              src={opp.imageUrl}
              alt={opp.org ? `${opp.title} at ${opp.org}` : opp.title}
              sizes="(max-width: 640px) 100vw, 640px"
              fallback={<GeneratedBanner id={opp.id} audience={opp.audience} height={220} />}
            />
          </div>
        ) : (
          <div style={{
            marginTop: 20, borderRadius: 3, border: '1.5px solid var(--line)',
            boxShadow: '4px 4px 0 var(--shadow)', overflow: 'hidden',
          }}>
            <GeneratedBanner id={opp.id} audience={opp.audience} height={220} />
          </div>
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

          {opp.summary && (
            <p style={{
              fontSize: 15, color: 'var(--ink)', lineHeight: 1.6, marginBottom: 18, fontWeight: 600,
              paddingLeft: 14, borderLeft: '3px solid var(--terracotta)',
            }}>
              {opp.summary}
            </p>
          )}

          <p style={{ fontSize: 14.5, color: 'var(--ink-2)', lineHeight: 1.75, marginBottom: 24, whiteSpace: 'pre-wrap' }}>
            {opp.description}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 26, fontSize: 13, fontFamily: 'var(--font-mono)' }}>
            {opp.location && <span>📍 {opp.location}</span>}
            {opp.compType && <span style={{ color: 'var(--green)', fontWeight: 600 }}>{opp.compType}</span>}
          </div>

          {opp.eligibility && (
            <div style={{ marginBottom: 20, padding: '14px 16px', background: 'var(--board)', borderRadius: 2, border: '1px solid var(--line)' }}>
              <h2 style={{ margin: 0, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--pin)', marginBottom: 6 }}>
                Who can apply
              </h2>
              <div style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.65 }}>{opp.eligibility}</div>
            </div>
          )}

          {opp.prepResources && (
            <div style={{ marginBottom: 20, padding: '14px 16px', background: 'var(--board)', borderRadius: 2, border: '1px solid var(--line)' }}>
              <h2 style={{ margin: 0, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--pin)', marginBottom: 6 }}>
                How to prepare
              </h2>
              <div style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{opp.prepResources}</div>
            </div>
          )}

          <div id="related">
            <EcosystemActions
              opp={{ id: opp.id, title: opp.title, tags: opp.tags, audience: opp.audience }}
              variant="full"
              hasResources={relatedResources.length > 0}
              hasGatherings={relatedGatherings.length > 0}
            />

            {relatedResources.length > 0 && (
              <div style={{ marginBottom: 20, padding: '14px 16px', background: 'var(--board)', borderRadius: 2, border: '1px solid var(--line)' }}>
                <h2 style={{ margin: 0, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--pin)', marginBottom: 8 }}>
                  📚 Resources that might help
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {relatedResources.map(r => (
                    <Link key={r.id} href={`/resources/${r.id}`} style={{ fontSize: 13.5, color: 'var(--pin)', textDecoration: 'none' }}>
                      {r.title} <span style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>· {r.category}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {relatedPolicyReads.length > 0 && (
              <div style={{ marginBottom: 20, padding: '14px 16px', background: 'var(--board)', borderRadius: 2, border: '1px solid var(--line)' }}>
                <h2 style={{ margin: 0, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--terracotta)', marginBottom: 8 }}>
                  📰 Policy reads
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {relatedPolicyReads.map(p => (
                    <a key={p.url} href={p.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13.5, color: 'var(--pin)', textDecoration: 'none' }}>
                      {p.title} <span style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>· {p.source}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {relatedGatherings.length > 0 && (
              <div style={{ marginBottom: 20, padding: '14px 16px', background: 'var(--board)', borderRadius: 2, border: '1px solid var(--line)' }}>
                <h2 style={{ margin: 0, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 8 }}>
                  📍 Gatherings for people chasing this
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {relatedGatherings.map(g => (
                    <a key={g.slug} href={`/events/${g.slug}`} style={{ fontSize: 13.5, color: 'var(--pin)', textDecoration: 'none' }}>
                      {g.title} <span style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>· {g.location}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {chasingCount > 0 && (
              <div style={{ marginBottom: 20, padding: '14px 16px', background: 'var(--board)', borderRadius: 2, border: '1px solid var(--line)' }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--terracotta)', marginBottom: 6 }}>
                  🫂 {chasingCount} others also chasing this
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.6 }}>
                  No browsable list here — that would out who&apos;s applying to what. If you&apos;ve used{' '}
                  <em>Find your person</em> above, a real match within this group (if there&apos;s a good one) reveals itself the usual way, this Friday.
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

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10, fontFamily: 'var(--font-mono)', fontSize: 13, marginBottom: 8 }}>
            <a href={opp.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--pin)', fontWeight: 700, textDecoration: 'none' }}>
              Apply → {opp.url}
            </a>
            <SaveButton opportunityId={opp.id} />
          </div>

          {/* Jobicy's API terms require this listing to credit them with a direct
              link — keyed off the exact sourceUrl lib/scraper/sources/jobicy.ts stores. */}
          {opp.sourceUrl === JOBICY_SOURCE_URL && (
            <div style={{ fontSize: 11.5, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', marginBottom: 16 }}>
              Found via <a href="https://jobicy.com/remote-jobs" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink-3)' }}>Jobicy</a>
            </div>
          )}

          {/* Same on-page credit convention as Jobicy above — keyed off the
              exact sourceUrl lib/scraper/sources/adzuna.ts stores. */}
          {opp.sourceUrl === ADZUNA_SOURCE_URL && (
            <div style={{ fontSize: 11.5, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', marginBottom: 16 }}>
              Found via <a href="https://www.adzuna.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink-3)' }}>Adzuna</a>
            </div>
          )}

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
