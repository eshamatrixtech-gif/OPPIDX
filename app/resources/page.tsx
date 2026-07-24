'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { VALID_CATEGORIES } from '@/lib/resources/validate'
import type { Resource } from '@/types'

const AUDIENCE_TABS = [
  { id: 'STUDENT', label: 'Students' },
  { id: 'EARLY_CAREER', label: 'Early Career' },
  { id: 'FOUNDER', label: 'Founders' },
  { id: 'GENERAL', label: 'General' },
]

function hostOf(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url }
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      padding: '7px 14px', borderRadius: 2, cursor: 'pointer', fontFamily: 'var(--font-mono)',
      fontSize: 12, fontWeight: 600,
      background: active ? 'var(--btn-bg)' : 'var(--card)',
      color: active ? 'var(--btn-text)' : 'var(--ink)',
      border: `1.5px solid ${active ? 'var(--btn-bg)' : 'var(--line)'}`,
    }}>
      {children}
    </button>
  )
}

function ResourceRow({ item }: { item: Resource }) {
  return (
    <div className="card-box" style={{ marginBottom: 14 }}>
      <Link href={`/resources/${item.id}`} style={{ display: 'block', padding: '18px 20px 12px', textDecoration: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--pin)',
          }}>
            {item.category}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)' }}>
            {item.audience.replace('_', ' ')}
          </span>
        </div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--ink)', marginBottom: 6 }}>
          {item.title}
        </h3>
        <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6 }}>
          {item.description}
        </p>
      </Link>
      <div style={{ borderTop: '1px solid var(--line)', padding: '10px 20px' }}>
        {item.body ? (
          <Link href={`/resources/${item.id}`} style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--pin)', textDecoration: 'none' }}>
            Read on OppIDX →
          </Link>
        ) : (
          <a href={item.url} target="_blank" rel="noopener noreferrer" style={{
            fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--pin)', textDecoration: 'none',
          }}>
            Open → {hostOf(item.url)}
          </a>
        )}
      </div>
    </div>
  )
}

export default function Resources() {
  return (
    <Suspense fallback={null}>
      <ResourcesInner />
    </Suspense>
  )
}

function ResourcesInner() {
  const [items, setItems] = useState<Resource[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<string | null>(null)
  const [audiences, setAudiences] = useState<string[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (audiences.length) params.set('audience', audiences.join(','))
    if (search) params.set('search', search)

    const t = setTimeout(() => {
      setLoading(true)
      fetch(`/api/resources?${params.toString()}`)
        .then(r => r.json())
        .then(data => {
          setItems(data.items ?? [])
          setTotal(data.total ?? 0)
        })
        .catch(() => { setItems([]); setTotal(0) })
        .finally(() => setLoading(false))
    }, 200)
    return () => clearTimeout(t)
  }, [category, audiences, search])

  function toggleAudience(id: string) {
    setAudiences(list => list.includes(id) ? list.filter(a => a !== id) : [...list, id])
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <header style={{ padding: '40px 24px 28px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ marginBottom: 6 }}>
            <Link href="/" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)', textDecoration: 'none' }}>← Back</Link>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 5vw, 40px)',
            lineHeight: 1.15, marginBottom: 10, textTransform: 'uppercase', color: 'var(--ink)',
          }}>
            Resources
          </h1>
          <p style={{ color: 'var(--ink-2)', fontSize: 14, marginBottom: 24, maxWidth: 620, lineHeight: 1.6 }}>
            Prep guides, tools, financial-aid explainers, mentorship and communities — verified, growing every day. <Link href="/resources/submit" style={{ color: 'var(--pin)' }}>Submit one →</Link>
          </p>

          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search resources…"
            style={{
              width: '100%', padding: '11px 14px', borderRadius: 2, border: '1.5px solid var(--line)',
              background: 'var(--card)', color: 'var(--ink)', fontFamily: 'var(--font-mono)',
              fontSize: 13, outline: 'none', marginBottom: 16,
            }}
          />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
            <FilterChip active={category === null} onClick={() => setCategory(null)}>All categories</FilterChip>
            {VALID_CATEGORIES.map(c => (
              <FilterChip key={c} active={category === c} onClick={() => setCategory(c === category ? null : c)}>{c}</FilterChip>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {AUDIENCE_TABS.map(a => (
              <FilterChip key={a.id} active={audiences.includes(a.id)} onClick={() => toggleAudience(a.id)}>{a.label}</FilterChip>
            ))}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 80px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)', marginBottom: 16 }}>
          {loading ? 'Loading…' : `${total.toLocaleString()} resource${total === 1 ? '' : 's'}`}
        </div>
        {!loading && items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
            Nothing matches yet — <Link href="/resources/submit" style={{ color: 'var(--pin)' }}>be the first to submit one →</Link>
          </div>
        ) : (
          items.map(item => <ResourceRow key={item.id} item={item} />)
        )}
      </main>
    </div>
  )
}
