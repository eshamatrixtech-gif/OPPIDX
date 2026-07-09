'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { OpportunityCard } from '@/components/ui/OpportunityCard'
import { Wordmark } from '@/components/ui/Wordmark'
import { useCountUp } from '@/lib/hooks/useCountUp'
import type { Opportunity, Stats } from '@/types'

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
        body: JSON.stringify({ email }),
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
    return <div style={{ fontSize: 13, color: 'var(--ink)', fontFamily: 'var(--font-mono)' }}>✓ You're on the list.</div>
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
        {state === 'sending' ? 'Joining…' : 'Get the newsletter'}
      </button>
      {state === 'error' && <span style={{ fontSize: 12, color: 'var(--danger)' }}>{msg}</span>}
    </form>
  )
}

export default function Home() {
  const [stats, setStats] = useState<Stats>({ opportunities: 0, viewed: 0, subscribers: 0 })
  const [featured, setFeatured] = useState<Opportunity[]>([])

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
    fetch('/api/opportunities?featured=true')
      .then(r => r.json())
      .then(data => setFeatured((data.items ?? []).slice(0, 10)))
      .catch(() => {})
  }, [])

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* ── Ticker ── */}
      <div style={{
        background: 'var(--pin)', color: 'var(--btn-text)', textAlign: 'center',
        padding: '7px 12px', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.12em',
        fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
      }}>
        ◆ Building the largest database of genuine opportunities. ◆ Real sources, updated hourly ◆
      </div>

      {/* ── Header / hero ── */}
      <header style={{ padding: '40px 24px 34px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 34 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src="/logo.png" alt="" width={46} height={46} style={{ display: 'block' }} />
              <Wordmark size={26} />
            </div>
            <Sparkle />
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 6vw, 52px)',
            lineHeight: 1.15, marginBottom: 18, maxWidth: 700, textTransform: 'uppercase',
          }}>
            <span style={{ color: 'var(--ink)' }}>Every real opportunity.</span><br />
            <span style={{ color: 'var(--pin)' }}>One honest board.</span>
          </h1>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700, letterSpacing: '0.02em',
            color: 'var(--pin)', maxWidth: 560, marginBottom: 16, textTransform: 'uppercase',
          }}>
            Building the largest database of genuine opportunities.
          </p>
          <p style={{ color: 'var(--ink-2)', fontSize: 14.5, maxWidth: 560, marginBottom: 30, lineHeight: 1.7 }}>
            Internships, scholarships, fellowships, grants, and competitions — for students, early-career job seekers, founders, and anyone chasing a real shot. Every listing checked before it's posted.
          </p>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 34 }}>
            <Link href="/browse" style={{
              display: 'inline-block', padding: '13px 26px', borderRadius: 2,
              background: 'var(--btn-bg)', color: 'var(--btn-text)', textDecoration: 'none',
              fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13.5, letterSpacing: '0.02em',
              boxShadow: '4px 4px 0 var(--shadow)',
            }}>
              Browse the database →
            </Link>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, borderTop: '1px solid var(--line)', paddingTop: 22 }}>
            <Counter value={stats.opportunities} label="Opportunities" />
            <Counter value={stats.viewed} label="Opportunities Viewed" />
            <Counter value={stats.subscribers} label="Subscribers" />
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 80px' }}>
        {/* ── Best of the week ── */}
        <div className="divider" style={{ marginBottom: 26 }}>
          <span>◆ Best opportunities this week ◆</span>
        </div>

        {featured.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 13, marginBottom: 20 }}>
            The editor's picks land here as soon as the first ones are curated.
          </div>
        ) : (
          <div style={{
            display: 'grid', gap: 26, marginBottom: 20,
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          }}>
            {featured.map(opp => <OpportunityCard key={opp.id} opp={opp} />)}
          </div>
        )}

        <div style={{ textAlign: 'center', marginBottom: 70 }}>
          <Link href="/browse" style={{
            fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--pin)', textDecoration: 'none',
          }}>
            See all {stats.opportunities.toLocaleString()} opportunities →
          </Link>
        </div>

        {/* ── Newsletter ── */}
        <div className="card-box" style={{ padding: '30px 28px', marginBottom: 70, textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}><Sparkle size={18} /></div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink)', marginBottom: 8 }}>
            Don't check the board every day.
          </h2>
          <p style={{ color: 'var(--ink-2)', fontSize: 13.5, marginBottom: 20 }}>
            One email, once a week, with the best new opportunities. No spam, no noise.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <SubscribeForm />
          </div>
        </div>

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
              Free to browse and search today. We're not running this as a charity — some features may come with a paid plan down the line.
            </p>
          </div>
        </div>
      </main>

      <footer style={{ borderTop: '1px solid var(--line)', padding: '22px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)' }}>
          <Link href="/philosophy" style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>Our philosophy</Link>
          <Link href="/terms" style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>Terms &amp; privacy</Link>
        </div>
      </footer>
    </div>
  )
}
