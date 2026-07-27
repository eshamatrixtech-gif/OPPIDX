'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { OpportunityCard, type CardExtras } from '@/components/ui/OpportunityCard'
import { PulseCard, type PulseDigest } from '@/components/ui/PulseCard'
import { Wordmark } from '@/components/ui/Wordmark'
import { ShareBar } from '@/components/ui/ShareBar'
import { useCountUp } from '@/lib/hooks/useCountUp'
import { DISCORD_INVITE_URL } from '@/lib/discord'
import { SOCIAL_CHANNELS_ENABLED } from '@/lib/socialChannels'
import { SITE_URL } from '@/lib/siteUrl'
import { getStoredReferralCode } from '@/lib/clientReferral'
import { interleave } from '@/lib/feed/interleave'
import type { Opportunity, Stats } from '@/types'

// Same occasional cadence as /browse.
const PULSE_EVERY = 9

/** Days since epoch (UTC) — the pick changes once a day and is identical
 * for every visitor within that day. No server-side state needed. The
 * scraper itself still runs hourly (real new listings show up all day
 * long) — this only governs which items the homepage's featured rotation
 * highlights. */
function daySeed(): number {
  return Math.floor(Date.now() / (24 * 60 * 60 * 1000))
}

/** Deterministic pick of `count` items from `pool`, stable for a given seed —
 * same picks for everyone today, different picks tomorrow. This is the
 * free tier's "keep checking back" hook: a real, honest, ever-changing
 * sample — not the whole board (that's the paid /browse search). */
