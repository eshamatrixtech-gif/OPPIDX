'use client'

import { useState } from 'react'

/** A real, sourced image (og:image, fetched at ingestion time — see
 * lib/ogImage.ts) that collapses to nothing if the stored URL ever fails
 * to load, instead of showing a broken-image icon. Shared by the
 * opportunity card and its detail page so there's one fallback behavior,
 * not two. */
export function SafeImage({ src, alt, style }: { src: string; alt: string; style?: React.CSSProperties }) {
  const [failed, setFailed] = useState(false)
  if (failed) return null
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} style={style} />
}
