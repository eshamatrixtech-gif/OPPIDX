'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { OpportunityCard, type CardExtras } from '@/components/ui/OpportunityCard'
import { PulseCard, type PulseDigest } from '@/components/ui/PulseCard'
import { Wordmark } from '@/components/ui/Wordmark'
import { ShareBar } from '@/components/ui/ShareBar'
import { DISCORD_INVITE_URL } from '@/lib/discord'
import { SOCIAL_CHANNELS_ENABLED } from '@/lib/socialChannels'
import { SITE_URL } from '@/lib/siteUrl'
import { getStoredReferralCode } from '@/lib/clientReferral'
import { interleave } from '@/lib/feed/interleave'
import type { Opportunity } from '@/types'

// Same occasional cadence as /browse.
const PULSE_EVERY = 9
const AUTO_LOAD_CAP = 240

/** A fresh, genuinely random pick of `count` items every time this runs —
 * on every page load, not once a day. This is the free tier's "keep
 * checking back" hook: a real, honest, ever-changing sample — not the
 * whole board (that's the paid /browse search). */
function pickRandom<T>(pool: T[], count: number): T[] {
  const shuffled = [...pool]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, count)
}

function Sparkle({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="var(--pin)" strokeWidth="1.2" opacity={0.55}>
      <path d="M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4M19 5l-4 4M9 15l-4 4" strokeLinecap="round" />
    </svg>
  )
}

/** Routes straight into /browse's real search instead of asking anyone to
 * pick a room first — the hero's job is to get someone looking at real
 * opportunities in one action, not to explain the platform. */
function HeroSearch() {
  const router = useRouter()
  const [value, setValue] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    router.push(value.trim() ? `/browse?search=${encodeURIComponent(value.trim())}` : '/browse')
  }

  return (
    <form onSubmit={submit} style={{
      display: 'flex', alignItems: 'center', gap: 10, maxWidth: 560,
      background: 'var(--card)', border: '1.5px solid var(--line)', borderRadius: 3,
      padding: '11px 14px', marginBottom: 22, boxShadow: '3px 3px 0 var(--shadow)',
    }}>
      <span style={{ color: 'var(--ink-3)' }} aria-hidden>⌕</span>
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Search internships, scholarships, grants…"
        style={{
          flex: 1, border: 'none', outline: 'none', background: 'none',
          fontFamily: 'var(--font-mono)', fontSize: 13.5, color: 'var(--ink)',
        }}
      />
      <button type="submit" style={{
        padding: '8px 16px', borderRadius: 2, border: 'none', cursor: 'pointer',
        background: 'var(--btn-bg)', color: 'var(--btn-text)', fontFamily: 'var(--font-mono)',
        fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap',
      }}>
        Search
      </button>
    </form>
  )
}

function SubscribeForm() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setState('sending')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, ref: getStoredReferralCode() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong.')
      setState('done')
    } catch (err: any) {
      setMsg(err.message)
      setState('error')
    }
  }

  if (state === 'done') {
    return <div style={{ fontSize: 13, color: 'var(--ink)', fontFamily: 'var(--font-mono)' }}>✓ You're on the list — check your inbox for a welcome note now, then the week's top 10 every Monday.</div>
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <input
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="you@school.edu"
        style={{
          padding: '10px 14px', borderRadius: 2, border: '1.5px solid var(--line)',
          background: 'var(--card)', color: 'var(--ink)', fontFamily: 'var(--font-mono)',
          fontSize: 13, minWidth: 220, outline: 'none',
        }}
      />
      <button type="submit" disabled={state === 'sending'} style={{
        padding: '10px 20px', borderRadius: 2, border: 'none', cursor: 'pointer',
        background: 'var(--btn-bg)', color: 'var(--btn-text)', fontFamily: 'var(--font-mono)',
        fontSize: 13, fontWeight: 700, letterSpacing: '0.02em',
        boxShadow: '3px 3px 0 var(--shadow)',
      }}>
        {state === 'sending' ? 'Joining…' : 'Join the list'}
      </button>
      {state === 'error' && <span style={{ fontSize: 12, color: 'var(--danger)' }}>{msg}</span>}
    </form>
  )
}

