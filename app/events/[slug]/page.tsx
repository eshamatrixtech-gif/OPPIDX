import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/pageMetadata'
import { SITE_URL } from '@/lib/siteUrl'
import { supabaseAdmin } from '@/lib/mayatara/supabase'
import EventClient from './EventClient'

async function getEvent(slug: string) {
  if (!supabaseAdmin) return null
  const { data } = await supabaseAdmin
    .from('events')
    .select('title, description, location, event_time, is_published')
    .eq('slug', slug)
    .single()
  if (!data || !data.is_published) return null
  return data
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const event = await getEvent(slug)
  if (!event) return { title: 'Event — OppIDX', robots: { index: false, follow: true } }

  const when = new Date(event.event_time).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  return pageMetadata({
    title: `${event.title} — OppIDX`,
    description: `${event.description.slice(0, 130)} — ${when}, ${event.location}.`.slice(0, 160),
    canonical: `${SITE_URL}/events/${slug}`,
  })
}

export default function Page() {
  return <EventClient />
}
