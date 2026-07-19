'use client'

import { useState } from 'react'
import Link from 'next/link'
import { validateSubmission, type SubmissionInput } from '@/lib/submissions/validate'
import { getSubmissionFeeInr, FEATURED_ADDON_INR, FEATURED_DURATION_DAYS } from '@/lib/billing/submissionFees'

declare global {
  interface Window {
    Razorpay: any
  }
}

const AUDIENCES = ['STUDENT', 'EARLY_CAREER', 'FOUNDER', 'GENERAL']
const DIFFICULTIES = ['Easy', 'Medium', 'Hard']
const LISTING_TYPES: { value: string; label: string }[] = [
  { value: 'scholarship_grant', label: 'Scholarship / Fellowship / Grant' },
  { value: 'competition', label: 'Competition / Hackathon' },
  { value: 'job_internship', label: 'Job / Internship (company hiring)' },
]

const EMPTY_FORM: SubmissionInput = {
  title: '', description: '', url: '', org: '', audience: 'STUDENT',
  eligibility: '', prepResources: '', difficulty: 'Medium',
  tags: '', location: '', compType: '', submitterEmail: '',
  listingType: 'scholarship_grant', wantsFeatured: false,
}

function inputStyle(): React.CSSProperties {
  return {
    width: '100%', padding: '11px 14px', borderRadius: 2, border: '1.5px solid var(--line)',
    fontFamily: 'var(--font-mono)', fontSize: 13, background: 'var(--card)', color: 'var(--ink)',
    outline: 'none', marginBottom: 14,
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise(resolve => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function SubmitPage() {
  const [form, setForm] = useState<SubmissionInput>(EMPTY_FORM)
  const [errors, setErrors] = useState<string[]>([])
  const [stage, setStage] = useState<'form' | 'paying' | 'done'>('form')
  const [error, setError] = useState('')

  function set<K extends keyof SubmissionInput>(key: K, value: SubmissionInput[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  const fee = getSubmissionFeeInr(form.listingType, form.wantsFeatured)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const { ok, errors: validationErrors } = validateSubmission(form)
    if (!ok) {
      setErrors(validationErrors)
      return
    }
    setErrors([])
    setStage('paying')

    try {
      const res = await fetch('/api/opportunities/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong.')

      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) throw new Error('Could not load the payment widget. Check your connection and try again.')

      const rzp = new window.Razorpay({
        key: data.keyId,
        order_id: data.orderId,
        amount: data.amount,
        currency: data.currency,
        name: 'OppIDX',
        description: `Listing review fee (₹${fee}) — ${form.title}`,
        prefill: { email: form.submitterEmail },
        theme: { color: '#c2410c' },
        handler: () => setStage('done'),
        modal: { ondismiss: () => { setStage('form'); setError('Payment cancelled — nothing was charged. Submit again when ready.') } },
      })
      rzp.on('payment.failed', () => {
        setStage('form')
        setError('Payment failed — nothing was charged. Please try again.')
      })
      rzp.open()
    } catch (err: any) {
      setStage('form')
      setError(err.message)
    }
  }


  if (stage === 'done') {
    return (
      <div style={{ minHeight: '100vh', padding: '40px 20px 80px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <Link href="/" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-2)', textDecoration: 'none' }}>
            ← Back to OppIDX
          </Link>
          <div className="card-box" style={{ marginTop: 20, padding: '36px 32px', textAlign: 'center' }}>
            <div style={{ color: 'var(--pin)', marginBottom: 14 }}>◆</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink)', textTransform: 'uppercase', marginBottom: 12 }}>
              Payment received.
            </h1>
            <p style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.7 }}>
              Your listing is now in front of a real person, not a queue of algorithms — we review every
              submission within 3 business days. We hold every submission to the same bar — genuine,
              verifiable, nothing gated behind a DM. If it clears review, it goes live on the board. The fee
              covers the review itself, whatever the outcome, and isn't refundable — except if we fail to
              review it at all (see /terms). A rejected listing can be fixed and resubmitted; the review fee
              applies again since it's a new review.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px 80px' }}>
      <div style={{ maxWidth: 620, margin: '0 auto' }}>
        <Link href="/" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-2)', textDecoration: 'none' }}>
          ← Back to OppIDX
        </Link>

        <div className="card-box" style={{ marginTop: 20, padding: '32px 30px' }}>
          <div style={{ textAlign: 'center', marginBottom: 26 }}>
            <div style={{ color: 'var(--pin)', marginBottom: 12 }}>◆</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink)', textTransform: 'uppercase', marginBottom: 8 }}>
              Enlist your opportunity
            </h1>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.65, maxWidth: 460, margin: '0 auto' }}>
              This is a premium, hand-reviewed board — not a bulletin anyone can post to for free. A review
              fee (₹1,000 for scholarships, grants, and competitions; ₹3,000 for company job/internship
              postings) gets your listing in front of a real person within 3 business days. It doesn't buy
              approval — see /terms for the full policy.
            </p>
          </div>

          <div style={{
            background: 'var(--board)', border: '1.5px solid var(--line)', borderRadius: 2,
            padding: '16px 18px', marginBottom: 24, fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.7,
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ink)', marginBottom: 8, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              What clears review
            </div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>Nothing illegal, and nothing suggestive.</li>
              <li>One link only — a direct, secure (https) link to the application itself.</li>
              <li>No phone numbers, no @handles, no "DM us," no email addresses in the listing text.</li>
              <li>No shortened, social, or redirect links standing in for the real application page.</li>
            </ul>
          </div>

          <form onSubmit={submit}>
            <input style={inputStyle()} placeholder="Title" required value={form.title} onChange={e => set('title', e.target.value)} />
            <input style={inputStyle()} placeholder="Organization" value={form.org} onChange={e => set('org', e.target.value)} />
            <textarea style={{ ...inputStyle(), minHeight: 90, resize: 'vertical' }} placeholder="Description (at least a real paragraph)" required value={form.description} onChange={e => set('description', e.target.value)} />
            <input style={inputStyle()} placeholder="Application URL (https://the-org's-own-page.com/…)" required value={form.url} onChange={e => set('url', e.target.value)} />
            <select style={inputStyle()} value={form.audience} onChange={e => set('audience', e.target.value)}>
              {AUDIENCES.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <select style={inputStyle()} value={form.listingType} onChange={e => set('listingType', e.target.value)}>
              {LISTING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <textarea style={{ ...inputStyle(), minHeight: 60, resize: 'vertical' }} placeholder="Eligibility — who can actually apply" required value={form.eligibility} onChange={e => set('eligibility', e.target.value)} />
            <textarea style={{ ...inputStyle(), minHeight: 60, resize: 'vertical' }} placeholder="Suggested prep resources (optional)" value={form.prepResources} onChange={e => set('prepResources', e.target.value)} />
            <select style={inputStyle()} value={form.difficulty} onChange={e => set('difficulty', e.target.value)}>
              {DIFFICULTIES.map(d => <option key={d} value={d}>{d} difficulty</option>)}
            </select>
            <input style={inputStyle()} placeholder="Tags, comma-separated (remote,paid,ai)" value={form.tags} onChange={e => set('tags', e.target.value)} />
            <input style={inputStyle()} placeholder="Location" value={form.location} onChange={e => set('location', e.target.value)} />
            <input style={inputStyle()} placeholder="Compensation (Paid / Unpaid / Stipend)" value={form.compType} onChange={e => set('compType', e.target.value)} />
            <input style={inputStyle()} type="email" placeholder="Your email (for payment + status only — never published)" required value={form.submitterEmail} onChange={e => set('submitterEmail', e.target.value)} />

            <label style={{
              display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 18, padding: '12px 14px',
              border: '1.5px solid var(--line)', borderRadius: 2, cursor: 'pointer', fontSize: 12.5,
              color: 'var(--ink-2)', lineHeight: 1.6,
            }}>
              <input
                type="checkbox" checked={form.wantsFeatured}
                onChange={e => set('wantsFeatured', e.target.checked)}
                style={{ marginTop: 2 }}
              />
              <span>
                <strong style={{ color: 'var(--ink)' }}>Feature this listing (+₹{FEATURED_ADDON_INR})</strong> — once
                approved, guaranteed inclusion in the homepage's daily featured-picks pool for {FEATURED_DURATION_DAYS} days.
              </span>
            </label>

            {errors.length > 0 && (
              <div style={{ marginBottom: 16, padding: '12px 14px', border: '1.5px solid var(--danger)', borderRadius: 2 }}>
                {errors.map((e, i) => (
                  <div key={i} style={{ color: 'var(--danger)', fontSize: 12, fontFamily: 'var(--font-mono)', marginBottom: i < errors.length - 1 ? 4 : 0 }}>
                    · {e}
                  </div>
                ))}
              </div>
            )}
            {error && <div style={{ color: 'var(--danger)', fontSize: 12.5, marginBottom: 14 }}>{error}</div>}

            <button type="submit" disabled={stage === 'paying'} style={{
              width: '100%', padding: '13px 26px', borderRadius: 2, border: 'none', cursor: 'pointer',
              background: 'var(--btn-bg)', color: 'var(--btn-text)', fontFamily: 'var(--font-mono)',
              fontWeight: 700, fontSize: 13.5, letterSpacing: '0.02em', boxShadow: '4px 4px 0 var(--shadow)',
            }}>
              {stage === 'paying' ? 'Opening checkout…' : `Continue to payment — ₹${fee}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