const SIDEBAR_LINKS = [
  { href: '/resources', icon: '❖', label: 'Resources', desc: 'Prep guides, tools and communities.' },
  { href: '/mayatara/pulse', icon: '◈', label: 'The Pulse', desc: 'A daily, apolitical read on the country.' },
  { href: '/mayatara', icon: '◆', label: 'The Mayatara', desc: 'Find your person. One honest match, every Friday.' },
  { href: '/mayatara/events', icon: '📍', label: 'Events', desc: 'Real, upcoming gatherings.' },
]

/** Everything that isn't the feed itself — cross-product nav, newsletter,
 * share, social channels, and the "about" copy — folded into one slide-in
 * panel instead of competing with the feed for the top of the page. Click
 * a link inside and you land on that product's own page; nothing here is
 * duplicated into a tab bar anymore. */
function Sidebar({ open, onClose, sponsor }: { open: boolean; onClose: () => void; sponsor: { sponsorName: string; sponsorUrl: string; tagline: string } | null }) {
  return (
    <>
      <div
        onClick={onClose}
        aria-hidden={!open}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 90,
          opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: 'opacity 0.2s',
        }}
      />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(360px, 92vw)', zIndex: 91,
        background: 'var(--card)', borderLeft: '1.5px solid var(--line)', overflowY: 'auto',
        transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.22s ease',
        padding: '22px 22px 60px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <Wordmark size={18} />
          <button onClick={onClose} aria-label="Close" style={{
            border: 'none', background: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--ink-2)', lineHeight: 1,
          }}>×</button>
        </div>

        <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--pin)', marginBottom: 10 }}>
          Also from OppIDX
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 26 }}>
          {SIDEBAR_LINKS.map(l => (
            <Link key={l.href} href={l.href} onClick={onClose} className="card-box" style={{ padding: '12px 14px', textDecoration: 'none', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 16, color: 'var(--pin)' }}>{l.icon}</span>
              <span>
                <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12.5, color: 'var(--ink)', textTransform: 'uppercase' }}>{l.label}</span>
                <span style={{ display: 'block', fontSize: 11.5, color: 'var(--ink-2)', lineHeight: 1.4 }}>{l.desc}</span>
              </span>
            </Link>
          ))}
        </div>

        {sponsor && (
          <div style={{ fontSize: 11.5, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', marginBottom: 22, lineHeight: 1.6 }}>
            Today&apos;s picks brought to you by{' '}
            <a href={sponsor.sponsorUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--pin)' }}>{sponsor.sponsorName}</a>{' '}— {sponsor.tagline}
          </div>
        )}

        <div className="divider" style={{ marginBottom: 16 }}><span>◆ Newsletter ◆</span></div>
        <p style={{ color: 'var(--ink-2)', fontSize: 13, marginBottom: 12, lineHeight: 1.6 }}>
          A welcome note now, then the week&apos;s top 10 — ranked by genuine interest, not sponsorship — every Monday.
        </p>
        <div style={{ marginBottom: 10 }}><SubscribeForm /></div>
        <p style={{ fontSize: 11.5, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', marginBottom: 26 }}>
          Can&apos;t wait? <Link href="/newsletter" style={{ color: 'var(--pin)', textDecoration: 'underline' }}>See today&apos;s daily digest →</Link>
        </p>

        <div className="divider" style={{ marginBottom: 16 }}><span>◆ Share ◆</span></div>
        <div style={{ marginBottom: 26 }}><ShareBar title="OppIDX — every real opportunity, one honest board" url={SITE_URL} /></div>

        {SOCIAL_CHANNELS_ENABLED && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 26 }}>
            <a href="https://t.me/oppurtunityindex" target="_blank" rel="noopener noreferrer" style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 2,
              background: '#229ED9', color: '#fff', textDecoration: 'none',
              fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12.5,
            }}>✈ Join us on Telegram</a>
            <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer" style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 2,
              background: '#5865F2', color: '#fff', textDecoration: 'none',
              fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12.5,
            }}>◆ Join us on Discord</a>
          </div>
        )}

        <div style={{ marginBottom: 26 }}>
          <a href="https://www.producthunt.com/products/oppidx?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-oppidx" target="_blank" rel="noopener noreferrer">
            <img alt="OppIDX - Find your next opportunity. Find your people. | Product Hunt" width={250} height={54} src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1210507&theme=light&t=1785401051186" />
          </a>
        </div>

        <div className="divider" style={{ marginBottom: 16 }}><span>◆ About OppIDX ◆</span></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 26 }}>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--pin)', marginBottom: 4 }}>Why this exists</div>
            <p style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.6 }}>Real opportunities are scattered across a hundred different websites. We put them in one place, and check every one before it goes up.</p>
          </div>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--pin)', marginBottom: 4 }}>How it stays honest</div>
            <p style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.6 }}>Every number on this site is real, pulled live from our database — no inflated counts, ever.</p>
          </div>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--pin)', marginBottom: 4 }}>Have an opportunity to list?</div>
            <p style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.6 }}>Free, hand-reviewed. <Link href="/submit" style={{ color: 'var(--pin)' }}>Submit it →</Link></p>
          </div>
        </div>

        <div className="divider" style={{ marginBottom: 16 }}><span>◆ More ◆</span></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 12.5 }}>
          <Link href="/philosophy" style={{ color: 'var(--ink-2)', textDecoration: 'none' }}>Our philosophy</Link>
          <Link href="/saved" style={{ color: 'var(--ink-2)', textDecoration: 'none' }}>Saved</Link>
          <Link href="/submit" style={{ color: 'var(--ink-2)', textDecoration: 'none' }}>Enlist your opportunity (free)</Link>
          <Link href="/account" style={{ color: 'var(--ink-2)', textDecoration: 'none' }}>Manage subscription</Link>
          <Link href="/widget" style={{ color: 'var(--ink-2)', textDecoration: 'none' }}>Embed our widget</Link>
          <Link href="/advertise" style={{ color: 'var(--ink-2)', textDecoration: 'none' }}>Advertise with us</Link>
          <Link href="/terms" style={{ color: 'var(--ink-2)', textDecoration: 'none' }}>Terms &amp; privacy</Link>
        </div>
      </div>
    </>
  )
}

