'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

/* ─── Colour palette ─────────────────────────────────────────────
   One accent only. Warm saffron on warm near-black.
   Inspired by Sarvam AI's earthy restraint.
──────────────────────────────────────────────────────────────── */
const C = {
  bg:       '#080705',
  surface:  '#110F0C',
  surfaceHi:'#1A1612',
  border:   'rgba(240,235,227,0.07)',
  borderHi: 'rgba(240,235,227,0.13)',
  text1:    '#F0EBE3',
  text2:    'rgba(240,235,227,0.52)',
  text3:    'rgba(240,235,227,0.27)',
  accent:   '#E8651A',
  accentDim:'rgba(232,101,26,0.13)',
  accentGlow:'rgba(232,101,26,0.22)',
}

/* ─── Logo ───────────────────────────────────────────────────── */
function NuroIcon({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="11" fill={C.accent} />
      {/* Neural triangle */}
      <line x1="11" y1="28" x2="20" y2="12" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeOpacity="0.5" />
      <line x1="20" y1="12" x2="29" y2="28" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeOpacity="0.5" />
      <line x1="11" y1="28" x2="29" y2="28" stroke="white" strokeWidth="2"   strokeLinecap="round" strokeOpacity="0.3" />
      <line x1="20" y1="12" x2="20" y2="28" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.25" />
      <circle cx="20" cy="12" r="3.2" fill="white" />
      <circle cx="11" cy="28" r="2.7" fill="white" fillOpacity="0.88" />
      <circle cx="29" cy="28" r="2.7" fill="white" fillOpacity="0.88" />
    </svg>
  )
}

/** Wordmark: icon + lowercase italic serif "nuro" */
function NuroWordmark({ size = 36 }: { size?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <NuroIcon size={size} />
      <span style={{
        fontFamily: "'Instrument Serif', Georgia, serif",
        fontStyle: 'italic',
        fontSize: size * 0.52,
        fontWeight: 400,
        letterSpacing: '-0.01em',
        color: C.text1,
        lineHeight: 1,
      }}>
        nuro
      </span>
    </div>
  )
}

/* ─── Cal badge ──────────────────────────────────────────────── */
function CalBadge({ small }: { small?: boolean }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: small ? '3px 9px' : '5px 12px',
      borderRadius: 980,
      background: 'rgba(0,50,160,0.14)',
      border: '1px solid rgba(30,80,200,0.22)',
      fontSize: small ? 11 : 12,
      fontWeight: 600,
    }}>
      <span>🐻</span>
      <span style={{ color: '#5B8DEF' }}>Cal</span>
      <span style={{ color: '#FDB515' }}>Berkeley</span>
    </div>
  )
}

/* ─── Floating bubble ────────────────────────────────────────── */
function Bubble({ text, x, delay, duration }: {
  text: string; x: string; delay: number; duration: number
}) {
  return (
    <div style={{
      position: 'absolute', left: x, bottom: '-60px',
      padding: '7px 14px', borderRadius: 980,
      background: C.accentDim,
      border: `1px solid rgba(232,101,26,0.22)`,
      fontSize: 12, fontWeight: 500, color: C.accent,
      whiteSpace: 'nowrap',
      animation: `floatUp ${duration}s ease-in ${delay}s infinite`,
      backdropFilter: 'blur(8px)',
      pointerEvents: 'none',
    }}>{text}</div>
  )
}

/* ─── Platform pill ──────────────────────────────────────────── */
function Pill({ name, icon }: { name: string; icon: string }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      padding: '8px 16px', borderRadius: 980,
      background: C.accentDim, border: `1px solid rgba(232,101,26,0.2)`,
      fontSize: 13, fontWeight: 500, color: C.text2, whiteSpace: 'nowrap',
    }}>
      <span style={{ fontSize: 15 }}>{icon}</span>{name}
    </div>
  )
}

