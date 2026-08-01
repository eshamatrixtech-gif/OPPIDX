'use client'

import { useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { relatedResourceCategories } from '@/lib/opportunityResourceMap'

// Loaded on demand, not bundled into every page that renders a card — the
// match modal in particular pulls in the Match feature's Supabase client,
// which has no business being in the core OppIDX bundle for the vast
// majority of visitors who never open it.
const FindYourPersonModal = dynamic(() => import('@/components/ui/FindYourPersonModal').then(m => m.FindYourPersonModal), { ssr: false })
const HostGatheringModal = dynamic(() => import('@/components/ui/HostGatheringModal').then(m => m.HostGatheringModal), { ssr: false })
const SubmitResourceModal = dynamic(() => import('@/components/ui/SubmitResourceModal').then(m => m.SubmitResourceModal), { ssr: false })
const PolicyDigestModal = dynamic(() => import('@/components/ui/PolicyDigestModal').then(m => m.PolicyDigestModal), { ssr: false })

type ModalKind = 'match' | 'event' | 'resource' | 'policy' | 'compatibility'

interface OppRef {
  id: string
  title: string
  tags: string
  audience: string
}

function IconButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick() }}
      style={{
        flex: 1, padding: '7px 4px', border: 'none', background: 'none', cursor: 'pointer',
        fontSize: 15, borderRadius: 2, lineHeight: 1,
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(43,38,32,0.06)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
    >
      {icon}
    </button>
  )
}

function IconLink({ icon, label, href }: { icon: string; label: string; href: string }) {
  return (
    <Link
      href={href}
      title={label}
      aria-label={label}
      style={{
        flex: 1, padding: '7px 4px', border: 'none', background: 'none', cursor: 'pointer',
        fontSize: 15, borderRadius: 2, lineHeight: 1, textAlign: 'center', textDecoration: 'none',
        display: 'block',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(43,38,32,0.06)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
    >
      {icon}
    </Link>
  )
}

function PromptRow({ text, cta, onClick, accent }: { text: string; cta: string; onClick: () => void; accent?: boolean }) {
  return (
    <div style={{
      padding: '12px 16px', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 10, flexWrap: 'wrap',
      border: accent ? '1px solid var(--line)' : '1px dashed var(--line)',
      background: accent ? 'var(--board)' : 'transparent',
    }}>
      <span style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>{text}</span>
      <button type="button" onClick={onClick} style={{
        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        fontSize: 12.5, fontWeight: 700, color: 'var(--pin)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap',
      }}>{cta} →</button>
    </div>
  )
}

function PromptLinkRow({ text, cta, href }: { text: string; cta: string; href: string }) {
  return (
    <div style={{
      padding: '12px 16px', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 10, flexWrap: 'wrap', border: '1px dashed var(--line)',
    }}>
      <span style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>{text}</span>
      <Link href={href} style={{
        fontSize: 12.5, fontWeight: 700, color: 'var(--pin)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap',
        textDecoration: 'none',
      }}>{cta} →</Link>
    </div>
  )
}

/**
 * The one-click bridge into the rest of the ecosystem — matching, hosting a
 * gathering, adding a guide, reading policy, checking compatibility — from
 * wherever an opportunity is already being looked at. Match in particular
 * has no standalone "come explore it" destination on purpose: matching runs
 * automatically in the background (the Friday cron + chasingCohort's
 * "N others chasing this"), and the only front-end surface is this
 * in-context action — nowhere in the nav sends anyone to browse a separate
 * Match product. Every action opens a real popup (or, for compatibility, a
 * real page) backed by the exact same endpoints their full-page
 * counterparts use — nothing here is a shortcut that produces fake or
 * incomplete data, just a shorter path to a real one.
 */
export function EcosystemActions({ opp, variant = 'compact', hasResources = false, hasGatherings = false }: {
  opp: OppRef
  variant?: 'compact' | 'full'
  hasResources?: boolean
  hasGatherings?: boolean
}) {
  const [open, setOpen] = useState<ModalKind | null>(null)
  const resourceCategory = relatedResourceCategories(opp)[0] ?? 'Templates & Guides'

  return (
    <>
      {variant === 'compact' ? (
        <div style={{ display: 'flex', borderTop: '1px solid var(--line)' }}>
          <IconButton icon="🫂" label="Find your person" onClick={() => setOpen('match')} />
          <IconButton icon="📍" label="Host a gathering" onClick={() => setOpen('event')} />
          <IconButton icon="📚" label="Add a guide" onClick={() => setOpen('resource')} />
          <IconButton icon="📰" label="Policy reads" onClick={() => setOpen('policy')} />
          <IconLink icon="✦" label="Check compatibility" href="/match/compatibility" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          <PromptRow text="Chasing this too?" cta="Find your person" onClick={() => setOpen('match')} accent />
          {!hasResources && <PromptRow text="No guides linked to this one yet." cta="Wanna add a guide?" onClick={() => setOpen('resource')} />}
          {!hasGatherings && <PromptRow text="No gathering for people chasing this — yet." cta="Wanna create one?" onClick={() => setOpen('event')} />}
          <PromptLinkRow text="Curious how well you'd match with someone?" cta="Check compatibility" href="/match/compatibility" />
        </div>
      )}

      {open === 'match' && <FindYourPersonModal opportunityTitle={opp.title} onClose={() => setOpen(null)} />}
      {open === 'event' && <HostGatheringModal opportunityTitle={opp.title} onClose={() => setOpen(null)} />}
      {open === 'resource' && <SubmitResourceModal opportunityTitle={opp.title} defaultCategory={resourceCategory} defaultAudience={opp.audience} onClose={() => setOpen(null)} />}
      {open === 'policy' && <PolicyDigestModal opportunityId={opp.id} opportunityTitle={opp.title} onClose={() => setOpen(null)} />}
    </>
  )
}
