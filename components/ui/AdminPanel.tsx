'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Wordmark } from '@/components/ui/Wordmark'
import type { Opportunity, ScrapeRun, Subscriber, SponsoredSlot } from '@/types'

const AUDIENCES = ['STUDENT', 'EARLY_CAREER', 'FOUNDER', 'GENERAL']
const DIFFICULTIES = ['Easy', 'Medium', 'Hard']

const EMPTY_FORM = {
  title: '', description: '', url: '', org: '', audience: 'STUDENT',
  eligibility: '', prepResources: '', difficulty: 'Medium',
  tags: '', location: '', compType: '', verified: false, featured: false,
  source: 'user-provided', sourceUrl: '',
}

function inputStyle(): React.CSSProperties {
  return {
    width: '100%', padding: '9px 12px', borderRadius: 2, border: '1.5px solid var(--line)',
    fontFamily: 'var(--font-mono)', fontSize: 13, background: 'var(--card)', color: 'var(--ink)',
    outline: 'none', marginBottom: 12,
  }
}

function AddForm({ onAdded }: { onAdded: () => void }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function set<K extends keyof typeof EMPTY_FORM>(key: K, value: typeof EMPTY_FORM[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to add.')
      setForm(EMPTY_FORM)
      onAdded()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} style={{ maxWidth: 480 }}>
      <input style={inputStyle()} placeholder="Title" required value={form.title} onChange={e => set('title', e.target.value)} />
      <textarea style={{ ...inputStyle(), minHeight: 90, resize: 'vertical' }} placeholder="Description" required value={form.description} onChange={e => set('description', e.target.value)} />
      <input style={inputStyle()} placeholder="Application URL (https://…)" required value={form.url} onChange={e => set('url', e.target.value)} />
      <input style={inputStyle()} placeholder="Org / company / university" value={form.org} onChange={e => set('org', e.target.value)} />
      <select style={inputStyle()} value={form.audience} onChange={e => set('audience', e.target.value)}>
        {AUDIENCES.map(a => <option key={a} value={a}>{a}</option>)}
      </select>
      <textarea style={{ ...inputStyle(), minHeight: 60, resize: 'vertical' }} placeholder="Eligibility (who can actually apply)" required value={form.eligibility} onChange={e => set('eligibility', e.target.value)} />
      <textarea style={{ ...inputStyle(), minHeight: 60, resize: 'vertical' }} placeholder="Suggested prep resources" value={form.prepResources} onChange={e => set('prepResources', e.target.value)} />
      <select style={inputStyle()} value={form.difficulty} onChange={e => set('difficulty', e.target.value)}>
        {DIFFICULTIES.map(d => <option key={d} value={d}>{d} difficulty</option>)}
      </select>
      <input style={inputStyle()} placeholder="Tags, comma-separated (remote,paid,ai)" value={form.tags} onChange={e => set('tags', e.target.value)} />
      <input style={inputStyle()} placeholder="Location" value={form.location} onChange={e => set('location', e.target.value)} />
      <input style={inputStyle()} placeholder="Compensation (Paid / Unpaid / Stipend)" value={form.compType} onChange={e => set('compType', e.target.value)} />
      <input style={inputStyle()} placeholder="Source URL (where you verified this)" value={form.sourceUrl} onChange={e => set('sourceUrl', e.target.value)} />
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>
        <input type="checkbox" checked={form.verified} onChange={e => set('verified', e.target.checked)} />
        Mark verified immediately
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>
        <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} />
        Feature on homepage ("best of the week")
      </label>
      {error && <div style={{ color: 'var(--danger)', fontSize: 12.5, marginBottom: 10 }}>{error}</div>}
      <button type="submit" disabled={saving} style={{
        padding: '10px 22px', borderRadius: 2, border: 'none', cursor: 'pointer',
        background: 'var(--btn-bg)', color: 'var(--btn-text)', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13, letterSpacing: '0.02em',
        boxShadow: '3px 3px 0 var(--shadow)',
      }}>
        {saving ? 'Adding…' : 'Add opportunity'}
      </button>
    </form>
  )
}

