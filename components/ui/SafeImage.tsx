'use client'

import { useState } from 'react'
import Image from 'next/image'

/** A real, sourced image (og:image, fetched at ingestion time — see
 * lib/ogImage.ts) that renders `fallback` if the stored URL ever fails to
 * load, instead of showing a broken-image icon. Shared by the opportunity
 * card and its detail page so there's one fallback behavior, not two. A
 * dead link is common enough on real external URLs (site redesigns, expired
 * CDN paths) that leaving `fallback` unset would otherwise mean a real,
 * once-valid image silently degrades to blanker than a card that never had
 * one at all — which is exactly backwards.
 *
 * Renders via next/image in `fill` mode — the caller is responsible for a
 * positioned (`position: relative`), explicitly sized ancestor, same as any
 * `fill` image. `sizes` should reflect how wide the image actually renders
 * at each breakpoint; it defaults to a card-thumbnail-sized guess. */
export function SafeImage({
  src, alt, style, fallback = null, sizes = '(max-width: 640px) 100vw, 640px',
}: { src: string; alt: string; style?: React.CSSProperties; fallback?: React.ReactNode; sizes?: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) return <>{fallback}</>
  return (
    <Image
      src={`/api/images?url=${encodeURIComponent(src)}`}
      alt={alt}
      fill
      sizes={sizes}
      style={{ objectFit: 'cover', ...style }}
      onError={() => setFailed(true)}
    />
  )
}
