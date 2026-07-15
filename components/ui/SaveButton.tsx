'use client'

import { useState } from 'react'

async function callSaved(method: 'POST' | 'DELETE', opportunityId: string, email?: string) {
  return fetch('/api/saved', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ opportunityId, email }),
  })
}

export function SaveButton({ opportunityId, initiallySaved = false }: { opportunityId: string; initiallySaved?: boolean }) {
  const [saved, setSaved] = useState(initiallySaved)
  const [needsEmail, setNeedsEmail] = useState(false)
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)

  async function toggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (busy) return
    setBusy(true)
    try {
      if (saved) {
        await callSaved('DELETE', opportunityId)
        setSaved(false)
      } else {
        const res = await callSaved('POST', opportunityId)
        if (res.status === 401) {
          setNeedsEmail(true)
        } else if (res.ok) {
          setSaved(true)
        }
      }
    } finally {
      setBusy(false)
    }
  }

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!email.trim()) return
    setBusy(true)
    try {
      const res = await callSaved('POST', opportunityId, email.trim())
      if (res.ok) {
        setSaved(true)
        setNeedsEmail(false)
      }
    } finally {
      setBusy(false)
    }
  }

  if (needsEmail) {
    return (
      <form
        onSubmit={submitEmail}
        onClick={e => e.stopPropagation()}
        style={{ display: 'flex', gap: 6 }}
      >
        <input
          autoFocus
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          style={{
            padding: '5px 8px', borderRadius: 2, border: '1.5px solid var(--line)',
            background: 'var(--card)', color: 'var(--ink)', fontFamily: 'var(--font-mono)',
            fontSize: 11.5, width: 150, outline: 'none',
          }}
        />
        <button type="submit" disabled={busy} style={{
          padding: '5px 10px', borderRadius: 2, border: 'none', cursor: 'pointer',
          background: 'var(--btn-bg)', color: 'var(--btn-text)', fontFamily: 'var(--font-mono)',
          fontSize: 11.5, fontWeight: 700,
        }}>
          Save
        </button>
      </form>
    )
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      title={saved ? 'Remove from saved' : 'Save for later'}
      style={{
        padding: '5px 12px', borderRadius: 2, cursor: 'pointer',
        border: `1.5px solid ${saved ? 'var(--pin)' : 'var(--line)'}`,
        background: saved ? 'var(--pin)' : 'var(--card)',
        color: saved ? 'var(--btn-text)' : 'var(--ink)',
        fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 700,
      }}
    >
      {saved ? '★ Saved' : '☆ Save'}
    </button>
  )
}
