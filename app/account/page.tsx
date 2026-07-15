'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Status = {
  found: boolean
  email?: string
  isPaid?: boolean
  plan?: string
  subscriptionStatus?: string | null
  currentPeriodEnd?: string | null
}

const STATUS_MESSAGE: Record<string, { label: string; tone: 'ok' | 'warn' | 'off' }> = {
  active: { label: 'Active — full search unlocked.', tone: 'ok' },
  halted: { label: "There's an issue with your last payment — your card may have been declined. Renew below to keep full access.", tone: 'warn' },
  pending: { label: 'Your first payment is still processing.', tone: 'warn' },
  cancelled: { label: 'Cancelled — back to free, limited search.', tone: 'off' },
  completed: { label: 'This subscription has run its course — back to free, limited search.', tone: 'off' },
}

function toneColor(tone: 'ok' | 'warn' | 'off') {
  if (tone === 'ok') return 'var(--green)'
  if (tone === 'warn') return 'var(--danger)'
  return 'var(--ink-3)'
}

export default function AccountPage() {
  const [status, setStatus] = useState<Status | null>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [lookupState, setLookupState] = useState<'idle' | 'loading' | 'error'>('idle')
  const [cancelState, setCancelState] = useState<'idle' | 'confirming' | 'loading' | 'done'>('idle')

  useEffect(() => {
    fetch('/api/account/status')
      .then(r => r.json())
      .then(setStatus)
      .finally(() => setLoading(false))
  }, [])

  async function lookup(e: React.FormEvent) {
    e.preventDefault()
    setLookupState('loading')
    try {
      const res = await fetch('/api/account/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) { setLookupState('error'); return }
      setStatus(await res.json())
      setLookupState('idle')
    } catch {
      setLookupState('error')
    }
  }

  async function cancelSubscription() {
    setCancelState('loading')
    try {
      await fetch('/api/billing/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: status?.email ?? email }),
      })
    } finally {
      setCancelState('done')
      setStatus(s => s ? { ...s, isPaid: false, plan: 'free', subscriptionStatus: 'cancelled' } : s)
    }
  }

  const info = status?.subscriptionStatus ? STATUS_MESSAGE[status.subscriptionStatus] : null

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px 80px' }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <Link href="/" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-2)', textDecoration: 'none' }}>
          ← Back to OppIDX
        </Link>

        <div className="card-box" style={{ marginTop: 20, padding: '32px 28px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--ink)', marginBottom: 8 }}>
            Your subscription
          </h1>

          {loading ? (
            <div style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>Loading…</div>
          ) : !status?.found ? (
            <>
              <p style={{ color: 'var(--ink-2)', fontSize: 13.5, marginBottom: 20, lineHeight: 1.6 }}>
                {status === null ? '' : "We don't recognize this device. Enter the email you subscribed with to view or cancel your subscription."}
              </p>
              <form onSubmit={lookup} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  style={{
                    flex: 1, minWidth: 200, padding: '10px 14px', borderRadius: 2, border: '1.5px solid var(--line)',
                    background: 'var(--board)', color: 'var(--ink)', fontFamily: 'var(--font-mono)', fontSize: 13.5, outline: 'none',
                  }}
                />
                <button type="submit" disabled={lookupState === 'loading'} style={{
                  padding: '10px 20px', borderRadius: 2, border: 'none', cursor: 'pointer',
                  background: 'var(--btn-bg)', color: 'var(--btn-text)', fontFamily: 'var(--font-mono)',
                  fontSize: 13, fontWeight: 700,
                }}>
                  {lookupState === 'loading' ? 'Looking up…' : 'View status'}
                </button>
              </form>
              {lookupState === 'error' && (
                <div style={{ color: 'var(--danger)', fontSize: 12.5, marginTop: 10, fontFamily: 'var(--font-mono)' }}>
                  Something went wrong. Try again.
                </div>
              )}
            </>
          ) : (
            <>
              <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 16, fontFamily: 'var(--font-mono)' }}>{status.email}</div>

              <div style={{ padding: '14px 16px', background: 'var(--board)', borderRadius: 2, border: '1px solid var(--line)', marginBottom: 20 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--pin)', marginBottom: 6 }}>
                  Status
                </div>
                <div style={{ fontSize: 14, color: info ? toneColor(info.tone) : 'var(--ink)', fontWeight: 600, marginBottom: 4 }}>
                  {status.isPaid ? 'Paid subscriber' : 'Free tier'}
                </div>
                {info && (
                  <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6 }}>{info.label}</div>
                )}
                {status.isPaid && status.currentPeriodEnd && (
                  <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 8, fontFamily: 'var(--font-mono)' }}>
                    Renews {new Date(status.currentPeriodEnd).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                )}
              </div>

              {!status.isPaid && (
                <Link href="/pricing" style={{
                  display: 'inline-block', padding: '11px 22px', borderRadius: 2,
                  background: 'var(--btn-bg)', color: 'var(--btn-text)', textDecoration: 'none',
                  fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13,
                }}>
                  {status.subscriptionStatus === 'halted' ? 'Renew subscription →' : 'Subscribe →'}
                </Link>
              )}

              {status.isPaid && cancelState !== 'done' && (
                cancelState === 'confirming' ? (
                  <div>
                    <p style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 12 }}>
                      Cancel your subscription? This takes effect immediately — no more full search after this.
                    </p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={cancelSubscription} disabled={cancelState !== 'confirming'} style={{
                        padding: '10px 18px', borderRadius: 2, border: 'none', cursor: 'pointer',
                        background: 'var(--danger)', color: 'white', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700,
                      }}>
                        Yes, cancel
                      </button>
                      <button onClick={() => setCancelState('idle')} style={{
                        padding: '10px 18px', borderRadius: 2, border: '1.5px solid var(--line)', cursor: 'pointer',
                        background: 'var(--card)', color: 'var(--ink)', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700,
                      }}>
                        Never mind
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setCancelState('confirming')} style={{
                    padding: '10px 18px', borderRadius: 2, border: '1.5px solid var(--line)', cursor: 'pointer',
                    background: 'var(--card)', color: 'var(--ink)', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700,
                  }}>
                    Cancel subscription
                  </button>
                )
              )}

              {cancelState === 'done' && (
                <div style={{ fontSize: 13.5, color: 'var(--ink)', fontFamily: 'var(--font-mono)' }}>
                  ✓ Cancelled. You&apos;re back on the free tier.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
