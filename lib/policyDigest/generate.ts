/**
 * Generates the shareable "policy actions" digest — a snapshot, taken once
 * a day (and once a week), of what Mayatara Pulse's government/regulatory
 * sources (PIB, RBI, SEBI — see lib/mayatara/pulseFeed.ts) reported. Reads
 * from Supabase (the live Pulse data), writes to Prisma's PolicyDigest
 * table (the durable, shareable snapshot) — see the model comment in
 * prisma/schema.prisma for why a snapshot is necessary rather than
 * computing a digest from live Pulse data on every page view.
 */

import { prisma } from '@/lib/db'
import { supabaseAdmin } from '@/lib/mayatara/supabase'
import { isEnglish } from '@/lib/mayatara/pulseFeed'

export interface DigestItem {
  title: string
  url: string
  category: string
  source: string
}

interface PulseHeadlineRow {
  title: string
  url: string
  category: string
  source: string
  source_type: string
  fetched_at: string
}

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10) // "2026-07-24"
}

/** ISO 8601 week string, e.g. "2026-W30" — Thursday-anchored per the ISO
 * spec so the week number is stable regardless of which day generation runs. */
function isoWeekString(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

function summarize(items: DigestItem[], periodLabel: string): string {
  if (items.length === 0) return `No policy actions captured for ${periodLabel}.`
  const categories = new Set(items.map(i => i.category)).size
  return `${items.length} policy action${items.length === 1 ? '' : 's'} across ${categories} categor${categories === 1 ? 'y' : 'ies'} — ${periodLabel}.`
}

export async function generateDailyDigest(): Promise<{ period: string; itemCount: number }> {
  if (!supabaseAdmin) throw new Error('Supabase is not configured.')

  const { data, error } = await supabaseAdmin
    .from('pulse_headlines')
    .select('title, url, category, source, source_type, fetched_at')
    .eq('source_type', 'government')
    .order('fetched_at', { ascending: false })

  if (error) throw error

  const items: DigestItem[] = ((data ?? []) as PulseHeadlineRow[])
    .filter(h => isEnglish(h.title))
    .map(h => ({ title: h.title, url: h.url, category: h.category, source: h.source }))

  const period = todayDateString()
  const summary = summarize(items, 'today')

  await prisma.policyDigest.upsert({
    where: { period },
    update: { summary, items: JSON.stringify(items) },
    create: { period, periodType: 'daily', summary, items: JSON.stringify(items) },
  })

  return { period, itemCount: items.length }
}

/** Weekly digest is built from the past 7 days' already-generated daily
 * digests (Prisma, not live Supabase) — consistent by construction with
 * whatever each day actually showed, not a re-derived guess. */
export async function generateWeeklyDigest(): Promise<{ period: string; itemCount: number }> {
  const since = new Date(Date.now() - 7 * 86400_000)
  const dailies = await prisma.policyDigest.findMany({
    where: { periodType: 'daily', createdAt: { gte: since } },
    orderBy: { createdAt: 'asc' },
  })

  const seen = new Set<string>()
  const items: DigestItem[] = []
  for (const daily of dailies) {
    const dailyItems = JSON.parse(daily.items) as DigestItem[]
    for (const item of dailyItems) {
      if (seen.has(item.url)) continue
      seen.add(item.url)
      items.push(item)
    }
  }

  const period = isoWeekString(new Date())
  const summary = summarize(items, 'this week')

  await prisma.policyDigest.upsert({
    where: { period },
    update: { summary, items: JSON.stringify(items) },
    create: { period, periodType: 'weekly', summary, items: JSON.stringify(items) },
  })

  return { period, itemCount: items.length }
}
