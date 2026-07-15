'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { OpportunityCard } from '@/components/ui/OpportunityCard'
import type { Facet, Opportunity } from '@/types'

const AUDIENCE_TABS = [
  { id: 'STUDENT', label: 'Students' },
  { id: 'EARLY_CAREER', label: 'Early Career' },
  { id: 'FOUNDER', label: 'Founders' },
  { id: 'GENERAL', label: 'General' },
]

const DIFFICULTY_TABS = ['Easy', 'Medium', 'Hard']

// Fixed, stable order — actual chips shown are still filtered down to
// whatever /api/opportunities/facets says has real listings behind it.
const REGION_ORDER = ['North America', 'South America', 'Europe', 'Africa', 'Asia', 'Oceania', 'Remote / Global']

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter(v => v !== value) : [...list, value]
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      padding: '7px 14px', borderRadius: 2, cursor: 'pointer', fontFamily: 'var(--font-mono)',
      fontSize: 12, fontWeight: 600,
      background: active ? 'var(--btn-bg)' : 'var(--card)',
      color: active ? 'var(--btn-text)' : 'var(--ink)',
      border: `1.5px solid ${active ? 'var(--btn-bg)' : 'var(--line)'}`,
      transition: 'all 0.15s',
    }}>
      {children}
    </button>
  )
}

export default function Browse() {
  return (
    <Suspense fallback={null}>
      <BrowseInner />
    </Suspense>
  )
}

