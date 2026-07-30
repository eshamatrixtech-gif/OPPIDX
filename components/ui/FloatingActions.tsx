'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const SCROLL_TOP_THRESHOLD_PX = 500

/**
 * A small, always-reachable action rail pinned to the side of the viewport —
 * same idea as WhatsApp's floating buttons: fixed position, never scrolls
 * away, usable at any point in a long feed instead of only from the header.
 * Styled with the site's own button language (2px radius, hard offset
 * shadow, card fill) rather than a generic circular FAB, so it reads as
 * part of this site rather than a bolted-on widget.
 */
export function FloatingActions({ onOpenMore, filterHref = '/browse' }: { onOpenMore: () => void; filterHref?: string }) {
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    function onScroll() {
      setShowTop(window.scrollY > SCROLL_TOP_THRESHOLD_PX)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const btnStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 44, height: 44, borderRadius: 2,
    border: '1.5px solid var(--line)', background: 'var(--card)', cursor: 'pointer',
    boxShadow: '3px 3px 0 var(--shadow)', fontSize: 16, textDecoration: 'none',
  }

  return (
    <div style={{
      position: 'fixed', right: 18, bottom: 24, zIndex: 45,
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      {showTop && (
        <button onClick={scrollToTop} aria-label="Back to top" title="Back to top" style={{ ...btnStyle, color: 'var(--ink)' }}>
          ↑
        </button>
      )}
      <Link href={filterHref} aria-label="Filter the board" title="Filter the board" style={{ ...btnStyle, color: 'var(--ink)' }}>
        🔍
      </Link>
      <button onClick={onOpenMore} aria-label="More from OppIDX" title="More from OppIDX" style={{ ...btnStyle, color: 'var(--ink)', borderColor: 'var(--pin)' }}>
        ☰
      </button>
    </div>
  )
}
