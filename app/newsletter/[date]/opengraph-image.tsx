import { ImageResponse } from 'next/og'
import { getDigestByDate } from '@/lib/dailyDigest'

export const alt = 'OppIDX Daily Digest'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

function formatDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  })
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ fontSize: 54, fontWeight: 700, color: '#c0432a', display: 'flex' }}>{value.toLocaleString()}</div>
      <div style={{ fontSize: 18, color: '#5b5346', letterSpacing: 1, textTransform: 'uppercase', display: 'flex' }}>{label}</div>
    </div>
  )
}

export default async function Image({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params
  const digest = await getDigestByDate(date)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#f5f0e8',
          padding: '64px 72px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 16, height: 16, borderRadius: 999, background: '#c0432a' }} />
          <div style={{ fontSize: 28, fontWeight: 700, color: '#2b2620', letterSpacing: 2 }}>
            OPPIDX DAILY
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ fontSize: 44, fontWeight: 700, color: '#2b2620', display: 'flex' }}>
            {digest ? formatDate(date) : 'Daily Digest'}
          </div>
          {digest && (
            <div style={{ display: 'flex', gap: 64 }}>
              <Stat value={digest.totalOpportunities} label="On the board" />
              <Stat value={digest.newLast24h} label="Added in 24h" />
              <Stat value={digest.opportunities.length} label="Today's picks" />
            </div>
          )}
        </div>

        <div style={{ fontSize: 22, color: '#5b5346', display: 'flex' }}>
          Real numbers, hand-checked picks — oppidx.com/newsletter
        </div>
      </div>
    ),
    { ...size }
  )
}
