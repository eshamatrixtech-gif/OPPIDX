'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { OpportunityCard, type CardExtras } from '@/components/ui/OpportunityCard'
import { PulseCard, type PulseDigest } from '@/components/ui/PulseCard'
import { EventCard, type UpcomingEvent } from '@/components/ui/EventCard'
import { interleaveMulti } from '@/lib/feed/interleave'
import type { Opportunity } from '@/types'

// Same occasional cadence as /browse.
const PULSE_EVERY = 9
const EVENTS_EVERY = 15
const AUTO_LOAD_CAP = 240

/**
 * The full board below the day's picks.
 *
 * Page 1 arrives already rendered from the server (see lib/homeFeed.ts) —
 * this component's only job is to keep loading pages 2, 3, … as someone
 * scrolls, which genuinely needs the browser. It deliberately does not
 * re-fetch page 1: doing so was what made the old homepage paint empty and
 * then pop in.
 */
export default function HomeBoard({
  initialItems,
  initialExtras,
  boardTotal,
  featuredCount,
  pulseDigests,
  events,
}: {
  initialItems: Opportunity[]
  initialExtras: Record<string, CardExtras>
  boardTotal: number
  featuredCount: number
  pulseDigests: PulseDigest[]
  events: UpcomingEvent[]
}) {
  const [items, setItems] = useState<Opportunity[]>(initialItems)
  const [extras, setExtras] = useState<Record<string, CardExtras>>(initialExtras)
  const [page, setPage] = useState(1)
  const [restricted, setRestricted] = useState(false)
  const [teaser, setTeaser] = useState<{ title: string; org: string | null; descriptionPreview: string } | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)

  // Seeded from the server-rendered page so a listing already shown above
  // (in the picks) or below (in page 1) never renders twice.
  const shownIds = useRef<Set<string>>(new Set(initialItems.map(o => o.id)))
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const loadingRef = useRef(false)

  const hasMore = items.length < boardTotal - featuredCount && !restricted
  const autoLoadCapped = items.length >= AUTO_LOAD_CAP

  // Shared by the scroll sentinel and the manual "Load more" button past the
  // auto-load cap. `loadingRef` rather than the `loadingMore` state because
  // scroll fires far faster than React re-renders — a state check here would
  // let several pages request at once.
  const loadMore = useCallback(async () => {
    if (loadingRef.current) return
    loadingRef.current = true
    setLoadingMore(true)
    try {
      const res = await fetch(`/api/opportunities?page=${page + 1}`)
      const data = await res.json()
      const fresh = (data.items ?? []).filter((o: Opportunity) => !shownIds.current.has(o.id))
      for (const o of fresh) shownIds.current.add(o.id)
      setItems(prev => [...prev, ...fresh])
      setExtras(prev => ({ ...prev, ...(data.extras ?? {}) }))
      setRestricted(!!data.restricted)
      setTeaser(data.teaser ?? null)
      setPage(p => p + 1)
    } catch {
      // A failed page just stops the auto-load rather than killing the feed;
      // scrolling again retries.
    } finally {
      loadingRef.current = false
      setLoadingMore(false)
    }
  }, [page])

  useEffect(() => {
    if (!hasMore || autoLoadCapped) return
    function onScroll() {
      const el = sentinelRef.current
      if (!el) return
      if (el.getBoundingClientRect().top < window.innerHeight + 600) loadMore()
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [hasMore, autoLoadCapped, loadMore])

  const slots = interleaveMulti(items, [
    { kind: 'pulse', items: pulseDigests, every: PULSE_EVERY },
    { kind: 'event', items: events, every: EVENTS_EVERY },
  ])

  return (
    <>
      <div className="card-grid" style={{ ['--card-min' as string]: '260px', marginBottom: 20 }}>
        {slots.map(slot => {
          if (slot.kind === 'primary') {
            const opp = slot.item as Opportunity
            return <OpportunityCard key={opp.id} opp={opp} extras={extras[opp.id]} />
          }
          if (slot.kind === 'event') {
            const event = slot.item as UpcomingEvent
            return <EventCard key={`event-${event.slug}`} event={event} />
          }
          const digest = slot.item as PulseDigest
          return <PulseCard key={`pulse-${digest.period}`} digest={digest} />
        })}
      </div>

      <div ref={sentinelRef} />

      {loadingMore && (
        <div style={{ textAlign: 'center', padding: 20, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 12.5 }}>
          Loading more…
        </div>
      )}

      {restricted && teaser && (
        <div className="card-box" style={{ padding: '24px 22px', textAlign: 'center', marginTop: 10, marginBottom: 36 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--ink)', marginBottom: 8 }}>{teaser.title}</div>
          {teaser.org && <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginBottom: 8 }}>{teaser.org}</div>}
          <p style={{ fontSize: 12.5, color: 'var(--ink-2)', marginBottom: 16 }}>{teaser.descriptionPreview}…</p>
          <Link href="/pricing" className="btn-solid" style={{ padding: '10px 20px', fontSize: 13 }}>
            See the rest of the board →
          </Link>
        </div>
      )}

      {!restricted && !hasMore && items.length > 0 && (
        <div style={{ textAlign: 'center', padding: 20, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 12.5, marginBottom: 20 }}>
          That&apos;s every real opportunity on the board right now — check back, it&apos;s always growing.
        </div>
      )}

      {autoLoadCapped && hasMore && (
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <button onClick={loadMore} disabled={loadingMore} className="btn-outline" style={{ padding: '10px 22px', fontSize: 13 }}>
            Load more →
          </button>
        </div>
      )}
    </>
  )
}
