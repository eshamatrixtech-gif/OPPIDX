import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getDigestByDate } from '@/lib/dailyDigest'
import { OpportunityCard } from '@/components/ui/OpportunityCard'
import { ShareBar } from '@/components/ui/ShareBar'
import { SITE_URL } from '@/lib/siteUrl'
import { pageMetadata } from '@/lib/pageMetadata'

function formatDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  })
}

export async function generateMetadata({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params
  const digest = await getDigestByDate(date)
  if (!digest) return { title: 'Not found — OppIDX' }
  return pageMetadata({
    title: `Daily digest — ${formatDate(date)} — OppIDX`,
    description: `${digest.totalOpportunities.toLocaleString()} real opportunities on the board, ${digest.newLast24h} added in the last 24 hours. Today's picks, hand-verified.`,
    canonical: `${SITE_URL}/newsletter/${date}`,
  })
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="card-box" style={{ padding: '22px 18px', textAlign: 'center', flex: '1 1 150px' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 34, color: 'var(--pin)' }}>{value.toLocaleString()}</div>
      <div style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', marginTop: 6 }}>
        {label}
      </div>
    </div>
  )
}

export default async function DailyDigestPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params
  const digest = await getDigestByDate(date)
  if (!digest) notFound()

  const pageUrl = `${SITE_URL}/newsletter/${date}`

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px 80px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <Link href="/newsletter" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-2)', textDecoration: 'none' }}>
          ← All digests
        </Link>

        <div style={{ textAlign: 'center', margin: '30px 0 34px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--pin)', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
            ◆ Daily Digest ◆
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 4vw, 36px)', color: 'var(--ink)', marginBottom: 10 }}>
            {formatDate(date)}
          </h1>
          <p style={{ color: 'var(--ink-2)', fontSize: 13.5, maxWidth: 480, margin: '0 auto 18px', lineHeight: 1.65 }}>
            The real state of the board today, plus a hand-checked pick of what&apos;s worth applying to.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ShareBar title={`OppIDX Daily — ${formatDate(date)}`} url={pageUrl} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 44 }}>
          <Stat value={digest.totalOpportunities} label="On the board" />
          <Stat value={digest.newLast24h} label="Added in 24h" />
          <Stat value={digest.opportunities.length} label="Today's picks" />
        </div>

        <div className="divider" style={{ marginBottom: 20 }}>
          <span>◆ Today&apos;s picks ◆</span>
        </div>

        {digest.opportunities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
            The picks featured that day are no longer on the board.
          </div>
        ) : (
          <div className="card-grid" style={{ ['--card-min' as string]: '260px', marginBottom: 20 }}>
            {digest.opportunities.map(opp => <OpportunityCard key={opp.id} opp={opp} />)}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 50 }}>
          <Link href="/browse" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--pin)', textDecoration: 'none' }}>
            See all {digest.totalOpportunities.toLocaleString()} opportunities →
          </Link>
        </div>
      </div>
    </div>
  )
}
