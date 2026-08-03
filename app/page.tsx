import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/siteUrl'
import HomeClient from './HomeClient'

export const metadata: Metadata = {
  title: 'OppIDX — Internships, Scholarships, Fellowships & Grants',
  description: 'Every opportunity worth applying to, pinned up in one place. Internships, scholarships, fellowships, grants, and competitions for students, early-career job seekers, and founders — updated constantly, free to browse.',
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: 'OppIDX — the opportunity board',
    description: 'Every opportunity worth applying to, pinned up in one place.',
  },
  twitter: {
    title: 'OppIDX — the opportunity board',
    description: 'Every opportunity worth applying to, pinned up in one place.',
  },
}

export default function Page() {
  return <HomeClient />
}
