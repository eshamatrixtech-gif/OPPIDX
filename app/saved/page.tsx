'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { OpportunityCard } from '@/components/ui/OpportunityCard'
import type { Opportunity } from '@/types'

export default function SavedPage() {
  const [items, setItems] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/saved')
      .then(r => r.json())
      .then(data => setItems(data.items ?? []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ minHeight: '100vh' }}>
      <header style={{ padding: '28px 24px 24px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Link href="/" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-2)', textDecoration: 'none' }}>
            ← OppIDX
          </Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 4vw, 34px)', color: 'var(--ink)', marginTop: 14 }}>
            Your saved opportunities
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--ink-2)', fontFamily: 'var(--font-mono)', marginTop: 10 }}>
            Saved on this device — hit the ★ on any listing to add it here.
          </p>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 80px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
            Loading…
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
            Nothing saved yet. <Link href="/browse" style={{ color: 'var(--pin)' }}>Browse the board →</Link>
          </div>
        ) : (
          <div style={{
            display: 'grid', gap: 26,
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          }}>
            {items.map(opp => <OpportunityCard key={opp.id} opp={opp} />)}
          </div>
        )}
      </main>
    </div>
  )
}
