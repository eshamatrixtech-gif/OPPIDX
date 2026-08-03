'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { OpportunityCard } from '@/components/ui/OpportunityCard'
import { NotifyButton } from '@/components/ui/NotifyButton'
import type { Opportunity } from '@/types'

async function shareChaseCard(items: Opportunity[], appliedCount: number) {
  const params = new URLSearchParams()
  items.slice(0, 3).forEach(o => params.append('title', o.title))
  params.set('total', String(items.length))
  if (appliedCount > 0) params.set('applied', String(appliedCount))

  const url = '/api/saved/card?' + params.toString()
  try {
    const res = await fetch(url)
    const blob = await res.blob()
    const file = new File([blob], 'oppidx-chasing.png', { type: 'image/png' })
    const nav = navigator as Navigator & { canShare?: (data: { files: File[] }) => boolean }
    if (nav.share && nav.canShare?.({ files: [file] })) {
      await nav.share({ files: [file], text: "Here's what I'm chasing — oppidx.com" })
      return
    }
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = 'oppidx-chasing.png'
    a.click()
    URL.revokeObjectURL(objectUrl)
  } catch {
    // user can still screenshot the page as a fallback
  }
}

export default function SavedClient() {
  const [items, setItems] = useState<Opportunity[]>([])
  const [appliedCount, setAppliedCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [sharing, setSharing] = useState(false)

  useEffect(() => {
    fetch('/api/saved')
      .then(r => r.json())
      .then(data => {
        setItems(data.items ?? [])
        setAppliedCount(data.appliedCount ?? 0)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ minHeight: '100vh' }}>
      <header style={{ padding: '28px 24px 24px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Link href="/" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-2)', textDecoration: 'none' }}>
            ← OppIDX
          </Link>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--pin)', fontFamily: 'var(--font-mono)', marginTop: 14 }}>
            ◆ Chaser tools ◆
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 4vw, 34px)', color: 'var(--ink)', marginTop: 8 }}>
            Your saved opportunities
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--ink-2)', fontFamily: 'var(--font-mono)', marginTop: 10 }}>
            Saved on this device — hit the ★ on any listing to add it here.
          </p>
          <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <NotifyButton />
            {items.length > 0 && (
              <button
                onClick={async () => { setSharing(true); await shareChaseCard(items, appliedCount); setSharing(false) }}
                disabled={sharing}
                style={{
                  padding: '10px 18px', borderRadius: 2, border: 'none', cursor: 'pointer',
                  background: 'var(--btn-bg)', color: 'var(--btn-text)', fontFamily: 'var(--font-mono)',
                  fontSize: 12.5, fontWeight: 700, letterSpacing: '0.02em', opacity: sharing ? 0.6 : 1,
                }}
              >
                {sharing ? 'Building card…' : "✦ Share what I'm chasing"}
              </button>
            )}
          </div>
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
