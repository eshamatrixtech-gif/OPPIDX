'use client'

import { useState } from 'react'

/** A real, sourced image (og:image, fetched at ingestion time — see
 * lib/ogImage.ts) that renders `fallback` if the stored URL ever fails to
 * load, instead of showing a broken-image icon. Shared by the opportunity
 * card and its detail page so there's one fallback behavior, not two. A
 * dead link is common enough on real external URLs (site redesigns, expired
 * CDN paths) that leaving `fallback` unset would otherwise mean a real,
 * once-valid image silently degrades to blanker than a card that never had
 * one at all — which is exactly backwards. */
export function SafeImage({ src, alt, style, fallback = null }: { src: string; alt: string; style?: React.CSSProperties; fallback?: React.ReactNode }) {
  const [failed, setFailed] = useState(false)
  if (failed) return <>{fallback}</>
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} style={style} />
}
