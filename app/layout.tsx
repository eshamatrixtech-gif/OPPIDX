import type { Metadata } from 'next'
import { Special_Elite, IBM_Plex_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SITE_URL } from '@/lib/siteUrl'
import './globals.css'

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
  title: 'OppIDX — the opportunity board',
  description: 'Internships, scholarships, fellowships, grants, and competitions for students, early-career job seekers, founders, and anyone chasing a real shot. Pinned up, updated constantly, free to browse.',
  keywords: ['internships', 'scholarships', 'fellowships', 'grants', 'competitions', 'opportunities', 'students', 'founders'],
  alternates: {
    types: { 'application/rss+xml': `${SITE_URL}/feed.xml` },
  },
  openGraph: {
    title: 'OppIDX — the opportunity board',
    description: 'Every opportunity worth applying to, pinned up in one place.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${typewriter.variable} ${mono.variable}`} style={{ height: '100%' }}>
      <body style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
