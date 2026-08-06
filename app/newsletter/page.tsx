import Link from 'next/link'
import { getRecentDigests } from '@/lib/dailyDigest'
import { SOCIAL_CHANNELS_ENABLED } from '@/lib/socialChannels'

export const metadata = {
  title: 'Daily Digest — OppIDX',
  description: "Every day's real board numbers and hand-checked picks, archived and shareable.",
}

function formatDate(date: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-IN', { ...opts, timeZone: 'UTC' })
}

function GrowthChart({ points }: { points: { date: string; totalOpportunities: number }[] }) {
  if (points.length < 2) return null

  const width = 900
  const height = 160
  const padding = 8
  const values = points.map(p => p.totalOpportunities)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = Math.max(max - min, 1)
  const barWidth = (width - padding * (points.length + 1)) / points.length

  return (
    <div className="card-box" style={{ padding: '20px 18px 14px', marginBottom: 40 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>
        Board size over time
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }} preserveAspectRatio="none">
        {points.map((p, i) => {
          const barHeight = Math.max(((p.totalOpportunities - min) / range) * (height - 24), 4)
          const x = padding + i * (barWidth + padding)
          const y = height - barHeight
          return (
            <g key={p.date}>
              <rect x={x} y={y} width={barWidth} height={barHeight} fill="var(--pin)" opacity={i === points.length - 1 ? 1 : 0.55} rx={1} />
            </g>
          )
        })}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', marginTop: 6 }}>
        <span>{formatDate(points[0].date)}</span>
        <span>{formatDate(points[points.length - 1].date)}</span>
      </div>
    </div>
  )
}

export default async function NewsletterArchivePage() {
  const digests = await getRecentDigests(30)
  const chartPoints = [...digests].reverse().map(d => ({ date: d.date, totalOpportunities: d.totalOpportunities }))

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px 80px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <Link href="/" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-2)', textDecoration: 'none' }}>
          ← Back to OppIDX
        </Link>

        <div style={{ textAlign: 'center', margin: '30px 0 34px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--pin)', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
            ◆ OppIDX Daily ◆
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 4vw, 38px)', color: 'var(--ink)', marginBottom: 10 }}>
            The daily digest
          </h1>
          <p style={{ color: 'var(--ink-2)', fontSize: 13.5, maxWidth: 480, margin: '0 auto', lineHeight: 1.65 }}>
            Posted automatically every morning — real board numbers, plus a hand-checked pick. Archived here so anyone can browse or share a past day.
          </p>
        </div>

        {digests.length === 0 ? (
          <div className="card-box" style={{ padding: '40px var(--gutter)', textAlign: 'center' }}>
            <p style={{ color: 'var(--ink-2)', fontSize: 13.5, lineHeight: 1.65 }}>
              Nothing archived yet — the first daily digest posts tomorrow morning.
              {SOCIAL_CHANNELS_ENABLED && (
                <> Follow along on <a href="https://t.me/oppurtunityindex" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--pin)' }}>Telegram</a> in the meantime.</>
              )}
            </p>
          </div>
        ) : (
          <>
            <GrowthChart points={chartPoints} />

            <div className="divider" style={{ marginBottom: 20 }}>
              <span>◆ Recent digests ◆</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {digests.map(d => (
                <Link key={d.date} href={`/newsletter/${d.date}`} className="card-box" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 20px', textDecoration: 'none', flexWrap: 'wrap', gap: 8,
                }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--ink)' }}>
                    {formatDate(d.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)' }}>
                    {d.totalOpportunities.toLocaleString()} on the board · {d.newLast24h} new →
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
