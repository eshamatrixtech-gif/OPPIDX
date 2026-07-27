'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { GeneratedAvatar } from '@/components/ui/GeneratedBanner'

interface DirectoryItem {
  id: string
  displayName: string
  lookingFor: string[]
  tags: string[]
  bio: string
}

const LOOKING_FOR_OPTIONS = [
  { id: 'friend', label: 'Friend', icon: '👋' },
  { id: 'dating', label: 'Dating', icon: '💘' },
  { id: 'cofounder', label: 'Cofounder', icon: '🤝' },
]

const LOOKING_FOR_LABEL: Record<string, string> = { friend: '👋 Friend', dating: '💘 Dating', cofounder: '🤝 Cofounder' }

function inputStyle(): React.CSSProperties {
  return {
    width: '100%', padding: '10px 14px', borderRadius: 2, border: '1.5px solid var(--line)',
    fontFamily: 'var(--font-mono)', fontSize: 13, background: 'var(--card)', color: 'var(--ink)',
    outline: 'none', marginBottom: 14,
  }
}

interface MineProfile {
  displayName: string
  lookingFor: string[]
  tags: string
  bio: string
}

/** Pre-filled from `initialData` when this is an edit (see ConnectPage's
 * `mine` state) — without this, reopening the form to tweak one field
 * would silently wipe every other field back to blank on submit, since
 * POST /api/directory always upserts the full profile, not a partial
 * patch. */
function JoinForm({ initialData, onJoined }: { initialData: MineProfile | null; onJoined: () => void }) {
  const [displayName, setDisplayName] = useState(initialData?.displayName ?? '')
  const [bio, setBio] = useState(initialData?.bio ?? '')
  const [tags, setTags] = useState(initialData?.tags ?? '')
  const [lookingFor, setLookingFor] = useState<string[]>(initialData?.lookingFor ?? [])
  const [email, setEmail] = useState('')
  const [needsEmail, setNeedsEmail] = useState(false)
  const [state, setState] = useState<'idle' | 'sending' | 'error'>('idle')
  const [error, setError] = useState('')

  function toggle(id: string) {
    setLookingFor(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id])
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setState('sending')
    setError('')
    try {
      const res = await fetch('/api/directory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, bio, tags, lookingFor, email: email || undefined }),
      })
      if (res.status === 401) {
        setNeedsEmail(true)
        setState('idle')
        return
      }
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.')
        setState('error')
        return
      }
      onJoined()
    } catch {
      setError('Something went wrong. Try again.')
      setState('error')
    }
  }

  return (
    <form onSubmit={submit}>
      <input style={inputStyle()} placeholder="Display name (shown publicly)" required value={displayName} onChange={e => setDisplayName(e.target.value)} />
      <textarea style={{ ...inputStyle(), minHeight: 80, resize: 'vertical' }} placeholder="A couple lines about you — what you're working on, what you'd love to find here" value={bio} onChange={e => setBio(e.target.value)} maxLength={500} />
      <input style={inputStyle()} placeholder="Interests / tags, comma-separated (e.g. ai, climate, product)" value={tags} onChange={e => setTags(e.target.value)} />

      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {LOOKING_FOR_OPTIONS.map(opt => {
          const active = lookingFor.includes(opt.id)
          return (
            <button
              key={opt.id} type="button" onClick={() => toggle(opt.id)}
              style={{
                padding: '8px 14px', borderRadius: 2, cursor: 'pointer', fontFamily: 'var(--font-mono)',
                fontSize: 12.5, fontWeight: 700,
                background: active ? 'var(--btn-bg)' : 'var(--card)',
                color: active ? 'var(--btn-text)' : 'var(--ink)',
                border: `1.5px solid ${active ? 'var(--btn-bg)' : 'var(--line)'}`,
              }}
            >
              {opt.icon} {opt.label}
            </button>
          )
        })}
      </div>

      {needsEmail && (
        <input style={inputStyle()} type="email" placeholder="Your email (never shown publicly — only used to relay 'Connect' messages to you)" required value={email} onChange={e => setEmail(e.target.value)} />
      )}

      {state === 'error' && <div style={{ color: 'var(--danger)', fontSize: 12.5, marginBottom: 14 }}>{error}</div>}

      <button type="submit" disabled={state === 'sending'} style={{
        padding: '11px 24px', borderRadius: 2, border: 'none', cursor: 'pointer',
        background: 'var(--btn-bg)', color: 'var(--btn-text)', fontFamily: 'var(--font-mono)',
        fontWeight: 700, fontSize: 13.5, letterSpacing: '0.02em', boxShadow: '3px 3px 0 var(--shadow)',
      }}>
        {state === 'sending' ? 'Saving…' : needsEmail ? 'Confirm and join →' : initialData ? 'Save changes →' : 'Join the directory →'}
      </button>
    </form>
  )
}

