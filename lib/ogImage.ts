export interface OgMedia {
  imageUrl: string | null
  videoUrl: string | null
}

/**
 * Best-effort og:image + og:video fetch for a listing's own application
 * page — real, sourced media at ingestion time, never a stock photo or a
 * fabricated visual. One fetch does both (no reason to hit the same URL
 * twice), bounded read (stops at </head> or 60KB, whichever's first — both
 * tags always live in <head>) and a hard timeout, so one slow or hostile
 * site can't stall a scrape pass. Fails silently: a listing with no
 * fetchable media just renders text-only, same as every card does today —
 * never broken media, never a placeholder pretending to be real.
 *
 * Video is deliberately conservative: only an explicit og:video/og:video:url
 * tag counts. A site that tags one is making a real claim about it; a
 * YouTube iframe spotted somewhere in the page body could be an ad, a
 * footer video, anything — not worth the false-positive risk or the extra
 * bytes it'd take to scan past </head> looking for one.
 */
export async function fetchOgMedia(url: string): Promise<OgMedia> {
  const empty: OgMedia = { imageUrl: null, videoUrl: null }
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; OppIDXBot/1.0; +https://oppidx.com)' },
    }).finally(() => clearTimeout(timeout))

    if (!res.ok) return empty
    const contentType = res.headers.get('content-type') ?? ''
    if (!contentType.includes('text/html')) return empty

    const reader = res.body?.getReader()
    if (!reader) return empty
    const decoder = new TextDecoder()
    let html = ''
    try {
      while (html.length < 60_000) {
        const { done, value } = await reader.read()
        if (done) break
        html += decoder.decode(value, { stream: true })
        if (/<\/head>/i.test(html)) break
      }
    } finally {
      reader.cancel().catch(() => {})
    }

    const imageMatch =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ||
      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)
    const rawImage = imageMatch?.[1]?.trim()
    const imageUrl = rawImage && /^https:\/\//.test(rawImage) ? rawImage : null

    const videoMatch =
      html.match(/<meta[^>]+property=["']og:video(?::url|:secure_url)?["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:video(?::url|:secure_url)?["']/i)
    const rawVideo = videoMatch?.[1]?.trim()
    const videoUrl = rawVideo && /^https:\/\//.test(rawVideo) ? rawVideo : null

    return { imageUrl, videoUrl }
  } catch {
    return empty
  }
}
