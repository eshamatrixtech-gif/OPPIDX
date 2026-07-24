'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/authSupabase'

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

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 2, border: '1.5px solid var(--line)',
  background: 'var(--board)', color: 'var(--ink)', fontFamily: 'var(--font-mono)', fontSize: 13.5, outline: 'none',
}

const primaryBtnStyle: React.CSSProperties = {
  padding: '10px 20px', borderRadius: 2, border: 'none', cursor: 'pointer',
  background: 'var(--btn-bg)', color: 'var(--btn-text)', fontFamily: 'var(--font-mono)',
  fontSize: 13, fontWeight: 700,
}

export default function AccountPage() {
  const [status, setStatus] = useState<Status | null>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [lookupState, setLookupState] = useState<'idle' | 'loading' | 'error'>('idle')
  const [cancelState, setCancelState] = useState<'idle' | 'confirming' | 'loading' | 'done'>('idle')

  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authState, setAuthState] = useState<'idle' | 'loading' | 'error'>('idle')
  const [authError, setAuthError] = useState('')

  const refreshStatus = () =>
    fetch('/api/account/status').then(r => r.json()).then(setStatus)

  useEffect(() => {
    refreshStatus().finally(() => setLoading(false))
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

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setAuthState('loading')
    setAuthError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword })
    if (error || !data.session) {
      setAuthState('error')
      setAuthError('Wrong email or password.')
      return
    }
    await fetch('/api/account/link', {
      method: 'POST',
      headers: { Authorization: `Bearer ${data.session.access_token}` },
    })
    setAuthState('idle')
    await refreshStatus()
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setAuthState('loading')
    setAuthError('')
    const res = await fetch('/api/account/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: authEmail, password: authPassword }),
    })
    const data = await res.json()
    if (!res.ok) {
      setAuthState('error')
      setAuthError(data.error || 'Something went wrong.')
      return
    }
    // Account is created server-side (admin API) — that doesn't sign the
    // browser in, so do it explicitly, same as Mayatara's own register flow.
    await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword })
    setAuthState('idle')
    await refreshStatus()
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    await fetch('/api/account/logout', { method: 'POST' })
    setStatus({ found: false })
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
            Your account
          </h1>

          {loading ? (
            <div style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>Loading…</div>
          ) : !status?.found ? (
            <>
              <div style={{ display: 'flex', gap: 4, marginBottom: 18, borderBottom: '1.5px solid var(--line)' }}>
                <button
                  onClick={() => { setAuthTab('login'); setAuthState('idle'); setAuthError('') }}
                  style={{
                    padding: '8px 16px', border: 'none', background: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700,
                    color: authTab === 'login' ? 'var(--pin)' : 'var(--ink-3)',
                    borderBottom: authTab === 'login' ? '2px solid var(--pin)' : '2px solid transparent',
                    marginBottom: -1.5,
                  }}
                >
                  Log in
                </button>
                <button
                  onClick={() => { setAuthTab('signup'); setAuthState('idle'); setAuthError('') }}
                  style={{
                    padding: '8px 16px', border: 'none', background: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700,
                    color: authTab === 'signup' ? 'var(--pin)' : 'var(--ink-3)',
                    borderBottom: authTab === 'signup' ? '2px solid var(--pin)' : '2px solid transparent',
                    marginBottom: -1.5,
                  }}
                >
                  Create account
                </button>
              </div>

              <p style={{ color: 'var(--ink-2)', fontSize: 12.5, marginBottom: 16, lineHeight: 1.6 }}>
                Already have a Mayatara account? Log in here with the same email and password — it's the same account.
              </p>

              <form onSubmit={authTab === 'login' ? handleLogin : handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 10 }}>
                <input
                  type="email" required value={authEmail} onChange={e => setAuthEmail(e.target.value)}
                  placeholder="you@email.com" style={inputStyle}
                />
                <input
                  type="password" required value={authPassword} onChange={e => setAuthPassword(e.target.value)}
                  placeholder="Password" style={inputStyle}
                />
                <button type="submit" disabled={authState === 'loading'} style={primaryBtnStyle}>
                  {authState === 'loading' ? 'Please wait…' : authTab === 'login' ? 'Log in' : 'Create account'}
                </button>
              </form>
              {authState === 'error' && (
                <div style={{ color: 'var(--danger)', fontSize: 12.5, marginBottom: 20, fontFamily: 'var(--font-mono)' }}>
                  {authError}
                </div>
              )}

              <div style={{ borderTop: '1px solid var(--line)', paddingTop: 16, marginTop: 16 }}>
                <p style={{ color: 'var(--ink-3)', fontSize: 12, marginBottom: 12, fontFamily: 'var(--font-mono)' }}>
                  Or just look up an existing subscription by email — no password needed:
                </p>
                <form onSubmit={lookup} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <input
                    type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    style={{ ...inputStyle, flex: 1, minWidth: 200, width: 'auto' }}
                  />
                  <button type="submit" disabled={lookupState === 'loading'} style={primaryBtnStyle}>
                    {lookupState === 'loading' ? 'Looking up…' : 'View status'}
                  </button>
                </form>
                {lookupState === 'error' && (
                  <div style={{ color: 'var(--danger)', fontSize: 12.5, marginTop: 10, fontFamily: 'var(--font-mono)' }}>
                    Something went wrong. Try again.
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: 'var(--ink-2)', fontFamily: 'var(--font-mono)' }}>{status.email}</div>
                <button onClick={handleLogout} style={{
                  padding: '6px 12px', borderRadius: 2, border: '1.5px solid var(--line)', cursor: 'pointer',
                  background: 'var(--card)', color: 'var(--ink-2)', fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 700,
                }}>
                  Log out
                </button>
              </div>

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
                <div style={{ fontSize: 13.5, color: 'var(--ink)', fontFamily: 'var(--font-mono)', marginBottom: 20 }}>
                  ✓ Cancelled. You&apos;re back on the free tier.
                </div>
              )}

              <div style={{ borderTop: '1px solid var(--line)', paddingTop: 16, marginTop: 20 }}>
                <p style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                  Want to also find a match? <Link href="/mayatara/register" style={{ color: '#D4600A', textDecoration: 'underline' }}>Fill in your Mayatara profile →</Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
