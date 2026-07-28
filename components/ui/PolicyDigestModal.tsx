'use client'

import { useEffect, useState } from 'react'
import { Modal, ModalHeader } from '@/components/ui/Modal'

interface PolicyRead {
  title: string
  url: string
  category: string
  source: string
}

/** A quick-read preview instead of a full-page navigation — same real,
 * matched headlines (lib/opportunityPulseMap.ts) the detail page already
 * lists inline, fetched on demand so a card in the feed never has to
 * carry every opportunity's policy reads down to the client up front. */
export function PolicyDigestModal({ opportunityId, opportunityTitle, onClose }: {
  opportunityId: string
  opportunityTitle: string
  onClose: () => void
}) {
  const [items, setItems] = useState<PolicyRead[] | null>(null)

  useEffect(() => {
    fetch(`/api/opportunities/${opportunityId}/policy-reads`)
      .then(r => r.json())
      .then(data => setItems(data.items ?? []))
      .catch(() => setItems([]))
  }, [opportunityId])

  return (
    <Modal onClose={onClose}>
      <ModalHeader title="Policy reads" subtitle={`Related to "${opportunityTitle}"`} onClose={onClose} />
      {items === null ? (
        <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>Loading…</div>
      ) : items.length === 0 ? (
        <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>Nothing genuinely relevant right now.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map(p => (
            <a key={p.url} href={p.url} target="_blank" rel="noopener noreferrer" style={{
              display: 'block', padding: '12px 14px', borderRadius: 2, border: '1px solid var(--line)',
              background: 'var(--board)', textDecoration: 'none',
            }}>
              <div style={{ fontSize: 13.5, color: 'var(--ink)', lineHeight: 1.4, marginBottom: 4 }}>{p.title}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>{p.source} · {p.category}</div>
            </a>
          ))}
        </div>
      )}
    </Modal>
  )
}
