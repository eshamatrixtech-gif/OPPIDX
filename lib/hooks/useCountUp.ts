'use client'

import { useEffect, useRef, useState } from 'react'

/** Animates numeric changes to `value` with an eased tween, instead of jumping. */
export function useCountUp(value: number, durationMs = 700): number {
  const [display, setDisplay] = useState(value)
  const fromRef = useRef(value)
  const rafRef  = useRef<number | null>(null)

  useEffect(() => {
    const from  = fromRef.current
    const to    = value
    if (from === to) return

    const start = performance.now()
    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    function tick(now: number) {
      const t = Math.min(1, (now - start) / durationMs)
      const eased = 1 - Math.pow(1 - t, 3) // ease-out cubic
      setDisplay(Math.round(from + (to - from) * eased))
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        fromRef.current = to
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [value, durationMs])

  return display
}