function BrowseInner() {
  const searchParams = useSearchParams()
  const initialAudience = searchParams.get('audience')

  const [items, setItems] = useState<Opportunity[]>([])
  const [total, setTotal] = useState(0)
  const [restricted, setRestricted] = useState(false)
  const [page, setPage] = useState(1)
  const [audiences, setAudiences] = useState<string[]>(initialAudience ? [initialAudience] : [])
  const [difficulties, setDifficulties] = useState<string[]>([])
  const [regions, setRegions] = useState<string[]>([])
  const [countries, setCountries] = useState<string[]>([])
  const [regionFacets, setRegionFacets] = useState<Facet[]>([])
  const [countryFacets, setCountryFacets] = useState<Facet[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const requestId = useRef(0)

  useEffect(() => {
    fetch('/api/opportunities/facets')
      .then(r => r.json())
      .then(data => {
        setRegionFacets(data.regions ?? [])
        setCountryFacets(data.countries ?? [])
      })
      .catch(() => {})
  }, [])

  function buildParams(pageNum: number) {
    const params = new URLSearchParams({ page: String(pageNum) })
    if (audiences.length) params.set('audience', audiences.join(','))
    if (difficulties.length) params.set('difficulty', difficulties.join(','))
    if (regions.length) params.set('region', regions.join(','))
    if (countries.length) params.set('country', countries.join(','))
    if (search.trim()) params.set('search', search.trim())
    return params
  }

  useEffect(() => {
    const thisRequest = ++requestId.current
    const debounce = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/opportunities?${buildParams(1)}`)
        const data = await res.json()
        if (thisRequest !== requestId.current) return
        setItems(data.items ?? [])
        setTotal(data.total ?? 0)
        setRestricted(!!data.restricted)
        setPage(1)
      } finally {
        if (thisRequest === requestId.current) setLoading(false)
      }
    }, 250)
    return () => clearTimeout(debounce)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audiences, difficulties, regions, countries, search])

  async function loadMore() {
    setLoadingMore(true)
    const nextPage = page + 1
    try {
      const res = await fetch(`/api/opportunities?${buildParams(nextPage)}`)
      const data = await res.json()
      setItems(prev => [...prev, ...(data.items ?? [])])
      setPage(nextPage)
    } finally {
      setLoadingMore(false)
    }
  }

  const emptyState = useMemo(() => !loading && items.length === 0, [loading, items])
  const hasMore = !loading && items.length < total && !restricted
  const lockedCount = restricted ? Math.max(0, total - items.length) : 0
  const anyFilterActive = audiences.length > 0 || difficulties.length > 0 || regions.length > 0 || countries.length > 0 || search.trim().length > 0

  const orderedRegionFacets = useMemo(() => {
    const byValue = new Map(regionFacets.map(f => [f.value, f]))
    const ordered = REGION_ORDER.filter(r => byValue.has(r)).map(r => byValue.get(r)!)
    const rest = regionFacets.filter(f => !REGION_ORDER.includes(f.value))
    return [...ordered, ...rest]
  }, [regionFacets])

  return (
    <div style={{ minHeight: '100vh' }}>
      <header style={{ padding: '28px 24px 24px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Link href="/" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-2)', textDecoration: 'none' }}>
            ← OppIDX
          </Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 4vw, 34px)', color: 'var(--ink)', marginTop: 14 }}>
            Browse the database
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--pin)', fontFamily: 'var(--font-mono)', fontWeight: 700, marginTop: 10, letterSpacing: '0.01em' }}>
            An elite, hand-curated collection — not a free-for-all. Full search is a paid subscription.
          </p>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 80px' }}>
        {/* ── Filter bar ── */}
        <div className="card-box" style={{ padding: '20px 22px', marginBottom: 30 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, org, tag, or eligibility…"
            style={{
              width: '100%', padding: '11px 14px', borderRadius: 2, border: '1.5px solid var(--line)',
              fontFamily: 'var(--font-mono)', fontSize: 13.5,
              background: 'var(--board)', color: 'var(--ink)', outline: 'none', marginBottom: 16,
            }}
          />

          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 8 }}>
            Category
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {AUDIENCE_TABS.map(t => (
              <FilterChip key={t.id} active={audiences.includes(t.id)} onClick={() => setAudiences(a => toggle(a, t.id))}>
                {t.label}
              </FilterChip>
            ))}
          </div>

          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 8 }}>
            Difficulty
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {DIFFICULTY_TABS.map(d => (
              <FilterChip key={d} active={difficulties.includes(d)} onClick={() => setDifficulties(a => toggle(a, d))}>
                {d}
              </FilterChip>
            ))}
          </div>

          {orderedRegionFacets.length > 0 && (
            <>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 8 }}>
                Region
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                {orderedRegionFacets.map(f => (
                  <FilterChip key={f.value} active={regions.includes(f.value)} onClick={() => setRegions(r => toggle(r, f.value))}>
                    {f.value} <span style={{ opacity: 0.6 }}>({f.count})</span>
                  </FilterChip>
                ))}
              </div>
            </>
          )}

          {countryFacets.length > 0 && (
            <>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 8 }}>
                Country
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <select
                  value=""
                  onChange={e => { if (e.target.value) setCountries(c => toggle(c, e.target.value)) }}
                  style={{
                    padding: '7px 10px', borderRadius: 2, border: '1.5px solid var(--line)',
                    fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600,
                    background: 'var(--card)', color: 'var(--ink)',
                  }}
                >
                  <option value="">Add a country…</option>
                  {countryFacets.filter(f => !countries.includes(f.value)).map(f => (
                    <option key={f.value} value={f.value}>{f.value} ({f.count})</option>
                  ))}
                </select>
                {countries.map(c => (
                  <FilterChip key={c} active onClick={() => setCountries(list => toggle(list, c))}>
                    {c} ✕
                  </FilterChip>
                ))}
              </div>
            </>
          )}

          {anyFilterActive && (
            <div style={{ marginTop: 16 }}>
              <button onClick={() => { setAudiences([]); setDifficulties([]); setRegions([]); setCountries([]); setSearch('') }} style={{
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--pin)',
                fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600,
              }}>
                Clear filters
              </button>
            </div>
          )}
        </div>

        <div className="divider" style={{ marginBottom: 26 }}>
          <span>◆ {total.toLocaleString()} opportunities ◆</span>
        </div>

        {emptyState ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
            Nothing matches those filters yet — try loosening them.
          </div>
        ) : (
          <>
            <motion.div layout style={{
              display: 'grid', gap: 26,
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            }}>
              <AnimatePresence mode="popLayout">
                {items.map(opp => <OpportunityCard key={opp.id} opp={opp} />)}
              </AnimatePresence>
            </motion.div>

            {hasMore && (
              <div style={{ textAlign: 'center', marginTop: 40 }}>
                <button onClick={loadMore} disabled={loadingMore} style={{
                  padding: '12px 30px', borderRadius: 2, border: '1.5px solid var(--line)', cursor: 'pointer',
                  background: 'var(--card)', color: 'var(--ink)', fontFamily: 'var(--font-mono)',
                  fontSize: 13, fontWeight: 700, boxShadow: '3px 3px 0 var(--shadow)',
                }}>
                  {loadingMore ? 'Loading…' : `Load more (${(total - items.length).toLocaleString()} left)`}
                </button>
              </div>
            )}

            {lockedCount > 0 && (
              <div className="card-box" style={{ textAlign: 'center', marginTop: 40, padding: '26px 24px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13.5, color: 'var(--ink)', marginBottom: 12 }}>
                  {lockedCount.toLocaleString()} more matching opportunities are subscriber-only — free search shows the first {items.length}.
                </div>
                <Link href="/pricing" style={{
                  display: 'inline-block', padding: '11px 24px', borderRadius: 2,
                  background: 'var(--btn-bg)', color: 'var(--btn-text)', textDecoration: 'none',
                  fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13, letterSpacing: '0.02em',
                  boxShadow: '3px 3px 0 var(--shadow)',
                }}>
                  Unlock full search — ₹299/yr
                </Link>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