/* ─── Feature card ───────────────────────────────────────────── */
function FeatureCard({ icon, title, desc, delay }: {
  icon: string; title: string; desc: string; delay: number
}) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '28px 24px', borderRadius: 18,
        background: hov ? C.surfaceHi : C.surface,
        border: `1px solid ${hov ? C.borderHi : C.border}`,
        transition: 'all 0.22s',
        transform: hov ? 'translateY(-4px)' : 'none',
        opacity: 0,
        animation: `fadeUp 0.55s cubic-bezier(0.16,1,0.3,1) ${delay}s forwards`,
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: C.accentDim, border: `1px solid rgba(232,101,26,0.2)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, marginBottom: 18,
      }}>{icon}</div>
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: C.text1, letterSpacing: '-0.01em' }}>{title}</h3>
      <p style={{ fontSize: 14, color: C.text2, lineHeight: 1.65, margin: 0 }}>{desc}</p>
    </div>
  )
}

/* ─── Testimonial ────────────────────────────────────────────── */
function Testimonial({ quote, name, role, initial }: {
  quote: string; name: string; role: string; initial: string
}) {
  return (
    <div style={{ padding: '26px', borderRadius: 18, background: C.surface, border: `1px solid ${C.border}` }}>
      <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>
        {[...Array(5)].map((_, i) => <span key={i} style={{ color: C.accent, fontSize: 12 }}>★</span>)}
      </div>
      <p style={{ fontSize: 15, color: C.text2, lineHeight: 1.72, marginBottom: 20, fontStyle: 'italic' }}>
        &ldquo;{quote}&rdquo;
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <div style={{
          width: 38, height: 38, borderRadius: '50%',
          background: C.accentDim, border: `1px solid rgba(232,101,26,0.25)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700, color: C.accent, flexShrink: 0,
        }}>{initial}</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text1 }}>{name}</div>
          <div style={{ fontSize: 12, color: C.text3 }}>{role}</div>
        </div>
      </div>
    </div>
  )
}

/* ─── Price card ─────────────────────────────────────────────── */
function PriceCard({ name, price, period, features, highlight, cta }: {
  name: string; price: string; period: string;
  features: string[]; highlight?: boolean; cta: string
}) {
  return (
    <div style={{
      padding: '30px 26px', borderRadius: 22, flex: 1, position: 'relative',
      background: highlight ? C.surfaceHi : C.surface,
      border: `1px solid ${highlight ? `rgba(232,101,26,0.35)` : C.border}`,
      boxShadow: highlight ? `0 0 40px rgba(232,101,26,0.1)` : 'none',
    }}>
      {highlight && (
        <div style={{
          position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
          background: C.accent, color: 'white',
          fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase', padding: '4px 16px', borderRadius: 980,
          whiteSpace: 'nowrap',
        }}>Most Popular</div>
      )}
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.text3, marginBottom: 8 }}>{name}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
        <span style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-0.045em', color: C.text1 }}>{price}</span>
        <span style={{ fontSize: 14, color: C.text3 }}>{period}</span>
      </div>
      <div style={{ height: 1, background: C.border, margin: '22px 0' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 26 }}>
        {features.map((f, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ color: C.accent, fontSize: 13, marginTop: 1, flexShrink: 0 }}>✓</span>
            <span style={{ fontSize: 14, color: C.text2 }}>{f}</span>
          </div>
        ))}
      </div>
      <Link href="/" style={{
        display: 'block', textAlign: 'center', padding: '13px',
        borderRadius: 12, textDecoration: 'none',
        fontWeight: 600, fontSize: 14,
        background: highlight ? C.accent : 'rgba(240,235,227,0.07)',
        color: highlight ? 'white' : C.text2,
        boxShadow: highlight ? `0 6px 28px ${C.accentGlow}` : 'none',
      }}>{cta}</Link>
    </div>
  )
}

/* ─── Stat ───────────────────────────────────────────────────── */
function Stat({ value, label, icon }: { value: string; label: string; icon: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '18px 12px' }}>
      <div style={{ fontSize: 26, marginBottom: 8 }}>{icon}</div>
      <div style={{
        fontSize: 38, fontWeight: 800, letterSpacing: '-0.04em',
        fontFamily: "'Instrument Serif', Georgia, serif",
        color: C.accent, marginBottom: 6,
      }}>{value}</div>
      <div style={{ fontSize: 13, color: C.text3, lineHeight: 1.4 }}>{label}</div>
    </div>
  )
}