function pickDaily<T>(pool: T[], count: number): T[] {
  let seed = daySeed()
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
  const shuffled = [...pool]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
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

function Counter({ value, label }: { value: number; label: string }) {
  const shown = useCountUp(value)
  return (
    <div style={{ textAlign: 'center', padding: '0 18px' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 34, color: 'var(--ink)' }}>
        {shown.toLocaleString()}
      </div>
      <div style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
        {label}
      </div>
    </div>
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

const LAST_VISIT_KEY = 'oppidx_last_visit'

export default function Home() {
  // null distinguishes "hasn't loaded yet" from "loaded, genuinely empty" —
  // collapsing those into a single [] / 0 initial state made every visitor
  // see a flash of "the editor's picks land here as soon as the first ones
  // are curated" and "See all 0 opportunities" on every load, before the
  // client fetch below even resolves, which reads as the site having no
  // content at all.
  const [stats, setStats] = useState<Stats | null>(null)
  const [featured, setFeatured] = useState<Opportunity[] | null>(null)
  const [featuredExtras, setFeaturedExtras] = useState<Record<string, CardExtras>>({})
  const [pulseDigests, setPulseDigests] = useState<PulseDigest[]>([])
  const [newSinceLastVisit, setNewSinceLastVisit] = useState<number | null>(null)
  const [sponsor, setSponsor] = useState<{ sponsorName: string; sponsorUrl: string; tagline: string } | null>(null)

  useEffect(() => {
    async function poll() {
      const res = await fetch('/api/stats').catch(() => null)
      if (res?.ok) setStats(await res.json())
    }
    poll()
    const id = setInterval(poll, 15_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    fetch('/api/sponsor/active')
      .then(r => r.json())
      .then(data => setSponsor(data.sponsor))
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch('/api/opportunities?featured=true')
      .then(r => r.json())
      .then(data => {
        setFeatured(pickDaily(data.items ?? [], 10))
        setFeaturedExtras(data.extras ?? {})
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

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* ── Ticker — leads with the real thing, not the platform pitch ── */}
      <div style={{
        background: 'var(--pin)', color: 'var(--btn-text)', textAlign: 'center',
        padding: '7px 12px', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.12em',
        fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
      }}>
        ◆ {stats ? stats.opportunities.toLocaleString() : 'Every'} real opportunities, verified before they go up ◆ Free to search in full, right now ◆
      </div>

      {/* ── Header / hero — opportunities first. What used to be the platform
          pitch ("five honest tools, pick where you start") is now a quieter
          section further down, not the first thing anyone sees. ── */}
      <header style={{ padding: '32px 24px 30px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 12, marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src="/logo.png" alt="" width={40} height={40} style={{ display: 'block' }} />
              <Wordmark size={22} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
              <Link href="/account" style={{
                fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 700, color: 'var(--ink-2)',
                textDecoration: 'none', letterSpacing: '0.02em',
              }}>
                Log in →
              </Link>
              <Sparkle />
            </div>
          </div>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--pin)', marginBottom: 12 }}>
            ◆ The board, not the maze
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 4.4vw, 40px)',
            lineHeight: 1.18, marginBottom: 12, maxWidth: 640,
          }}>
            Every real internship, scholarship and grant — one honest board.
          </h1>
          <p style={{ color: 'var(--ink-2)', fontSize: 14.5, maxWidth: 560, marginBottom: 22, lineHeight: 1.7 }}>
            We verify every listing before it goes up. No inflated numbers, no dead links.
          </p>

          <HeroSearch />

          {newSinceLastVisit !== null && (
            <Link href="/browse" style={{
              display: 'inline-block', marginBottom: 4, padding: '9px 14px', borderRadius: 2,
              background: 'var(--board)', border: '1px solid var(--line)', textDecoration: 'none',
              fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 700, color: 'var(--pin)',
            }}>
              ✦ {newSinceLastVisit.toLocaleString()} new opportunit{newSinceLastVisit === 1 ? 'y' : 'ies'} since your last visit — see what's new →
            </Link>
          )}
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
          <Counter value={stats?.opportunities ?? 0} label="Opportunities" />
        </div>
        <div style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', marginBottom: 30 }}>
          The board is constantly updated with new opportunities — this isn't a static list.
        </div>

        <div className="divider" style={{ marginBottom: 10 }}>
          <span>◆ Best opportunities right now — refreshed daily ◆</span>
        </div>
        {sponsor && (
          <div style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', marginBottom: 16 }}>
            Today&apos;s picks brought to you by{' '}
            <a href={sponsor.sponsorUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--pin)' }}>
              {sponsor.sponsorName}
            </a>{' '}— {sponsor.tagline}
          </div>
        )}
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
            display: 'grid', gap: 26, marginBottom: 20,
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          }}>
            {interleave(featured, pulseDigests, PULSE_EVERY).map(slot => slot.kind === 'primary'
              ? <OpportunityCard key={slot.item.id} opp={slot.item} extras={featuredExtras[slot.item.id]} />
              : <PulseCard key={`pulse-${slot.item.period}`} digest={slot.item} />
            )}
          </div>
        )}

        <div style={{ textAlign: 'center', marginBottom: 70 }}>
          <Link href="/browse" style={{
            fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--pin)', textDecoration: 'none',
          }}>
            See all {stats ? stats.opportunities.toLocaleString() : '…'} opportunities →
          </Link>
        </div>

        {/* ── Newsletter — the real thing, not a "launching soon" placeholder ── */}
        <div className="card-box" style={{ padding: '30px 28px', marginBottom: 70, textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}><Sparkle size={18} /></div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink)', marginBottom: 8 }}>
            Get the best of the board in your inbox.
          </h2>
          <p style={{ color: 'var(--ink-2)', fontSize: 13.5, marginBottom: 20 }}>
            A welcome note now, then the week's top 10 real opportunities — ranked by genuine interest, not sponsorship — every Monday. No spam, ever.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <SubscribeForm />
          </div>
          <p style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
            Can&apos;t wait? A free daily digest already posts every morning —{' '}
            <Link href="/newsletter" style={{ color: 'var(--pin)', textDecoration: 'underline' }}>see today&apos;s →</Link>
          </p>
        </div>

        {/* ── Share ── */}
        <div className="card-box" style={{ padding: '26px 28px', marginBottom: 70, textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink)', marginBottom: 8 }}>
            Know someone who&apos;d use this?
          </h2>
          <p style={{ color: 'var(--ink-2)', fontSize: 13.5, marginBottom: 18 }}>
            Send them the board — it costs nothing and it&apos;s real.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ShareBar title="OppIDX — every real opportunity, one honest board" url={SITE_URL} />
          </div>
        </div>

        {/* ── Also from OppIDX — secondary discovery, not the front door.
            Matchmaking and gatherings now surface contextually on the
            opportunity cards themselves (see the attachment strip); this
            row exists for people who already know they want Pulse or
            Resources specifically. ── */}
        <div className="divider" style={{ marginBottom: 20 }}>
          <span>◆ Also from OppIDX ◆</span>
        </div>
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: 70 }}>
          <Link href="/resources" className="card-box" style={{ padding: 18, textDecoration: 'none', display: 'block' }}>
            <div style={{ fontSize: 20, marginBottom: 6, color: 'var(--pin)' }}>❖</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13, color: 'var(--ink)', marginBottom: 4, textTransform: 'uppercase' }}>Resources</div>
            <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.5 }}>Prep guides, tools and communities.</div>
          </Link>
          <Link href="/mayatara/pulse" className="card-box" style={{ padding: 18, textDecoration: 'none', display: 'block' }}>
            <div style={{ fontSize: 20, marginBottom: 6, color: '#D4600A' }}>◈</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13, color: 'var(--ink)', marginBottom: 4, textTransform: 'uppercase' }}>The Pulse</div>
            <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.5 }}>A daily, apolitical read on the country.</div>
          </Link>
          <Link href="/mayatara" className="card-box" style={{ padding: 18, textDecoration: 'none', display: 'block' }}>
            <div style={{ fontSize: 20, marginBottom: 6, color: '#D4600A' }}>◆</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13, color: 'var(--ink)', marginBottom: 4, textTransform: 'uppercase' }}>The Mayatara</div>
            <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.5 }}>Find your person. One honest match, every Friday.</div>
          </Link>
        </div>

        {SOCIAL_CHANNELS_ENABLED && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 70 }}>
            <a href="https://t.me/oppurtunityindex" target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 2,
              background: '#229ED9', color: '#fff', textDecoration: 'none',
              fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12.5, letterSpacing: '0.02em',
              boxShadow: '3px 3px 0 var(--shadow)',
            }}>
              ✈ Join us on Telegram
            </a>
            <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 2,
              background: '#5865F2', color: '#fff', textDecoration: 'none',
              fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12.5, letterSpacing: '0.02em',
              boxShadow: '3px 3px 0 var(--shadow)',
            }}>
              ◆ Join us on Discord
            </a>
          </div>
        )}

        {/* ── About ── */}
        <div className="divider" style={{ marginBottom: 26 }}>
          <span>◆ About OppIDX ◆</span>
        </div>
        <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: 20 }}>
          <div className="card-box" style={{ padding: '20px 20px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--pin)', marginBottom: 8 }}>
              Why this exists
            </div>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.65 }}>
              Real opportunities are scattered across a hundred different websites. We put them in one place, and check every one before it goes up.
            </p>
          </div>
          <div className="card-box" style={{ padding: '20px 20px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--pin)', marginBottom: 8 }}>
              How it stays honest
            </div>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.65 }}>
              Every number on this page is real and pulled live from our database — no inflated counts, ever. Every listing links to its real source.
            </p>
          </div>
          <div className="card-box" style={{ padding: '20px 20px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--pin)', marginBottom: 8 }}>
              What it costs
            </div>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.65 }}>
              Free to search and browse in full right now, while we're growing. Listing an opportunity here costs the submitter a review fee, which is what keeps this collection genuinely curated instead of a free-for-all.
            </p>
          </div>
          <div className="card-box" style={{ padding: '20px 20px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--pin)', marginBottom: 8 }}>
              Have an opportunity to list?
            </div>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.65, marginBottom: 10 }}>
              We hand-review every public submission — genuine, verifiable, one clean application link, nothing else. <Link href="/submit" style={{ color: 'var(--pin)' }}>Submit it →</Link>
            </p>
          </div>
        </div>
      </main>

      <footer style={{ borderTop: '1px solid var(--line)', padding: '22px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)' }}>
          <Link href="/philosophy" style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>Our philosophy</Link>
          <Link href="/newsletter" style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>Daily digest</Link>
          <Link href="/saved" style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>Saved</Link>
          <Link href="/submit" style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>Enlist your opportunity (from ₹1,000)</Link>
          <Link href="/account" style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>Manage subscription</Link>
          {SOCIAL_CHANNELS_ENABLED && (
            <>
              <a href="https://t.me/oppurtunityindex" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>Telegram</a>
              <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>Discord</a>
            </>
          )}
          <Link href="/widget" style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>Embed our widget</Link>
          <Link href="/advertise" style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>Advertise with us</Link>
          <Link href="/terms" style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>Terms &amp; privacy</Link>
        </div>
      </footer>
    </div>
  )
}
