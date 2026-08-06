'use client'

import { useEffect, useState } from 'react'

const LAST_VISIT_KEY = 'oppidx_last_visit'

/**
 * "N new opportunities since your last visit" — the one line on the page
 * that answers "why open this again today?".
 *
 * Necessarily a client component (it reads localStorage), but it now sits in
 * the hero above the search box instead of below it. Previously it rendered
 * only after four chained client fetches had resolved, well below the fold,
 * by which point a returning visitor had already decided whether to scroll.
 *
 * Renders nothing at all on a first visit, or when nothing genuinely landed
 * since — same rule as every other count on this site: real, or absent.
 */
export function NewSinceLastVisit() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    const lastVisit = localStorage.getItem(LAST_VISIT_KEY)
    if (lastVisit) {
      fetch(`/api/opportunities/new-count?since=${encodeURIComponent(lastVisit)}`)
        .then(r => r.json())
        .then(data => { if (data.count > 0) setCount(data.count) })
        .catch(() => {})
    }
    localStorage.setItem(LAST_VISIT_KEY, new Date().toISOString())
  }, [])

  if (count === null) return null

  return (
    <div style={{
      display: 'inline-block', marginBottom: 16, padding: '9px 14px', borderRadius: 2,
      background: 'var(--card)', border: '1.5px solid var(--pin)',
      fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 700, color: 'var(--pin)',
    }}>
      ✦ {count.toLocaleString()} new opportunit{count === 1 ? 'y' : 'ies'} since your last visit
    </div>
  )
}
