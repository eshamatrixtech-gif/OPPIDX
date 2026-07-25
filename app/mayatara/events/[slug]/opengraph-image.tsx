import { ImageResponse } from 'next/og'
import { supabaseAdmin } from '@/lib/mayatara/supabase'

export const alt = 'A Mayatara event'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const CREAM = '#F2E4C4'
const SAFFRON = '#D4600A'
const MAROON = '#8B1A1A'
const INK = '#2C1810'
const MUTED = '#6B4C35'

function formatWhen(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' })
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data: event } = supabaseAdmin
    ? await supabaseAdmin
        .from('events')
        .select('title, location, event_time, host_name, is_published')
        .eq('slug', slug)
        .single()
    : { data: null }

  const title = event?.title ?? 'A Mayatara event'
  const when = event?.event_time ? formatWhen(event.event_time) : ''
  const location = event?.location ?? ''

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: CREAM,
          padding: '64px 72px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 16, height: 16, borderRadius: 999, background: SAFFRON }} />
          <div style={{ fontSize: 26, fontWeight: 700, color: MAROON, letterSpacing: 3 }}>
            MAYATARA EVENTS
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ fontSize: 54, fontWeight: 700, color: INK, lineHeight: 1.15, display: 'flex' }}>
            {title.length > 80 ? title.slice(0, 80) + '…' : title}
          </div>
          {when && <div style={{ fontSize: 28, color: MUTED, display: 'flex' }}>{when}</div>}
          {location && <div style={{ fontSize: 26, color: MUTED, display: 'flex' }}>{location}</div>}
        </div>

        <div style={{ fontSize: 22, color: MAROON, display: 'flex' }}>
          Real gatherings, hosted by real people — oppidx.com/mayatara/events
        </div>
      </div>
    ),
    { ...size }
  )
}
