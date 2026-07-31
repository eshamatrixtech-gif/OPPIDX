import type { Metadata } from 'next'

/**
 * Builds page metadata with openGraph/twitter explicitly mirroring
 * title/description — required because the root layout (app/layout.tsx)
 * defines its own static `openGraph`/`twitter` objects. Once an ancestor
 * layout sets those, Next.js stops auto-deriving them from a child route's
 * title/description; any generateMetadata() that returns only
 * `{ title, description }` silently inherits the root layout's og:title
 * ("OppIDX — the opportunity board") on every share instead of its own.
 * Every dynamic route (opportunity, collection, company, resource,
 * newsletter digest, ...) needs this to get a correct social preview.
 */
export function pageMetadata({
  title, description, canonical,
}: { title: string; description: string; canonical?: string }): Metadata {
  return {
    title,
    description,
    ...(canonical ? { alternates: { canonical } } : {}),
    openGraph: { title, description },
    twitter: { title, description },
  }
}