const LAST_VISIT_KEY = 'oppidx_last_visit'

export default function Home() {
  // null distinguishes "hasn't loaded yet" from "loaded, genuinely empty" —
  // collapsing those into a single [] / 0 initial state made every visitor
  // see a flash of "the editor's picks land here as soon as the first ones
  // are curated" and "See all 0 opportunities" on every load, before the
  // client fetch below even resolves, which reads as the site having no
  // content at all.
  const [featured, setFeatured] = useState<Opportunity[] | null>(null)
  const [featuredExtras, setFeaturedExtras] = useState<Record<string, CardExtras>>({})
  const [pulseDigests, setPulseDigests] = useState<PulseDigest[]>([])
  const [newSinceLastVisit, setNewSinceLastVisit] = useState<number | null>(null)
  const [sponsor, setSponsor] = useState<{ sponsorName: string; sponsorUrl: string; tagline: string } | null>(null)
  const [feedSponsor, setFeedSponsor] = useState<{ sponsorName: string; sponsorUrl: string; tagline: string } | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // ── The full board, as one continuous infinite-scroll feed below the
  // day's featured picks — same auto-load-on-scroll pattern as /browse,
  // minus the filter UI (that's what /browse itself is still for). ──
  const [boardItems, setBoardItems] = useState<Opportunity[]>([])
  const [boardExtras, setBoardExtras] = useState<Record<string, CardExtras>>({})
  const [boardTotal, setBoardTotal] = useState(0)
  const [boardPage, setBoardPage] = useState(0)
  const [boardRestricted, setBoardRestricted] = useState(false)
  const [boardTeaser, setBoardTeaser] = useState<{ title: string; org: string | null; descriptionPreview: string } | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const shownIds = useRef<Set<string>>(new Set())
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    fetch('/api/sponsor/active')
      .then(r => r.json())
      .then(data => setSponsor(data.sponsor))
      .catch(() => {})
    fetch('/api/sponsor/active?type=feed_card')
      .then(r => r.json())
      .then(data => setFeedSponsor(data.sponsor))
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch('/api/opportunities?featured=true')
      .then(r => r.json())
      .then(data => {
        const picks = pickRandom<Opportunity>(data.items ?? [], 10)
        setFeatured(picks)
        setFeaturedExtras(data.extras ?? {})
        for (const p of picks) shownIds.current.add(p.id)
      })
      .catch(() => setFeatured([]))
  }, [])

  useEffect(() => {
    fetch('/api/pulse/recent')
      .then(r => r.json())
      .then(data => setPulseDigests(data.items ?? []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const lastVisit = localStorage.getItem(LAST_VISIT_KEY)
    if (lastVisit) {
      fetch(`/api/opportunities/new-count?since=${encodeURIComponent(lastVisit)}`)
        .then(r => r.json())
        .then(data => { if (data.count > 0) setNewSinceLastVisit(data.count) })
        .catch(() => {})
    }
    localStorage.setItem(LAST_VISIT_KEY, new Date().toISOString())
  }, [])

  // Waits for `featured` to resolve first so page 1 of the board can skip
  // whatever's already showing up above it in the day's picks.
  useEffect(() => {
    if (featured === null) return
    fetch('/api/opportunities?page=1')
      .then(r => r.json())
      .then(data => {
        const items = (data.items ?? []).filter((o: Opportunity) => !shownIds.current.has(o.id))
        for (const o of items) shownIds.current.add(o.id)
        setBoardItems(items)
        setBoardExtras(data.extras ?? {})
        setBoardTotal(data.total ?? 0)
        setBoardRestricted(!!data.restricted)
        setBoardTeaser(data.teaser ?? null)
        setBoardPage(1)
      })
      .catch(() => {})
  }, [featured])

  async function loadMoreBoard() {
    if (loadingMore || boardPage === 0) return
    setLoadingMore(true)
    const nextPage = boardPage + 1
    try {
      const res = await fetch(`/api/opportunities?page=${nextPage}`)
      const data = await res.json()
      const items = (data.items ?? []).filter((o: Opportunity) => !shownIds.current.has(o.id))
      for (const o of items) shownIds.current.add(o.id)
      setBoardItems(prev => [...prev, ...items])
      setBoardExtras(prev => ({ ...prev, ...(data.extras ?? {}) }))
      setBoardRestricted(!!data.restricted)
      setBoardTeaser(data.teaser ?? null)
      setBoardPage(nextPage)
    } finally {
      setLoadingMore(false)
    }
  }

  const hasMore = boardPage > 0 && boardItems.length < boardTotal - (featured?.length ?? 0) && !boardRestricted
  const autoLoadCapped = boardItems.length >= AUTO_LOAD_CAP

  useEffect(() => {
    if (!hasMore || autoLoadCapped || loadingMore) return
    function onScroll() {
      const el = sentinelRef.current
      if (!el) return
      if (el.getBoundingClientRect().top < window.innerHeight + 600) loadMoreBoard()
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, autoLoadCapped, loadingMore, boardPage])

  const boardFeedSlots = interleave(boardItems, pulseDigests, PULSE_EVERY)

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* ── Ticker — leads with the real thing, not the platform pitch ── */}
      <div style={{
        background: 'var(--pin)', color: 'var(--btn-text)', textAlign: 'center',
        padding: '7px 12px', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.12em',
        fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
      }}>
        ◆ Real opportunities, verified before they go up ◆ Free to search in full, right now ◆
      </div>

      {/* ── Header / hero — opportunities first, everything else lives in
          the sidebar now (☰ More), not stacked below the feed. ── */}
      <header style={{ padding: '32px 24px 30px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 12, marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src="/logo.png" alt="" width={40} height={40} style={{ display: 'block' }} />
              <Wordmark size={22} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <Link href="/saved" style={{
                fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 700, color: 'var(--ink-2)',
                textDecoration: 'none', letterSpacing: '0.02em',
              }}>
                ★ Saved
              </Link>
              <Link href="/account" style={{
                fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 700, color: 'var(--ink-2)',
                textDecoration: 'none', letterSpacing: '0.02em',
              }}>
                Log in →
              </Link>
              <button onClick={() => setSidebarOpen(true)} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 2,
                border: '1.5px solid var(--line)', background: 'var(--card)', cursor: 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--ink)',
              }}>
                ☰ More
              </button>
              <Sparkle />
            </div>
          </div>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--pin)', marginBottom: 12 }}>
            ◆ By the youth, for the youth
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 4.4vw, 40px)',
            lineHeight: 1.18, marginBottom: 12, maxWidth: 640,
          }}>
            Find your next opportunity. Find your people.
          </h1>
          <p style={{ color: 'var(--ink-2)', fontSize: 14.5, maxWidth: 560, marginBottom: 8, lineHeight: 1.7 }}>
            We verify every listing before it goes up. No inflated numbers, no dead links.
          </p>
          <p style={{ color: 'var(--ink-3)', fontSize: 12.5, maxWidth: 560, marginBottom: 22, lineHeight: 1.6 }}>
            AI helps us write the daily policy digest from real headlines — everything else on the board is checked and added by hand.
          </p>

          <HeroSearch />

          {newSinceLastVisit !== null && (
            <div style={{
              display: 'inline-block', marginBottom: 20, padding: '9px 14px', borderRadius: 2,
              background: 'var(--board)', border: '1px solid var(--line)',
              fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 700, color: 'var(--pin)',
            }}>
              ✦ {newSinceLastVisit.toLocaleString()} new opportunit{newSinceLastVisit === 1 ? 'y' : 'ies'} since your last visit — keep scrolling ↓
            </div>
          )}

          <div className="card-box" style={{ padding: '16px 18px', maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.5 }}>
              A welcome note now, then the week&apos;s top 10 — ranked by genuine interest, not sponsorship — every Monday.
            </div>
            <SubscribeForm />
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div className="divider" style={{ marginBottom: 10 }}>
          <span>◆ Best opportunities right now — a fresh pick every visit ◆</span>
        </div>
        {featured === null ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 13, marginBottom: 20 }}>
            Loading today's picks…
          </div>
        ) : featured.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 13, marginBottom: 20 }}>
            The editor's picks land here as soon as the first ones are curated.
          </div>
        ) : (
          <div style={{
            display: 'grid', gap: 26, marginBottom: 40,
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          }}>
            {featured.map(item => <OpportunityCard key={item.id} opp={item} extras={featuredExtras[item.id]} />)}
          </div>
        )}

        {feedSponsor && (
          <a
            href={feedSponsor.sponsorUrl} target="_blank" rel="noopener noreferrer"
            className="card-box"
            style={{
              display: 'block', padding: '20px 22px', marginBottom: 40, textDecoration: 'none',
              border: '1.5px solid var(--pin)',
            }}
          >
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: 'var(--pin)', marginBottom: 8,
            }}>
              Sponsored
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--ink)', marginBottom: 4 }}>
              {feedSponsor.sponsorName}
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{feedSponsor.tagline}</div>
          </a>
        )}

        {/* ── The full board — keep scrolling, no separate tab ── */}
        <div className="divider" style={{ marginBottom: 20 }}>
          <span>◆ The full board ◆</span>
        </div>
        <div style={{
          display: 'grid', gap: 26, marginBottom: 20,
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        }}>
          {boardFeedSlots.map(slot => slot.kind === 'primary'
            ? <OpportunityCard key={slot.item.id} opp={slot.item} extras={boardExtras[slot.item.id]} />
            : <PulseCard key={`pulse-${slot.item.period}`} digest={slot.item} />
          )}
        </div>

        <div ref={sentinelRef} />

        {loadingMore && (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 12.5 }}>
            Loading more…
          </div>
        )}

        {boardRestricted && boardTeaser && (
          <div className="card-box" style={{ padding: '26px 24px', textAlign: 'center', marginTop: 10, marginBottom: 40 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--ink)', marginBottom: 8 }}>
              {boardTeaser.title}
            </div>
            {boardTeaser.org && <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginBottom: 8 }}>{boardTeaser.org}</div>}
            <p style={{ fontSize: 12.5, color: 'var(--ink-2)', marginBottom: 16 }}>{boardTeaser.descriptionPreview}…</p>
            <Link href="/pricing" style={{
              display: 'inline-block', padding: '10px 20px', borderRadius: 2,
              background: 'var(--btn-bg)', color: 'var(--btn-text)', textDecoration: 'none',
              fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13,
            }}>
              See the rest of the board →
            </Link>
          </div>
        )}

        {!boardRestricted && !hasMore && boardItems.length > 0 && (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 12.5, marginBottom: 20 }}>
            That&apos;s every real opportunity on the board right now — check back, it&apos;s always growing.
          </div>
        )}

        {autoLoadCapped && hasMore && (
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <button onClick={loadMoreBoard} disabled={loadingMore} style={{
              padding: '10px 22px', borderRadius: 2, border: '1.5px solid var(--line)', cursor: 'pointer',
              background: 'var(--card)', color: 'var(--ink)', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13,
            }}>
              Load more →
            </button>
          </div>
        )}
      </main>

      <footer style={{ borderTop: '1px solid var(--line)', padding: '22px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)' }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
            ☰ More from OppIDX
          </button>
          <Link href="/terms" style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>Terms &amp; privacy</Link>
        </div>
      </footer>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} sponsor={sponsor} />
    </div>
  )
}
