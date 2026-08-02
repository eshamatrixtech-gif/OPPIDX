/** Root Suspense fallback — Next.js prefetches this so it can render
 * instantly if a navigation's data isn't ready yet. Kept intentionally
 * quiet: most page loads resolve before this ever paints. */
export default function Loading() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-3)',
        letterSpacing: '0.04em',
      }}>
        Loading…
      </span>
    </div>
  )
}
