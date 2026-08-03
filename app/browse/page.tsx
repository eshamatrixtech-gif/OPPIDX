import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/pageMetadata'
import { SITE_URL } from '@/lib/siteUrl'
import BrowseClient from './BrowseClient'

export const metadata: Metadata = pageMetadata({
  title: 'Browse Opportunities — OppIDX',
  description: 'Search and filter every internship, scholarship, fellowship, grant, and competition on OppIDX by audience, region, difficulty, and more.',
  canonical: `${SITE_URL}/browse`,
})

export default function Page() {
  return <BrowseClient />
}