function ConnectModal({ item, onClose }: { item: DirectoryItem; onClose: () => void }) {
  const [fromEmail, setFromEmail] = useState('')
  const [message, setMessage] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')

  async function send(e: React.FormEvent) {
    e.preventDefault()
    setState('sending')
    setError('')
    try {
      const res = await fetch(`/api/directory/${item.id}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromEmail, message }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.')
        setState('error')
        return
      }
      setState('done')
    } catch {
      setError('Something went wrong. Try again.')
      setState('error')
    }
  }

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div onClick={e => e.stopPropagation()} className="card-box" style={{ padding: '28px 26px', maxWidth: 420, width: '100%' }}>
        {state === 'done' ? (
          <>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 19, color: 'var(--ink)', marginBottom: 8 }}>Sent.</h3>
            <p style={{ color: 'var(--ink-2)', fontSize: 13, marginBottom: 18, lineHeight: 1.6 }}>
              {item.displayName} will get your note by email with your address as reply-to — nothing more happens on our end.
            </p>
            <button onClick={onClose} style={{
              padding: '9px 18px', borderRadius: 2, border: '1.5px solid var(--line)', cursor: 'pointer',
              background: 'var(--card)', color: 'var(--ink)', fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 700,
            }}>Close</button>
          </>
        ) : (
          <form onSubmit={send}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 19, color: 'var(--ink)', marginBottom: 6 }}>Connect with {item.displayName}</h3>
            <p style={{ color: 'var(--ink-3)', fontSize: 12, marginBottom: 16, fontFamily: 'var(--font-mono)' }}>
              We relay this by email — your address only goes to them if they reply.
            </p>
            <input style={inputStyle()} type="email" placeholder="Your email" required value={fromEmail} onChange={e => setFromEmail(e.target.value)} />
            <textarea style={{ ...inputStyle(), minHeight: 90, resize: 'vertical' }} placeholder="Say a little about why you're reaching out" required value={message} onChange={e => setMessage(e.target.value)} maxLength={1000} />
            {state === 'error' && <div style={{ color: 'var(--danger)', fontSize: 12.5, marginBottom: 14 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" disabled={state === 'sending'} style={{
                padding: '10px 20px', borderRadius: 2, border: 'none', cursor: 'pointer',
                background: 'var(--btn-bg)', color: 'var(--btn-text)', fontFamily: 'var(--font-mono)',
                fontWeight: 700, fontSize: 13,
              }}>{state === 'sending' ? 'Sending…' : 'Send →'}</button>
              <button type="button" onClick={onClose} style={{
                padding: '10px 20px', borderRadius: 2, border: '1.5px solid var(--line)', cursor: 'pointer',
                background: 'var(--card)', color: 'var(--ink)', fontFamily: 'var(--font-mono)', fontSize: 13,
              }}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default function ConnectPage() {
  const [items, setItems] = useState<DirectoryItem[] | null>(null)
  const [filter, setFilter] = useState<string | null>(null)
  const [showJoin, setShowJoin] = useState(false)
  const [mine, setMine] = useState<MineProfile | null>(null)
  const [connectTarget, setConnectTarget] = useState<DirectoryItem | null>(null)

  function load() {
    fetch('/api/directory')
      .then(r => r.json())
      .then(data => setItems(data.items ?? []))
      .catch(() => setItems([]))
  }

  function loadMine() {
    fetch('/api/directory/mine')
      .then(r => r.json())
      .then(data => setMine(data.item ?? null))
      .catch(() => {})
  }

  useEffect(() => { load() }, [])
  useEffect(() => { loadMine() }, [])

  const filtered = items?.filter(i => !filter || i.lookingFor.includes(filter)) ?? []

  return (
    <div style={{ minHeight: '100vh', padding: '40px 24px 80px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <Link href="/" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-2)', textDecoration: 'none' }}>← Back to the board</Link>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 4.4vw, 38px)',
          lineHeight: 1.18, margin: '16px 0 10px', maxWidth: 640,
        }}>
          The people&apos;s directory.
        </h1>
        <p style={{ color: 'var(--ink-2)', fontSize: 14, maxWidth: 560, marginBottom: 24, lineHeight: 1.7 }}>
          Opt-in only — nobody ends up here just for saving or applying to something. People who want to be found for a friend, a date, or a cofounder list themselves; you reach them by email, never a public inbox.
        </p>

        <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={() => setFilter(null)} style={{
            padding: '7px 14px', borderRadius: 2, cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
            background: !filter ? 'var(--btn-bg)' : 'var(--card)', color: !filter ? 'var(--btn-text)' : 'var(--ink)',
            border: `1.5px solid ${!filter ? 'var(--btn-bg)' : 'var(--line)'}`,
          }}>Everyone</button>
          {LOOKING_FOR_OPTIONS.map(opt => (
            <button key={opt.id} onClick={() => setFilter(opt.id)} style={{
              padding: '7px 14px', borderRadius: 2, cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
              background: filter === opt.id ? 'var(--btn-bg)' : 'var(--card)', color: filter === opt.id ? 'var(--btn-text)' : 'var(--ink)',
              border: `1.5px solid ${filter === opt.id ? 'var(--btn-bg)' : 'var(--line)'}`,
            }}>{opt.icon} {opt.label}</button>
          ))}
          <div style={{ flex: 1 }} />
          <button onClick={() => setShowJoin(s => !s)} style={{
            padding: '9px 16px', borderRadius: 2, border: 'none', cursor: 'pointer',
            background: 'var(--pin)', color: '#fff', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12.5,
            boxShadow: '3px 3px 0 var(--shadow)',
          }}>{mine ? '✓ You\'re listed — edit' : '+ List yourself'}</button>
        </div>

        {showJoin && (
          <div className="card-box" style={{ padding: '24px 24px', marginBottom: 30 }}>
            <JoinForm initialData={mine} onJoined={() => { setShowJoin(false); loadMine(); load() }} />
          </div>
        )}

        {items === null ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
            Nobody&apos;s listed here yet — be the first.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
            {filtered.map(item => (
              <div key={item.id} className="card-box" style={{ padding: '18px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <GeneratedAvatar id={item.id} name={item.displayName} size={38} />
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--ink)' }}>{item.displayName}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                  {item.lookingFor.map(lf => (
                    <span key={lf} style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--ink-2)', background: 'rgba(43,38,32,0.06)', borderRadius: 20, padding: '2px 9px' }}>
                      {LOOKING_FOR_LABEL[lf] ?? lf}
                    </span>
                  ))}
                </div>
                {item.bio && <p style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.55, marginBottom: 12 }}>{item.bio}</p>}
                {item.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
                    {item.tags.slice(0, 5).map(t => (
                      <span key={t} style={{ fontSize: 10, color: 'var(--ink-2)', background: 'rgba(43,38,32,0.06)', borderRadius: 2, padding: '2px 8px', fontFamily: 'var(--font-mono)' }}>#{t}</span>
                    ))}
                  </div>
                )}
                <button onClick={() => setConnectTarget(item)} style={{
                  padding: '7px 14px', borderRadius: 2, border: '1.5px solid var(--pin)', cursor: 'pointer',
                  background: 'transparent', color: 'var(--pin)', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12,
                }}>Connect →</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {connectTarget && <ConnectModal item={connectTarget} onClose={() => setConnectTarget(null)} />}
    </div>
  )
}