function Row({ opp, onChanged }: { opp: Opportunity; onChanged: () => void }) {
  async function patch(data: Record<string, unknown>) {
    await fetch(`/api/opportunities/${opp.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    onChanged()
  }

  return (
    <div className="card-box" style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
      padding: '12px 16px', marginBottom: 12,
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {opp.title}
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
          {opp.audience} · {opp.verified ? 'verified' : 'needs review'} · {opp.featured ? 'featured' : ''} {opp.viewCount} views
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        {!opp.verified && (
          <button onClick={() => patch({ verified: true })} style={btnStyle('var(--green)')}>Verify</button>
        )}
        {opp.verified && (
          <button onClick={() => patch({ featured: !opp.featured })} style={btnStyle('var(--pin)')}>
            {opp.featured ? 'Unfeature' : 'Feature'}
          </button>
        )}
        <button onClick={() => patch({ delete: true })} style={btnStyle('var(--danger)')}>Delete</button>
      </div>
    </div>
  )
}

function ScraperPanel() {
  const [runs, setRuns] = useState<ScrapeRun[]>([])
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')

  async function refresh() {
    const res = await fetch('/api/scrape')
    const data = await res.json()
    setRuns(data.runs ?? [])
  }

  useEffect(() => { refresh() }, [])

  async function runNow() {
    setRunning(true)
    setError('')
    try {
      const res = await fetch('/api/scrape', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Run failed.')
      await refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 12.5, color: 'var(--ink-2)', fontFamily: 'var(--font-mono)' }}>
          Runs automatically every hour, in-process — no external cron or Claude session needed.
        </div>
        <button onClick={runNow} disabled={running} style={{
          padding: '8px 16px', borderRadius: 2, border: 'none', cursor: 'pointer',
          background: 'var(--btn-bg)', color: 'var(--btn-text)', fontFamily: 'var(--font-mono)',
          fontWeight: 700, fontSize: 12.5, flexShrink: 0,
        }}>
          {running ? 'Running…' : 'Run now'}
        </button>
      </div>
      {error && <div style={{ color: 'var(--danger)', fontSize: 12.5, marginBottom: 10 }}>{error}</div>}
      {runs.length === 0 ? (
        <div style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>No runs yet.</div>
      ) : (
        runs.map(run => {
          let details: Record<string, { fetched: number; added: number; error: string | null }> = {}
          try { details = JSON.parse(run.details) } catch { /* ignore malformed row */ }
          return (
            <div key={run.id} className="card-box" style={{ padding: '12px 16px', marginBottom: 12 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>
                {new Date(run.startedAt).toLocaleString()} — added {run.added}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                {Object.entries(details).map(([name, s]) => (
                  <div key={name}>
                    {name}: {s.fetched} fetched, {s.added} added{s.error ? ` — error: ${s.error}` : ''}
                  </div>
                ))}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

function SubscribersPanel() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [cancellingAll, setCancellingAll] = useState(false)
  const [error, setError] = useState('')

  async function refresh() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/subscribers')
      const data = await res.json()
      setSubscribers(data.subscribers ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  async function cancelOne(sub: Subscriber) {
    if (!confirm(`Cancel ${sub.email}'s subscription immediately?`)) return
    setBusyId(sub.id)
    setError('')
    try {
      const res = await fetch(`/api/admin/subscribers/${sub.id}/cancel`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to cancel.')
      await refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  async function cancelAll() {
    const activeCount = subscribers.filter(s => s.plan === 'paid').length
    if (activeCount === 0) return
    if (!confirm(`Cancel ALL ${activeCount} active paid subscriptions immediately? This cannot be undone.`)) return
    setCancellingAll(true)
    setError('')
    try {
      const res = await fetch('/api/admin/subscribers/cancel-all', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to cancel all.')
      if (data.failed?.length) {
        setError(`Cancelled ${data.cancelled}/${data.totalActive}. Failed: ${data.failed.map((f: any) => f.email).join(', ')}`)
      }
      await refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setCancellingAll(false)
    }
  }

  const activeCount = subscribers.filter(s => s.plan === 'paid').length

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 12.5, color: 'var(--ink-2)', fontFamily: 'var(--font-mono)' }}>
          {subscribers.length} total · {activeCount} active paid
        </div>
        <button
          onClick={cancelAll}
          disabled={cancellingAll || activeCount === 0}
          style={{
            padding: '8px 16px', borderRadius: 2, border: 'none', cursor: activeCount === 0 ? 'default' : 'pointer',
            background: 'var(--danger)', color: 'white', fontFamily: 'var(--font-mono)',
            fontWeight: 700, fontSize: 12.5, flexShrink: 0, opacity: activeCount === 0 ? 0.5 : 1,
          }}
        >
          {cancellingAll ? 'Cancelling all…' : `Cancel all (${activeCount})`}
        </button>
      </div>
      {error && <div style={{ color: 'var(--danger)', fontSize: 12.5, marginBottom: 12 }}>{error}</div>}
      {loading ? (
        <div style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>Loading…</div>
      ) : subscribers.length === 0 ? (
        <div style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>No subscribers yet.</div>
      ) : (
        subscribers.map(sub => (
          <div key={sub.id} className="card-box" style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
            padding: '12px 16px', marginBottom: 12,
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {sub.email}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
                {sub.plan} · {sub.subscriptionStatus ?? 'no subscription'} · joined {new Date(sub.subscribedAt).toLocaleDateString()}
                {sub.currentPeriodEnd ? ` · renews ${new Date(sub.currentPeriodEnd).toLocaleDateString()}` : ''}
              </div>
            </div>
            {sub.plan === 'paid' && (
              <button
                onClick={() => cancelOne(sub)}
                disabled={busyId === sub.id}
                style={btnStyle('var(--danger)')}
              >
                {busyId === sub.id ? 'Cancelling…' : 'Cancel'}
              </button>
            )}
          </div>
        ))
      )}
    </div>
  )
}

const EMPTY_SPONSOR_FORM = { sponsorName: '', sponsorUrl: '', tagline: '', startDate: '', endDate: '' }

function SponsorPanel() {
  const [slots, setSlots] = useState<SponsoredSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY_SPONSOR_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set<K extends keyof typeof EMPTY_SPONSOR_FORM>(key: K, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function refresh() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/sponsor-slots')
      const data = await res.json()
      setSlots(data.slots ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/admin/sponsor-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to book slot.')
      setForm(EMPTY_SPONSOR_FORM)
      await refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('Cancel this sponsor slot?')) return
    await fetch(`/api/admin/sponsor-slots/${id}`, { method: 'DELETE' })
    await refresh()
  }

  return (
    <div>
      <div style={{ fontSize: 12.5, color: 'var(--ink-2)', fontFamily: 'var(--font-mono)', marginBottom: 16, lineHeight: 1.6 }}>
        No self-serve checkout here on purpose — book a slot after an off-platform deal (invoice/UPI), and the
        daily Telegram + Discord digest picks it up automatically for the date range below.
      </div>

      <form onSubmit={submit} style={{ maxWidth: 480, marginBottom: 24 }}>
        <input style={inputStyle()} placeholder="Sponsor name" required value={form.sponsorName} onChange={e => set('sponsorName', e.target.value)} />
        <input style={inputStyle()} placeholder="Sponsor URL (https://…)" required value={form.sponsorUrl} onChange={e => set('sponsorUrl', e.target.value)} />
        <input style={inputStyle()} placeholder="Tagline (e.g. Hiring backend engineers)" required value={form.tagline} onChange={e => set('tagline', e.target.value)} />
        <div style={{ display: 'flex', gap: 10 }}>
          <input style={inputStyle()} type="date" required value={form.startDate} onChange={e => set('startDate', e.target.value)} />
          <input style={inputStyle()} type="date" required value={form.endDate} onChange={e => set('endDate', e.target.value)} />
        </div>
        {error && <div style={{ color: 'var(--danger)', fontSize: 12.5, marginBottom: 10 }}>{error}</div>}
        <button type="submit" disabled={saving} style={{
          padding: '10px 22px', borderRadius: 2, border: 'none', cursor: 'pointer',
          background: 'var(--btn-bg)', color: 'var(--btn-text)', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13, letterSpacing: '0.02em',
          boxShadow: '3px 3px 0 var(--shadow)',
        }}>
          {saving ? 'Booking…' : 'Book slot'}
        </button>
      </form>

      {loading ? (
        <div style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>Loading…</div>
      ) : slots.length === 0 ? (
        <div style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>No sponsor slots booked.</div>
      ) : (
        slots.map(slot => (
          <div key={slot.id} className="card-box" style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
            padding: '12px 16px', marginBottom: 12,
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {slot.sponsorName} — {slot.tagline}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
                {new Date(slot.startDate).toLocaleDateString()} – {new Date(slot.endDate).toLocaleDateString()}
              </div>
            </div>
            <button onClick={() => remove(slot.id)} style={btnStyle('var(--danger)')}>Cancel</button>
          </div>
        ))
      )}
    </div>
  )
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    padding: '6px 12px', borderRadius: 3, border: 'none', cursor: 'pointer',
    background: bg, color: 'white', fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 700,
  }
}

export function AdminPanel({ adminName }: { adminName: string }) {
  const router = useRouter()
  const [items, setItems] = useState<Opportunity[]>([])
  const [tab, setTab] = useState<'add' | 'queue' | 'all' | 'scraper' | 'subscribers' | 'sponsor'>('queue')

  async function refresh() {
    if (tab === 'add' || tab === 'scraper' || tab === 'subscribers' || tab === 'sponsor') return
    const status = tab === 'queue' ? 'unverified' : 'all'
    const res = await fetch(`/api/opportunities?status=${status}`)
    const data = await res.json()
    setItems(data.items ?? [])
  }

  useEffect(() => { refresh() }, [tab])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/auth')
  }

  return (
    <div style={{ minHeight: '100vh', padding: '32px 24px 80px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Wordmark size={20} /> <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--ink)' }}>admin — {adminName}</span>
          </span>
          <button onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--ink-2)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 12.5 }}>
            Log out
          </button>
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {(['queue', 'add', 'all', 'scraper', 'subscribers', 'sponsor'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '8px 16px', borderRadius: 2, border: '1.5px solid var(--line)', cursor: 'pointer',
              fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 600,
              background: tab === t ? 'var(--btn-bg)' : 'var(--card)',
              color: tab === t ? 'var(--btn-text)' : 'var(--ink)',
            }}>
              {t === 'queue' ? 'Needs review' : t === 'add' ? 'Add new' : t === 'all' ? 'All opportunities' : t === 'scraper' ? 'Scraper' : t === 'subscribers' ? 'Subscribers' : 'Sponsor slots'}
            </button>
          ))}
        </div>

        {tab === 'add' ? (
          <AddForm onAdded={refresh} />
        ) : tab === 'scraper' ? (
          <ScraperPanel />
        ) : tab === 'subscribers' ? (
          <SubscribersPanel />
        ) : tab === 'sponsor' ? (
          <SponsorPanel />
        ) : items.length === 0 ? (
          <div style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>Nothing here.</div>
        ) : (
          items.map(opp => <Row key={opp.id} opp={opp} onChanged={refresh} />)
        )}
      </div>
    </div>
  )
}
