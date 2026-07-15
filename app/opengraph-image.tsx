import { ImageResponse } from 'next/og'

export const alt = 'OppIDX — the opportunity board'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#f5f0e8',
          fontFamily: 'sans-serif',
          gap: 22,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 20, height: 20, borderRadius: 999, background: '#c0432a' }} />
          <div style={{ fontSize: 40, fontWeight: 700, color: '#2b2620', letterSpacing: 3 }}>OPPIDX</div>
        </div>
        <div style={{ fontSize: 52, fontWeight: 700, color: '#2b2620', textAlign: 'center', display: 'flex' }}>
          Every real opportunity.
        </div>
        <div style={{ fontSize: 52, fontWeight: 700, color: '#c0432a', textAlign: 'center', display: 'flex' }}>
          One honest board.
        </div>
      </div>
    ),
    { ...size }
  )
}