/* ─── Ticker ─────────────────────────────────────────────────── */
function Ticker() {
  const items = [
    '🧠 Brain Health Score', '💬 Unified Inbox', '📸 Instants',
    '⚡ Real-time AI', '🔒 End-to-end Encrypted', '📊 Feed Intelligence',
    '🤖 AI Reply Assist', '⏱️ Anti-Addiction Mode', '🌱 Live Authentically',
    '🧠 Brain Health Score', '💬 Unified Inbox', '📸 Instants',
  ]
  return (
    <div style={{ overflow: 'hidden', padding: '16px 0' }}>
      <div style={{ display: 'flex', gap: 48, animation: 'ticker 30s linear infinite', width: 'max-content' }}>
        {items.map((item, i) => (
          <span key={i} style={{ fontSize: 13, fontWeight: 500, color: C.text3, whiteSpace: 'nowrap' }}>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export default function Landing() {
  const parallaxRef = useRef<HTMLDivElement>(null)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const el = parallaxRef.current
    if (!el) return
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20
      const y = (e.clientY / window.innerHeight - 0.5) * 20
      el.style.transform = `translate(${x}px, ${y}px)`
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  const navOpacity = Math.min(scrollY / 80, 1)

  return (
    <div style={{ background: C.bg, color: C.text1, fontFamily: "'DM Sans', system-ui, sans-serif", overflowX: 'hidden' }}>

      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0);      opacity: 0; }
          6%   { opacity: 1; }
          88%  { opacity: 0.65; }
          100% { transform: translateY(-540px); opacity: 0; }
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes floatY {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-10px); }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.4; }
          50%      { opacity: 0.9; }
        }
        a:hover { opacity: 0.8; }
      `}</style>

      {/* ── Nav ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 64, padding: '0 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: `rgba(8,7,5,${navOpacity * 0.94})`,
        backdropFilter: navOpacity > 0.05 ? 'blur(20px)' : 'none',
        borderBottom: `1px solid rgba(240,235,227,${navOpacity * 0.06})`,
        transition: 'background 0.3s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <NuroWordmark size={32} />
          <CalBadge small />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          {['Features', 'How it works', 'Pricing'].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`}
              style={{ fontSize: 14, fontWeight: 500, color: C.text3, textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = C.text1)}
              onMouseLeave={e => (e.currentTarget.style.color = C.text3)}
            >{l}</a>
          ))}
          <Link href="/" style={{
            fontSize: 14, fontWeight: 600, padding: '9px 22px', borderRadius: 980,
            background: C.accent, color: 'white', textDecoration: 'none',
            boxShadow: `0 4px 20px ${C.accentGlow}`,
          }}>Open App →</Link>
        </div>
      </nav>

      {/* ══════════════════════════════
          HERO
      ══════════════════════════════ */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '120px 24px 0', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Ambient glow */}
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 500, borderRadius: '50%', background: `radial-gradient(ellipse, rgba(232,101,26,0.1) 0%, transparent 70%)`, pointerEvents: 'none' }} />

        {/* Parallax layer */}
        <div ref={parallaxRef} style={{ position: 'absolute', inset: 0, transition: 'transform 0.12s ease-out', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '20%', left: '12%', width: 320, height: 320, borderRadius: '50%', background: `radial-gradient(circle, rgba(232,101,26,0.13) 0%, transparent 70%)` }} />
          <div style={{ position: 'absolute', top: '30%', right: '10%', width: 260, height: 260, borderRadius: '50%', background: `radial-gradient(circle, rgba(232,101,26,0.08) 0%, transparent 70%)` }} />
        </div>

        {/* Floating bubbles */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <Bubble text="🧠 94 — Mom · WhatsApp"       x="7%"  delay={0}   duration={9} />
          <Bubble text="⚡ Brain score ↑ 87"           x="22%" delay={3.5} duration={11} />
          <Bubble text="📸 Aysha posted an Instant"    x="62%" delay={1.5} duration={10} />
          <Bubble text="💬 4 platforms connected"      x="78%" delay={5}   duration={8} />
          <Bubble text="⚠️ Brain-rot detected"         x="42%" delay={7}   duration={12} />
          <Bubble text="✓ Genuine connection"          x="55%" delay={2}   duration={9} />
        </div>

        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 820 }}>

          {/* Badges */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40, opacity: 0, animation: 'fadeUp 0.5s ease 0.1s forwards' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 18px', borderRadius: 980,
              background: C.accentDim, border: `1px solid rgba(232,101,26,0.22)`,
              fontSize: 13, fontWeight: 500, color: C.text2,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.accent, display: 'inline-block', animation: 'glowPulse 2.5s ease-in-out infinite', boxShadow: `0 0 6px ${C.accent}` }} />
              Unified messaging + brain health. One app.
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 980, background: 'rgba(0,50,160,0.12)', border: '1px solid rgba(30,80,200,0.2)', fontSize: 13, fontWeight: 600 }}>
              <span>🐻</span>
              <span style={{ color: '#5B8DEF' }}>Built at </span>
              <span style={{ color: '#FDB515' }}>UC Berkeley</span>
            </div>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(52px, 9vw, 94px)', fontWeight: 800, lineHeight: 1.0,
            letterSpacing: '-0.045em', marginBottom: 32, color: C.text1,
            opacity: 0, animation: 'fadeUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.2s forwards',
          }}>
            All your messages.<br />
            <span style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontStyle: 'italic', color: C.accent,
            }}>Your mind, protected.</span>
          </h1>

          {/* Subhead */}
          <p style={{
            fontSize: 19, lineHeight: 1.7, color: C.text2,
            maxWidth: 540, margin: '0 auto 52px',
            opacity: 0, animation: 'fadeUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.35s forwards',
          }}>
            Nuro unifies every DM you have — WhatsApp, Instagram, Discord, Gmail — then uses AI to score what&rsquo;s draining your brain and nudges you back to real life.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 52, opacity: 0, animation: 'fadeUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.5s forwards' }}>
            <Link href="/" style={{
              fontSize: 16, fontWeight: 700, padding: '16px 40px', borderRadius: 980,
              background: C.accent, color: 'white', textDecoration: 'none',
              boxShadow: `0 8px 36px ${C.accentGlow}`,
            }}>Start for free</Link>
            <a href="#features" style={{
              fontSize: 16, fontWeight: 500, padding: '16px 40px', borderRadius: 980,
              background: C.accentDim, border: `1px solid rgba(232,101,26,0.2)`,
              color: C.text2, textDecoration: 'none',
            }}>See how it works</a>
          </div>

          {/* Platform pills */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', opacity: 0, animation: 'fadeIn 0.8s ease 0.8s forwards' }}>
            <Pill name="WhatsApp"  icon="💬" />
            <Pill name="Instagram" icon="📸" />
            <Pill name="Discord"   icon="🎮" />
            <Pill name="Gmail"     icon="✉️" />
            <Pill name="Twitter/X" icon="🐦" />
          </div>
        </div>

        {/* App preview mockup */}
        <div style={{
          position: 'relative', zIndex: 2, marginTop: 72, width: '100%', maxWidth: 1000,
          opacity: 0,
          animation: 'fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.65s forwards, floatY 8s ease-in-out 2s infinite',
        }}>
          <div style={{
            borderRadius: 22, overflow: 'hidden', background: C.surface,
            border: `1px solid ${C.borderHi}`,
            boxShadow: '0 40px 100px rgba(0,0,0,0.6), inset 0 1px 0 rgba(240,235,227,0.06)',
          }}>
            {/* Window chrome */}
            <div style={{ padding: '12px 20px', background: C.bg, display: 'flex', alignItems: 'center', gap: 8, borderBottom: `1px solid ${C.border}` }}>
              <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#febc2e' }} />
              <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#28c840' }} />
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <div style={{ padding: '3px 16px', borderRadius: 7, background: C.accentDim, fontSize: 11, color: C.text3 }}>nuro.app — Dashboard</div>
              </div>
            </div>
            {/* Layout */}
            <div style={{ display: 'flex', height: 390 }}>
              {/* Sidebar */}
              <div style={{ width: 56, background: 'rgba(0,0,0,0.2)', borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 14, gap: 10 }}>
                <NuroIcon size={30} />
                <div style={{ marginTop: 6 }} />
                {['🧠','💬','📸','📊'].map((ic, i) => (
                  <div key={i} style={{ width: 36, height: 36, borderRadius: 10, background: i===1 ? C.accentDim : 'transparent', border: i===1 ? `1px solid rgba(232,101,26,0.25)` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{ic}</div>
                ))}
              </div>
              {/* Inbox */}
              <div style={{ width: 235, borderRight: `1px solid ${C.border}`, padding: 13, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.text3, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Inbox · 6 unread</div>
                {[
                  { n:'Mom',        c:'#E8651A', t:'Coming home?',     s:94, u:2 },
                  { n:'Aysha ✨',   c:'#E8651A', t:'omg did u see',    s:68, u:3 },
                  { n:'Rahul',      c:'#E8651A', t:'match last night',  s:88, u:0 },
                  { n:'TechDigest', c:'#E8651A', t:'Weekly digest',     s:45, u:1 },
                  { n:'Dev squad',  c:'#E8651A', t:'hop on we need 4th',s:79, u:0 },
                ].map((c, i) => (
                  <div key={i} style={{ padding: '8px 10px', borderRadius: 10, background: i===0 ? C.accentDim : 'transparent', display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: C.accentDim, border: `1.5px solid rgba(232,101,26,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: C.accent, flexShrink: 0 }}>{c.n[0]}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: C.text1 }}>{c.n}</span>
                        <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 980, background: C.accentDim, color: C.accent, fontWeight: 700 }}>{c.s}</span>
                      </div>
                      <span style={{ fontSize: 11, color: C.text3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{c.t}</span>
                    </div>
                    {c.u > 0 && <span style={{ fontSize: 10, fontWeight: 700, background: C.accent, color: 'white', borderRadius: 980, padding: '1px 5px', flexShrink: 0 }}>{c.u}</span>}
                  </div>
                ))}
              </div>
              {/* Chat */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '10px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: C.accentDim, border: `1.5px solid rgba(232,101,26,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: C.accent }}>M</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text1 }}>Mom</div>
                    <div style={{ fontSize: 10, color: C.text3 }}>via WhatsApp · Active</div>
                  </div>
                  <div style={{ marginLeft: 'auto', padding: '4px 11px', borderRadius: 980, background: C.accentDim, border: `1px solid rgba(232,101,26,0.25)`, fontSize: 11, fontWeight: 700, color: C.accent }}>🧠 94 score</div>
                </div>
                <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { me:false, t:'Hey! Are you free this weekend? 🏠' },
                    { me:false, t:'Miss you so much!' },
                    { me:true,  t:'Yes!! Arriving Friday evening 🙌' },
                    { me:false, t:"Amazing! I'll make your fav food 💚" },
                  ].map((m, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: m.me ? 'flex-end' : 'flex-start' }}>
                      <div style={{ padding: '8px 13px', maxWidth: '72%', borderRadius: m.me ? '18px 4px 18px 18px' : '4px 18px 18px 18px', background: m.me ? C.accent : C.surfaceHi, border: m.me ? 'none' : `1px solid ${C.border}`, fontSize: 12, color: m.me ? 'white' : C.text1 }}>{m.t}</div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '10px 13px', borderTop: `1px solid ${C.border}`, display: 'flex', gap: 8 }}>
                  <div style={{ flex: 1, padding: '8px 12px', borderRadius: 10, background: C.accentDim, border: `1px solid rgba(232,101,26,0.15)`, fontSize: 12, color: C.text3 }}>Reply…</div>
                  <div style={{ width: 33, height: 33, borderRadius: 9, background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'white' }}>↑</div>
                </div>
              </div>
              {/* Brain panel */}
              <div style={{ width: 195, borderLeft: `1px solid ${C.border}`, padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 13 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.text3, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Mind Score</div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <svg width="88" height="88" viewBox="0 0 88 88">
                    <circle cx="44" cy="44" r="33" fill="none" stroke={C.border} strokeWidth="6" />
                    <circle cx="44" cy="44" r="33" fill="none" stroke={C.accent} strokeWidth="6" strokeLinecap="round" strokeDasharray="207" strokeDashoffset="52" transform="rotate(-90 44 44)" style={{ filter: `drop-shadow(0 0 6px ${C.accentGlow})` }} />
                    <text x="44" y="41" textAnchor="middle" fill={C.text1} fontSize="17" fontWeight="700" fontFamily="'DM Sans',sans-serif">74</text>
                    <text x="44" y="54" textAnchor="middle" fill={C.accent} fontSize="9" fontFamily="'DM Sans',sans-serif" fontWeight="600">Good</text>
                  </svg>
                </div>
                {[['Genuine msgs','72%'],['Screen time','3.2h'],['Brain rot','Low']].map(([l,v],i)=>(
                  <div key={i} style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ fontSize:11, color:C.text3 }}>{l}</span>
                    <span style={{ fontSize:12, fontWeight:700, color:C.accent }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ position:'absolute', bottom:-50, left:'50%', transform:'translateX(-50%)', width:'55%', height:90, background:`radial-gradient(ellipse, ${C.accentGlow} 0%, transparent 70%)`, pointerEvents:'none' }} />
        </div>

        {/* Ticker */}
        <div style={{ width: '100%', marginTop: 52, position: 'relative', zIndex: 2 }}>
          <Ticker />
        </div>
      </section>

      {/* ══════════════════════════════
          STATS
      ══════════════════════════════ */}
      <section style={{ padding: '16px 48px 44px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          <Stat value="5+"   label="platforms connected" icon="🔗" />
          <Stat value="94%"  label="users feel less overwhelmed" icon="😌" />
          <Stat value="2.1h" label="daily screen time saved" icon="⏱️" />
          <Stat value="100%" label="private · zero data sold" icon="🔒" />
        </div>
      </section>

      {/* ══════════════════════════════
          FEATURES
      ══════════════════════════════ */}
      <section id="features" style={{ padding: '72px 48px 88px', position: 'relative', zIndex: 1, background: C.surface }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.text3, marginBottom: 16 }}>What makes Nuro different</div>
            <h2 style={{ fontSize: 'clamp(34px, 5vw, 58px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05, color: C.text1 }}>
              Built for humans,<br />
              <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: C.accent }}>not engagement metrics.</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
            <FeatureCard delay={0.1} icon="💬" title="Unified Inbox"
              desc="Every DM from every platform in one inbox. WhatsApp, Instagram, Discord, Gmail — together, finally." />
            <FeatureCard delay={0.2} icon="🧠" title="Brain Health Score"
              desc="AI scores every message and feed item for genuine connection vs mental drain. See exactly what's eroding your focus." />
            <FeatureCard delay={0.3} icon="📸" title="Instants"
              desc="A random notification once a day. You have 2 minutes to capture what you're genuinely doing — front and back camera at once. No filters, no staging." />
            <FeatureCard delay={0.4} icon="📊" title="Feed Intelligence"
              desc="Your Instagram, YouTube, and Twitter feeds re-ranked by actual brain value. Scroll with intention, not compulsion." />
            <FeatureCard delay={0.5} icon="🤖" title="AI Reply Assist"
              desc="Smart, context-aware reply suggestions that sound like you. Less time typing, more time being present." />
            <FeatureCard delay={0.6} icon="⏱️" title="Anti-Addiction Mode"
              desc="Usage nudges, decay scoring, and scheduled Do Not Disturb. Nuro fights for your attention so Big Tech can't steal it." />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          HOW IT WORKS
      ══════════════════════════════ */}
      <section id="how-it-works" style={{ padding: '72px 48px 88px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 940, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 68 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.text3, marginBottom: 16 }}>How it works</div>
            <h2 style={{ fontSize: 'clamp(34px, 5vw, 54px)', fontWeight: 800, letterSpacing: '-0.04em', color: C.text1, lineHeight: 1.05 }}>
              Three steps to a clearer mind.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 56 }}>
            {[
              { n:'01', title:'Connect everything',   desc:'Link your platforms in one tap. End-to-end encrypted. Your data stays yours — never sold, never shared.', icon:'🔗' },
              { n:'02', title:'AI scores your world',  desc:'Every message, post, and minute of screen time gets a brain health rating — instantly, privately.', icon:'🧠' },
              { n:'03', title:'Reclaim your life',     desc:'Personalized nudges, wellness reports, and authentic Instants replace doom-scrolling with real connection.', icon:'🌱' },
            ].map((s,i)=>(
              <div key={i}>
                <div style={{ fontSize: 72, fontWeight: 800, color: 'rgba(232,101,26,0.06)', letterSpacing: '-0.05em', lineHeight: 1, marginBottom: 10, fontFamily: "'DM Sans',sans-serif" }}>{s.n}</div>
                <div style={{ fontSize: 26, marginBottom: 12 }}>{s.icon}</div>
                <h3 style={{ fontSize: 19, fontWeight: 700, marginBottom: 10, letterSpacing: '-0.02em', color: C.text1 }}>{s.title}</h3>
                <p style={{ fontSize: 15, color: C.text2, lineHeight: 1.68 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          INSTANTS
      ══════════════════════════════ */}
      <section style={{ padding: '72px 48px 88px', background: C.surface, position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1060, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.text3, marginBottom: 16 }}>Instants</div>
            <h2 style={{ fontSize: 'clamp(30px, 4vw, 50px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: 22, color: C.text1 }}>
              Real moments.<br />
              <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: C.accent }}>Not highlights.</span>
            </h2>
            <p style={{ fontSize: 16, color: C.text2, lineHeight: 1.72, marginBottom: 34 }}>
              Once a day, Nuro sends a random notification. You get 2 minutes to capture what you&rsquo;re genuinely doing — front and back camera simultaneously. Your friends see the real you, not the curated version.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { icon:'🎲', text:'Random daily notification — no time to stage anything' },
                { icon:'📱', text:'Dual camera captures you and your world at the same moment' },
                { icon:'🧠', text:'AI scores your moment for authenticity vs performance' },
                { icon:'👁️', text:"Friends only see yours after they post their own" },
              ].map((f,i)=>(
                <div key={i} style={{ display:'flex', gap:13, alignItems:'flex-start' }}>
                  <span style={{ fontSize:19, flexShrink:0 }}>{f.icon}</span>
                  <span style={{ fontSize:15, color:C.text2, lineHeight:1.55 }}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Phone */}
          <div style={{ display:'flex', justifyContent:'center' }}>
            <div style={{ width:250, position:'relative', animation:'floatY 7s ease-in-out infinite' }}>
              <div style={{ borderRadius:44, background:C.bg, border:`2px solid ${C.borderHi}`, overflow:'hidden', aspectRatio:'9/19', boxShadow:`0 40px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(240,235,227,0.04)`, display:'flex', flexDirection:'column' }}>
                <div style={{ display:'flex', justifyContent:'center', padding:'11px 0 7px' }}>
                  <div style={{ width:90, height:26, borderRadius:18, background:'#000' }} />
                </div>
                <div style={{ flex:1, padding:'6px 11px', display:'flex', flexDirection:'column', gap:8 }}>
                  <div style={{ textAlign:'center', padding:'7px 10px', borderRadius:12, background:C.accentDim, border:`1px solid rgba(232,101,26,0.25)` }}>
                    <div style={{ fontSize:10, fontWeight:700, color:C.accent, letterSpacing:'0.04em' }}>⚡ YOUR INSTANT IS WAITING</div>
                    <div style={{ fontSize:9, color:C.text3, marginTop:2 }}>2:00 left · 12 friends posted</div>
                  </div>
                  <div style={{ flex:1, borderRadius:16, overflow:'hidden', position:'relative', minHeight:150, background:`linear-gradient(145deg, ${C.surfaceHi}, ${C.surface})` }}>
                    <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:7 }}>
                      <div style={{ fontSize:40 }}>🏔️</div>
                      <div style={{ fontSize:10, color:C.text3 }}>View from my hike</div>
                    </div>
                    <div style={{ position:'absolute', top:9, left:9, width:56, height:70, borderRadius:12, background:C.accentDim, border:`2px solid rgba(232,101,26,0.3)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>😄</div>
                    <div style={{ position:'absolute', top:9, right:9, padding:'2px 8px', borderRadius:980, background:C.accentDim, border:`1px solid rgba(232,101,26,0.3)`, fontSize:10, fontWeight:700, color:C.accent }}>🧠 96</div>
                  </div>
                  <div>
                    <div style={{ fontSize:12, color:C.text1, fontWeight:500, marginBottom:6 }}>first sunrise hike of the year 🌅</div>
                    <div style={{ display:'flex', gap:6 }}>
                      {['❤️ 12','🔥 8','💚 5'].map((r,i)=>(
                        <span key={i} style={{ fontSize:11, color:C.text2, background:C.accentDim, padding:'2px 8px', borderRadius:980 }}>{r}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ padding:'7px 18px 18px', display:'flex', justifyContent:'space-around' }}>
                  {['💬','📸','🧠','👤'].map((ic,i)=>(
                    <div key={i} style={{ fontSize:19, opacity:i===1?1:0.3 }}>{ic}</div>
                  ))}
                </div>
              </div>
              <div style={{ position:'absolute', inset:-20, background:`radial-gradient(ellipse, ${C.accentGlow} 0%, transparent 70%)`, zIndex:-1, pointerEvents:'none' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          TESTIMONIALS
      ══════════════════════════════ */}
      <section style={{ padding: '72px 48px 88px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:52 }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:C.text3, marginBottom:14 }}>Early users</div>
            <h2 style={{ fontSize:'clamp(28px, 4vw, 44px)', fontWeight:800, letterSpacing:'-0.03em', color:C.text1 }}>
              People are getting their minds back.
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:18 }}>
            <Testimonial
              quote="I didn't realise how much anxiety came from switching between 6 different apps. Nuro changed that. My focus is genuinely back."
              name="Aanya S." role="Designer, Bangalore" initial="A" />
            <Testimonial
              quote="The brain score is addictive in the best way. I started avoiding mindless content because I could literally see it tank my score."
              name="Marcus T." role="Software Engineer, NYC" initial="M" />
            <Testimonial
              quote="Instants made me enjoy sharing again. No pressure to look perfect. My friends see the real me for once."
              name="Aysha K." role="Student, Dubai" initial="A" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          PRICING
      ══════════════════════════════ */}
      <section id="pricing" style={{ padding: '72px 48px 88px', background: C.surface, position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:64 }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:C.text3, marginBottom:16 }}>Pricing</div>
            <h2 style={{ fontSize:'clamp(34px, 5vw, 54px)', fontWeight:800, letterSpacing:'-0.04em', color:C.text1, lineHeight:1.05, marginBottom:14 }}>Simple, honest pricing.</h2>
            <p style={{ fontSize:16, color:C.text2 }}>No dark patterns. No selling your data. Cancel any time.</p>
          </div>
          <div style={{ display:'flex', gap:18, alignItems:'stretch' }}>
            <PriceCard name="Free" price="$0" period="/month" cta="Get started"
              features={['Up to 3 platforms','Basic brain health score','5 Instants per month','Unified inbox']} />
            <PriceCard name="Pro" price="$12" period="/month" cta="Start Pro free →" highlight
              features={['Unlimited platforms','Advanced AI brain scoring','Unlimited Instants','Feed intelligence ranking','AI reply suggestions','Weekly wellness reports','Anti-addiction nudges']} />
            <PriceCard name="Teams" price="$29" period="/mo per team" cta="Contact us"
              features={['Everything in Pro','Team brain health dashboard','Admin controls','Priority support']} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          FINAL CTA
      ══════════════════════════════ */}
      <section style={{ padding: '96px 48px', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
        {/* Ambient glow */}
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:600, height:360, background:`radial-gradient(ellipse, rgba(232,101,26,0.1) 0%, transparent 70%)`, pointerEvents:'none' }} />
        {/* Rotating rings */}
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:480, height:480, borderRadius:'50%', border:`1px solid rgba(232,101,26,0.07)`, animation:'spinSlow 44s linear infinite', pointerEvents:'none' }}>
          <div style={{ position:'absolute', top:-5, left:'50%', width:10, height:10, borderRadius:'50%', background:C.accent, boxShadow:`0 0 14px ${C.accent}`, transform:'translateX(-50%)', animation:'glowPulse 2.5s ease-in-out infinite' }} />
        </div>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:340, height:340, borderRadius:'50%', border:`1px solid rgba(232,101,26,0.05)`, animation:'spinSlow 30s linear infinite reverse', pointerEvents:'none' }}>
          <div style={{ position:'absolute', bottom:-4, right:'22%', width:8, height:8, borderRadius:'50%', background:C.accent, opacity:0.6 }} />
        </div>

        <div style={{ position:'relative', maxWidth:680, margin:'0 auto', textAlign:'center' }}>
          <h2 style={{ fontSize:'clamp(44px, 7vw, 80px)', fontWeight:800, letterSpacing:'-0.045em', lineHeight:1.0, marginBottom:26, color:C.text1 }}>
            Your brain<br />
            <span style={{ fontFamily:"'Instrument Serif', serif", fontStyle:'italic', color:C.accent }}>deserves better.</span>
          </h2>
          <p style={{ fontSize:18, color:C.text2, marginBottom:46, lineHeight:1.68 }}>
            Join thousands already using Nuro to reclaim their attention, connect more authentically, and live a less stimulated life.
          </p>
          <Link href="/" style={{
            display:'inline-block', fontSize:17, fontWeight:700,
            padding:'17px 50px', borderRadius:980,
            background:C.accent, color:'white', textDecoration:'none',
            boxShadow:`0 8px 44px ${C.accentGlow}`,
          }}>
            Start for free — no card needed
          </Link>
          <p style={{ fontSize:13, color:C.text3, marginTop:22 }}>
            Available on iOS, Android &amp; Web · End-to-end encrypted
          </p>
          {/* Cal credit */}
          <div style={{ marginTop:36, display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontSize:13, color:C.text3 }}>
            <span>Built by</span>
            <CalBadge small />
            <span>students</span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          FOOTER
      ══════════════════════════════ */}
      <footer style={{ padding:'32px 48px', background:C.surface, display:'flex', justifyContent:'space-between', alignItems:'center', position:'relative', zIndex:1 }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <NuroWordmark size={28} />
          <CalBadge small />
        </div>
        <span style={{ fontSize:13, color:C.text3 }}>© 2026 Nuro · Built to fight brain rot.</span>
        <div style={{ display:'flex', gap:24 }}>
          {['Privacy','Terms','Blog'].map(l=>(
            <a key={l} href="#" style={{ fontSize:13, color:C.text3, textDecoration:'none' }}>{l}</a>
          ))}
        </div>
      </footer>

    </div>
  )
}
