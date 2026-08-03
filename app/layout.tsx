import type { Metadata } from 'next'
import { Special_Elite, IBM_Plex_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SITE_URL } from '@/lib/siteUrl'
import { ReferralCapture } from '@/components/ReferralCapture'
import { VisitTracker } from '@/components/VisitTracker'
import './globals.css'
import './stamped.css'

const typewriter = Special_Elite({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
})

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'OppIDX',
  description: 'Internships, scholarships, fellowships, grants, and competitions for students, early-career job seekers, founders, and anyone chasing a real shot. Pinned up, updated constantly, free to browse.',
  keywords: ['internships', 'scholarships', 'fellowships', 'grants', 'competitions', 'opportunities', 'students', 'founders'],
  alternates: {
    types: { 'application/rss+xml': `${SITE_URL}/feed.xml` },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  openGraph: {
    title: 'OppIDX — the opportunity board',
    description: 'Every opportunity worth applying to, pinned up in one place.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OppIDX — the opportunity board',
    description: 'Every opportunity worth applying to, pinned up in one place.',
  },
}

// Site-wide identity — was missing entirely (only individual JobPosting
// markup existed). WebSite + SearchAction is what lets Google show a
// search box directly under the result instead of just a link; the
// url_template points at /browse's own real search param (see HeroSearch
// in app/page.tsx: `/browse?search=${query}`), not a fabricated endpoint.
// Organization backs brand-entity recognition in search (logo, sameAs).
const siteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'OppIDX',
      description: 'Internships, scholarships, fellowships, grants, and competitions for students, early-career job seekers, founders, and anyone chasing a real shot.',
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/browse?search={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'OppIDX',
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${typewriter.variable} ${mono.variable}`} style={{ height: '100%' }}>
      <body style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd).replace(/</g, '\\u003c') }} />
        <ReferralCapture />
        <VisitTracker />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
