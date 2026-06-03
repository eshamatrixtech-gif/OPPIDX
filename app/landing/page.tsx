'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

/* ─── SVG Logo ───────────────────────────────────────────────────── */
function NuroIcon({ size = 36 }: { size?: number }) {
  const id = `ng-${size}`
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="12" fill={`url(#${id})`} />
      {/* Neural triangle — 3 nodes connected */}
      <line x1="11" y1="27" x2="20" y2="11" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeOpacity="0.55" />
      <line x1="20" y1="11" x2="29" y2="27" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeOpacity="0.55" />
      <line x1="11" y1="27" x2="29" y2="27" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeOpacity="0.35" />
      {/* Extra synapse line — the "N" diagonal */}
      <line x1="20" y1="11" x2="20" y2="27" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.3" />
      {/* Nodes */}
      <circle cx="20" cy="11" r="3.5" fill="white" />
      <circle cx="11" cy="27" r="3" fill="white" fillOpacity="0.9" />
      <circle cx="29" cy="27" r="3" fill="white" fillOpacity="0.9" />
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="40" y2="40">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#e879f9" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function NuroWordmark({ size = 36 }: { size?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <NuroIcon size={size} />
      <span style={{ fontSize: size * 0.47, fontWeight: 800, letterSpacing: '-0.025em', color: '#f5f0ff', fontFamily: "'DM Sans', sans-serif" }}>
        Nuro
      </span>
    </div>
  )
}

/* ─── Floating animated bubble ───────────────────────────────────── */
function FloatingBubble({ text, x, delay, duration, color }: {
  text: string; x: string; delay: number; duration: number; color: string
}) {
  return (
    <div style={{
      position: 'absolute',
      left: x,
      bottom: '-60px',
      padding: '8px 14px',
      borderRadius: 980,
      background: `${color}14`,
      border: `1px solid ${color}30`,
      fontSize: 12,
      fontWeight: 500,
      color: color,
      whiteSpace: 'nowrap',
      animation: `floatUp ${duration}s ease-in ${delay}s infinite`,
      pointerEvents: 'none',
      backdropFilter: 'blur(8px)',
    }}>
      {text}
    </div>
  )
}

/* ─── Platform pill ──────────────────────────────────────────────── */
function PlatformPill({ name, icon, color }: { name: string; icon: string; color: string }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      padding: '8px 16px', borderRadius: 980,
      background: `${color}10`, border: `1px solid ${color}25`,
      fontSize: 13, fontWeight: 500, color,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      {name}
    </div>
  )
}

/* ─── Feature card ───────────────────────────────────────────────── */
function FeatureCard({ icon, title, desc, iconBg, delay }: {
  icon: string; title: string; desc: string; iconBg: string; delay: number
}) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '28px 24px', borderRadius: 20,
        background: hov ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${hov ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.07)'}`,
        transition: 'all 0.22s ease',
        transform: hov ? 'translateY(-5px)' : 'none',
        cursor: 'default',
        opacity: 0, animation: `fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}s forwards`,
      }}
    >
      <div style={{
        width: 52, height: 52, borderRadius: 16,
        background: iconBg, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 24, marginBottom: 18,
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 9, letterSpacing: '-0.02em', color: '#f5f0ff' }}>{title}</h3>
      <p style={{ fontSize: 14, color: 'rgba(245,240,255,0.48)', lineHeight: 1.65, margin: 0 }}>{desc}</p>
    </div>
  )
}

/* ─── Testimonial ────────────────────────────────────────────────── */
function Testimonial({ quote, name, role, initial, color }: {
  quote: string; name: string; role: string; initial: string; color: string
}) {
  return (
    <div style={{
      padding: '28px', borderRadius: 20,
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.07)',
    }}>
      <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>
        {[...Array(5)].map((_, i) => <span key={i} style={{ color: '#f97316', fontSize: 13 }}>★</span>)}
      </div>
      <p style={{ fontSize: 15, color: 'rgba(245,240,255,0.72)', lineHeight: 1.72, marginBottom: 20, fontStyle: 'italic' }}>
        &ldquo;{quote}&rdquo;
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: `linear-gradient(135deg, ${color}, ${color}99)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, fontWeight: 700, color: 'white', flexShrink: 0,
        }}>{initial}</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#f5f0ff' }}>{name}</div>
          <div style={{ fontSize: 12, color: 'rgba(245,240,255,0.38)' }}>{role}</div>
        </div>
      </div>
    </div>
  )
}

/* ─── Price card ─────────────────────────────────────────────────── */
function PriceCard({ name, price, period, features, highlight, cta }: {
  name: string; price: string; period: string; features: string[];
  highlight?: boolean; cta: string
}) {
  return (
    <div style={{
      padding: '32px 28px', borderRadius: 24, flex: 1, position: 'relative',
      background: highlight
        ? 'linear-gradient(145deg, rgba(249,115,22,0.12), rgba(232,121,249,0.08))'
        : 'rgba(255,255,255,0.04)',
      border: highlight ? '1px solid rgba(249,115,22,0.35)' : '1px solid rgba(255,255,255,0.07)',
    }}>
      {highlight && (
        <div style={{
          position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
          background: 'linear-gradient(90deg, #f97316, #e879f9)',
          color: 'white', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase', padding: '4px 18px', borderRadius: 980, whiteSpace: 'nowrap',
        }}>Most Popular</div>
      )}
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(245,240,255,0.4)', marginBottom: 8 }}>{name}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 4 }}>
        <span style={{ fontSize: 46, fontWeight: 800, letterSpacing: '-0.045em', color: '#f5f0ff' }}>{price}</span>
        <span style={{ fontSize: 15, color: 'rgba(245,240,255,0.38)' }}>{period}</span>
      </div>
      <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '24px 0' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 13, marginBottom: 28 }}>
        {features.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ color: '#34d399', fontSize: 13, marginTop: 1, flexShrink: 0 }}>✓</span>
            <span style={{ fontSize: 14, color: 'rgba(245,240,255,0.62)' }}>{f}</span>
          </div>
        ))}
      </div>
      <Link href="/" style={{
        display: 'block', textAlign: 'center', padding: '14px',
        borderRadius: 14, textDecoration: 'none', fontWeight: 600, fontSize: 15,
        background: highlight ? 'linear-gradient(135deg, #f97316, #e879f9)' : 'rgba(255,255,255,0.08)',
        color: highlight ? 'white' : 'rgba(245,240,255,0.65)',
        boxShadow: highlight ? '0 8px 32px rgba(249,115,22,0.28)' : 'none',
      }}>{cta}</Link>
    </div>
  )
}

/* ─── Stat card ──────────────────────────────────────────────────── */
function StatCard({ value, label, icon }: { value: string; label: string; icon: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '20px 16px' }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div style={{
        fontSize: 40, fontWeight: 800, letterSpacing: '-0.04em',
        fontFamily: "'Instrument Serif', Georgia, serif",
        background: 'linear-gradient(135deg, #f97316, #e879f9)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        marginBottom: 6,
      }}>{value}</div>
      <div style={{ fontSize: 13, color: 'rgba(245,240,255,0.42)', lineHeight: 1.4 }}>{label}</div>
    </div>
  )
}

/* ─── Scrolling ticker ───────────────────────────────────────────── */
function Ticker() {
  const items = [
    '🧠 Brain Health Score', '💬 Unified Inbox', '📸 Dual-Camera Instants',
    '⚡ Real-time AI', '🔒 End-to-end Encrypted', '📊 Feed Intelligence',
    '🤖 AI Reply Assist', '⏱️ Anti-Addiction Mode', '🌱 Live Authentically',
    '🧠 Brain Health Score', '💬 Unified Inbox', '📸 Dual-Camera Instants',
  ]
  return (
    <div style={{ overflow: 'hidden', padding: '18px 0', position: 'relative' }}>
      <div style={{ display: 'flex', gap: 40, animation: 'ticker 28s linear infinite', width: 'max-content' }}>
        {items.map((item, i) => (
          <span key={i} style={{ fontSize: 14, fontWeight: 500, color: 'rgba(245,240,255,0.35)', whiteSpace: 'nowrap' }}>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ─── Main ───────────────────────────────────────────────────────── */
export default function Landing() {
  const heroRef = useRef<HTMLDivElement>(null)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 25
      const y = (e.clientY / window.innerHeight - 0.5) * 25
      el.style.transform = `translate(${x}px, ${y}px)`
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  const navBg = Math.min(scrollY / 80, 1)

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: '#070510', color: '#f5f0ff', overflowX: 'hidden' }}>

      {/* ── Keyframes injected via style tag ── */}
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0) scale(1);   opacity: 0; }
          8%   { opacity: 1; }
          85%  { opacity: 0.7; }
          100% { transform: translateY(-520px) scale(0.85); opacity: 0; }
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.06); }
        }
        @keyframes floatY {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-12px); }
        }
      `}</style>

      {/* ── Ambient background orbs (fixed, behind everything) ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '5%', left: '5%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)', animation: 'pulse 8s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: '15%', right: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,121,249,0.09) 0%, transparent 70%)', animation: 'pulse 11s ease-in-out 2s infinite' }} />
        <div style={{ position: 'absolute', bottom: '20%', left: '30%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.05) 0%, transparent 70%)', animation: 'pulse 14s ease-in-out 4s infinite' }} />
      </div>

      {/* ── Nav ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 48px', height: 68,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: `rgba(7,5,16,${navBg * 0.92})`,
        backdropFilter: navBg > 0.05 ? 'blur(24px)' : 'none',
        borderBottom: `1px solid rgba(255,255,255,${navBg * 0.07})`,
        transition: 'background 0.3s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <NuroWordmark size={34} />
          {/* Cal badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', borderRadius: 980,
            background: 'rgba(0,50,160,0.18)',
            border: '1px solid rgba(0,80,200,0.3)',
            fontSize: 11, fontWeight: 700,
            color: '#4a90e2',
          }}>
            <span>🐻</span>
            <span style={{ color: '#FDB515', letterSpacing: '0.02em' }}>Cal</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          {['Features', 'How it works', 'Pricing'].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`}
              style={{ fontSize: 14, fontWeight: 500, color: 'rgba(245,240,255,0.5)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#f5f0ff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,240,255,0.5)')}
            >{l}</a>
          ))}
          <Link href="/" style={{
            fontSize: 14, fontWeight: 600, padding: '9px 22px', borderRadius: 980,
            background: 'linear-gradient(135deg, #f97316, #e879f9)',
            color: 'white', textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(249,115,22,0.35)',
          }}>Open App →</Link>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '120px 24px 0', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>

        {/* Parallax depth layer */}
        <div ref={heroRef} style={{ position: 'absolute', inset: 0, transition: 'transform 0.1s ease-out', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '18%', left: '10%', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.16) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', top: '25%', right: '8%',  width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,121,249,0.13) 0%, transparent 70%)' }} />
        </div>

        {/* Floating animated bubbles */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <FloatingBubble text="🧠 94 — Mom · iMessage"    x="8%"  delay={0}   duration={9}  color="#34d399" />
          <FloatingBubble text="⚡ Brain score ↑ 87"       x="22%" delay={3.5} duration={11} color="#f97316" />
          <FloatingBubble text="📸 Priya posted an Instant" x="62%" delay={1.5} duration={10} color="#e879f9" />
          <FloatingBubble text="💬 6 platforms connected"  x="78%" delay={5}   duration={8}  color="#22d3ee" />
          <FloatingBubble text="⚠️ Brain-rot detected"     x="42%" delay={7}   duration={12} color="#ef4444" />
          <FloatingBubble text="✓ Genuine connection"      x="55%" delay={2}   duration={9}  color="#34d399" />
        </div>

        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 820 }}>

          {/* Badge row */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40, opacity: 0, animation: 'fadeUp 0.5s ease 0.1s forwards' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 18px', borderRadius: 980,
              background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)',
              fontSize: 13, fontWeight: 500, color: 'rgba(245,240,255,0.75)',
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399', display: 'inline-block', boxShadow: '0 0 8px #34d399' }} />
              Unified messaging + brain health. One app.
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '6px 14px', borderRadius: 980,
              background: 'rgba(0,50,160,0.15)', border: '1px solid rgba(0,100,220,0.25)',
              fontSize: 13, fontWeight: 600,
            }}>
              <span>🐻</span>
              <span style={{ color: '#4a90e2' }}>Built at </span>
              <span style={{ color: '#FDB515' }}>UC Berkeley</span>
            </div>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(52px, 9vw, 96px)', fontWeight: 800, lineHeight: 1.0,
            letterSpacing: '-0.045em', marginBottom: 32,
            opacity: 0, animation: 'fadeUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.2s forwards',
          }}>
            <span style={{ color: '#f5f0ff' }}>All your messages.</span><br />
            <span style={{
              fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic',
              background: 'linear-gradient(135deg, #f97316 0%, #e879f9 55%, #22d3ee 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Your mind, protected.</span>
          </h1>

          {/* Subhead */}
          <p style={{
            fontSize: 20, lineHeight: 1.65, color: 'rgba(245,240,255,0.5)',
            maxWidth: 560, margin: '0 auto 52px',
            opacity: 0, animation: 'fadeUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.35s forwards',
          }}>
            Nuro unifies every DM you have — WhatsApp, Instagram, Discord, Gmail, Slack — then uses AI to score what&rsquo;s draining your brain and nudges you back to real life.
          </p>

          {/* CTAs */}
          <div style={{
            display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 52,
            opacity: 0, animation: 'fadeUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.5s forwards',
          }}>
            <Link href="/" style={{
              fontSize: 16, fontWeight: 700, padding: '17px 42px', borderRadius: 980,
              background: 'linear-gradient(135deg, #f97316, #e879f9)', color: 'white',
              textDecoration: 'none', boxShadow: '0 8px 40px rgba(249,115,22,0.42)',
              letterSpacing: '-0.01em',
            }}>Start for free</Link>
            <a href="#features" style={{
              fontSize: 16, fontWeight: 600, padding: '17px 42px', borderRadius: 980,
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(245,240,255,0.72)', textDecoration: 'none',
            }}>See how it works</a>
          </div>

          {/* Platform pills */}
          <div style={{
            display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center',
            opacity: 0, animation: 'fadeIn 0.8s ease 0.8s forwards',
          }}>
            <PlatformPill name="WhatsApp"  icon="💬" color="#25d366" />
            <PlatformPill name="Instagram" icon="📸" color="#e1306c" />
            <PlatformPill name="Discord"   icon="🎮" color="#5865f2" />
            <PlatformPill name="Gmail"     icon="✉️" color="#ea4335" />
            <PlatformPill name="Slack"     icon="🔷" color="#ecb22e" />
            <PlatformPill name="iMessage"  icon="💙" color="#30d158" />
          </div>
        </div>

        {/* App preview */}
        <div style={{
          position: 'relative', zIndex: 2, marginTop: 72, width: '100%', maxWidth: 1020,
          opacity: 0, animation: 'fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.65s forwards',
          animation: 'floatY 7s ease-in-out 1.5s infinite, fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.65s forwards',
        }}>
          <div style={{
            borderRadius: 24, overflow: 'hidden',
            background: 'rgba(13,10,31,0.97)',
            border: '1px solid rgba(255,255,255,0.09)',
            boxShadow: '0 40px 120px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}>
            {/* Window chrome */}
            <div style={{ padding: '13px 20px', background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <div style={{ padding: '4px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', fontSize: 12, color: 'rgba(255,255,255,0.28)' }}>
                  nuro.app — Dashboard
                </div>
              </div>
            </div>
            {/* App UI */}
            <div style={{ display: 'flex', height: 400 }}>
              {/* Icon sidebar */}
              <div style={{ width: 60, background: 'rgba(0,0,0,0.25)', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 14, gap: 10 }}>
                <NuroIcon size={32} />
                <div style={{ marginTop: 6 }} />
                {['🧠', '💬', '📸', '📊'].map((ic, i) => (
                  <div key={i} style={{ width: 38, height: 38, borderRadius: 11, background: i === 1 ? 'rgba(249,115,22,0.2)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>{ic}</div>
                ))}
              </div>
              {/* Inbox list */}
              <div style={{ width: 240, borderRight: '1px solid rgba(255,255,255,0.05)', padding: 14, display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Inbox · 8 unread</div>
                {[
                  { n: 'Mom', p: 'iMessage', c: '#30d158', t: 'Coming home?', s: 94, u: 2 },
                  { n: 'Work team', p: 'Slack', c: '#ecb22e', t: 'Standup in 5', s: 71, u: 5 },
                  { n: 'Priya ✨', p: 'Instagram', c: '#e1306c', t: 'omg did u see', s: 61, u: 3 },
                  { n: 'Rahul', p: 'WhatsApp', c: '#25d366', t: 'match last night', s: 88, u: 0 },
                  { n: 'TechDigest', p: 'Gmail', c: '#ea4335', t: 'Weekly digest', s: 45, u: 1 },
                ].map((c, i) => (
                  <div key={i} style={{ padding: '9px 11px', borderRadius: 11, background: i === 0 ? 'rgba(249,115,22,0.1)' : 'transparent', display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: `${c.c}18`, border: `1.5px solid ${c.c}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: c.c, flexShrink: 0 }}>{c.n[0]}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#f5f0ff' }}>{c.n}</span>
                        <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 980, background: c.s >= 80 ? 'rgba(52,211,153,0.15)' : c.s >= 60 ? 'rgba(249,115,22,0.15)' : 'rgba(239,68,68,0.15)', color: c.s >= 80 ? '#34d399' : c.s >= 60 ? '#f97316' : '#ef4444', fontWeight: 700 }}>{c.s}</span>
                      </div>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.32)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{c.t}</span>
                    </div>
                    {c.u > 0 && <span style={{ fontSize: 10, fontWeight: 700, background: '#f97316', color: 'white', borderRadius: 980, padding: '1px 5px', flexShrink: 0 }}>{c.u}</span>}
                  </div>
                ))}
              </div>
              {/* Chat area */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.12)' }}>
                <div style={{ padding: '11px 18px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(48,209,88,0.18)', border: '1.5px solid rgba(48,209,88,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#30d158' }}>M</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#f5f0ff' }}>Mom</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)' }}>via iMessage · Active</div>
                  </div>
                  <div style={{ marginLeft: 'auto', padding: '4px 11px', borderRadius: 980, background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.28)', fontSize: 11, fontWeight: 700, color: '#34d399' }}>🧠 94 score</div>
                </div>
                <div style={{ flex: 1, padding: '18px', display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {[
                    { me: false, t: 'Hey! Are you free this weekend? 🏠' },
                    { me: false, t: 'Miss you so much!' },
                    { me: true,  t: 'Yes!! Arriving Friday evening 🙌' },
                    { me: false, t: "Amazing! I'll make your fav food 💚" },
                  ].map((m, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: m.me ? 'flex-end' : 'flex-start' }}>
                      <div style={{ padding: '8px 13px', maxWidth: '72%', borderRadius: m.me ? '18px 4px 18px 18px' : '4px 18px 18px 18px', background: m.me ? 'linear-gradient(135deg, #f97316, #e879f9)' : 'rgba(255,255,255,0.08)', border: m.me ? 'none' : '1px solid rgba(255,255,255,0.07)', fontSize: 12, color: 'white' }}>{m.t}</div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 8 }}>
                  <div style={{ flex: 1, padding: '8px 12px', borderRadius: 11, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', fontSize: 12, color: 'rgba(255,255,255,0.28)' }}>Reply…</div>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #f97316, #e879f9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>↑</div>
                </div>
              </div>
              {/* Brain panel */}
              <div style={{ width: 200, borderLeft: '1px solid rgba(255,255,255,0.05)', padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Mind Score</div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <svg width="90" height="90" viewBox="0 0 90 90">
                    <circle cx="45" cy="45" r="34" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
                    <circle cx="45" cy="45" r="34" fill="none" stroke="url(#hg)" strokeWidth="6" strokeLinecap="round" strokeDasharray="214" strokeDashoffset="53" transform="rotate(-90 45 45)" />
                    <defs><linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#f97316" /><stop offset="100%" stopColor="#e879f9" /></linearGradient></defs>
                    <text x="45" y="42" textAnchor="middle" fill="#f5f0ff" fontSize="17" fontWeight="700" fontFamily="'DM Sans', sans-serif">74</text>
                    <text x="45" y="56" textAnchor="middle" fill="#f97316" fontSize="9" fontFamily="'DM Sans', sans-serif" fontWeight="600">Good</text>
                  </svg>
                </div>
                {[['Genuine msgs', '72%', '#34d399'], ['Screen time', '3.2h', '#f97316'], ['Brain rot', 'Low', '#22d3ee']].map(([l, v, c], i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)' }}>{l}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: c }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Glow beneath */}
          <div style={{ position: 'absolute', bottom: -50, left: '50%', transform: 'translateX(-50%)', width: '55%', height: 100, background: 'radial-gradient(ellipse, rgba(249,115,22,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        </div>

        {/* Ticker strip at hero bottom */}
        <div style={{ width: '100%', marginTop: 56, position: 'relative', zIndex: 2 }}>
          <Ticker />
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════════ */}
      <section style={{ padding: '20px 48px 40px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          <StatCard value="6+"    label="platforms connected" icon="🔗" />
          <StatCard value="94%"   label="users feel less overwhelmed" icon="😌" />
          <StatCard value="2.1h"  label="daily screen time saved" icon="⏱️" />
          <StatCard value="100%"  label="private · zero data sold" icon="🔒" />
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════════ */}
      <section id="features" style={{ padding: '80px 48px 96px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(245,240,255,0.3)', marginBottom: 16 }}>What makes Nuro different</div>
            <h2 style={{ fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05, color: '#f5f0ff' }}>
              Built for humans,<br />
              <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', background: 'linear-gradient(90deg, #f97316, #e879f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                not engagement metrics.
              </span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            <FeatureCard delay={0.1} icon="💬" title="Unified Inbox"
              iconBg="linear-gradient(135deg, #5865f2, #7c83f5)"
              desc="Every DM from every platform in one gorgeous inbox. WhatsApp, Instagram, Discord, Gmail, Slack, iMessage — finally, together." />
            <FeatureCard delay={0.2} icon="🧠" title="Brain Health Score"
              iconBg="linear-gradient(135deg, #f97316, #e879f9)"
              desc="AI scores every message, post, and feed item for genuine connection vs mental drain. See exactly what's eroding your focus." />
            <FeatureCard delay={0.3} icon="📸" title="Instants"
              iconBg="linear-gradient(135deg, #e879f9, #22d3ee)"
              desc="Dual-camera authentic moments — capture what you're doing and your reaction at the same time. No filters. No curation. Real you." />
            <FeatureCard delay={0.4} icon="📊" title="Feed Intelligence"
              iconBg="linear-gradient(135deg, #22d3ee, #34d399)"
              desc="Your Instagram, YouTube, and Twitter feeds re-ranked by actual brain value. Scroll with intention, not compulsion." />
            <FeatureCard delay={0.5} icon="🤖" title="AI Reply Assist"
              iconBg="linear-gradient(135deg, #34d399, #5865f2)"
              desc="Smart, context-aware reply suggestions that actually sound like you. Less time typing, more time being present." />
            <FeatureCard delay={0.6} icon="⏱️" title="Anti-Addiction Mode"
              iconBg="linear-gradient(135deg, #ef4444, #f97316)"
              desc="Usage nudges, decay scoring, and scheduled Do Not Disturb. Nuro actively fights for your attention so Big Tech can't steal it." />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════ */}
      <section id="how-it-works" style={{ padding: '80px 48px 96px', position: 'relative', zIndex: 1, background: 'rgba(255,255,255,0.018)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(245,240,255,0.3)', marginBottom: 16 }}>How it works</div>
            <h2 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, letterSpacing: '-0.04em', color: '#f5f0ff', lineHeight: 1.05 }}>
              Three steps to a<br />clearer mind.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 60 }}>
            {[
              { n: '01', title: 'Connect everything', desc: 'Link your platforms in one tap. End-to-end encrypted. Your data stays yours — never sold, never shared.', icon: '🔗' },
              { n: '02', title: 'AI scores your world', desc: 'Every message, post, and minute of screen time gets a brain health rating — instantly, privately, on your device.', icon: '🧠' },
              { n: '03', title: 'Reclaim your life', desc: 'Personalized nudges, wellness reports, and authentic Instants replace doom-scrolling with real connection.', icon: '🌱' },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: 76, fontWeight: 800, color: 'rgba(255,255,255,0.04)', letterSpacing: '-0.05em', lineHeight: 1, marginBottom: 10, fontFamily: "'DM Sans', sans-serif" }}>{s.n}</div>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{s.icon}</div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, letterSpacing: '-0.02em', color: '#f5f0ff' }}>{s.title}</h3>
                <p style={{ fontSize: 15, color: 'rgba(245,240,255,0.44)', lineHeight: 1.68 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          INSTANTS FEATURE
      ══════════════════════════════════════════════ */}
      <section style={{ padding: '80px 48px 96px', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,121,249,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(245,240,255,0.3)', marginBottom: 16 }}>Instants</div>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: 24, color: '#f5f0ff' }}>
              Real moments.<br />
              <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#e879f9' }}>Not highlights.</span>
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(245,240,255,0.48)', lineHeight: 1.72, marginBottom: 36 }}>
              Once a day, Nuro sends a random notification. You get 2 minutes to capture what you&rsquo;re genuinely doing — front and back camera simultaneously. Your friends see the real you, not the curated version.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {[
                { icon: '🎲', text: 'Random daily notification — no time to stage anything' },
                { icon: '📱', text: 'Dual camera captures you + your world at the same moment' },
                { icon: '🧠', text: 'AI scores your moment for authenticity vs performance' },
                { icon: '👁️', text: 'Friends only see yours after they post their own Instant' },
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{f.icon}</span>
                  <span style={{ fontSize: 15, color: 'rgba(245,240,255,0.58)', lineHeight: 1.55 }}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Phone mockup */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 260, position: 'relative', animation: 'floatY 7s ease-in-out infinite' }}>
              <div style={{
                borderRadius: 44, background: '#0d0a1f',
                border: '2px solid rgba(255,255,255,0.11)',
                overflow: 'hidden', aspectRatio: '9/19',
                boxShadow: '0 40px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.08)',
                display: 'flex', flexDirection: 'column',
              }}>
                <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px' }}>
                  <div style={{ width: 96, height: 28, borderRadius: 20, background: '#000' }} />
                </div>
                <div style={{ flex: 1, padding: '6px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ textAlign: 'center', padding: '8px 12px', borderRadius: 14, background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.28)' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#f97316', letterSpacing: '0.04em' }}>⚡ YOUR INSTANT IS WAITING</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.38)', marginTop: 2 }}>2:00 left · 12 friends posted</div>
                  </div>
                  <div style={{ flex: 1, borderRadius: 18, overflow: 'hidden', position: 'relative', minHeight: 160, background: 'linear-gradient(145deg, rgba(249,115,22,0.15), rgba(232,121,249,0.1))' }}>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
                      <div style={{ fontSize: 42 }}>🏔️</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>View from my hike</div>
                    </div>
                    <div style={{ position: 'absolute', top: 10, left: 10, width: 58, height: 74, borderRadius: 14, background: 'rgba(89,130,234,0.3)', border: '2px solid rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>😄</div>
                    <div style={{ position: 'absolute', top: 10, right: 10, padding: '3px 9px', borderRadius: 980, background: 'rgba(52,211,153,0.18)', border: '1px solid rgba(52,211,153,0.35)', fontSize: 10, fontWeight: 700, color: '#34d399' }}>🧠 96</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#f5f0ff', fontWeight: 500, marginBottom: 6 }}>first sunrise hike of the year 🌅</div>
                    <div style={{ display: 'flex', gap: 7 }}>
                      {['❤️ 12', '🔥 8', '💚 5'].map((r, i) => (
                        <span key={i} style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.07)', padding: '3px 9px', borderRadius: 980 }}>{r}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ padding: '8px 20px 20px', display: 'flex', justifyContent: 'space-around' }}>
                  {['💬', '📸', '🧠', '👤'].map((ic, i) => (
                    <div key={i} style={{ fontSize: 20, opacity: i === 1 ? 1 : 0.35 }}>{ic}</div>
                  ))}
                </div>
              </div>
              <div style={{ position: 'absolute', inset: -24, background: 'radial-gradient(ellipse, rgba(232,121,249,0.18) 0%, transparent 70%)', zIndex: -1, pointerEvents: 'none' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════ */}
      <section style={{ padding: '80px 48px 96px', background: 'rgba(255,255,255,0.018)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(245,240,255,0.3)', marginBottom: 14 }}>Early users</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#f5f0ff' }}>
              People are getting their minds back.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            <Testimonial
              quote="I didn't realize how much anxiety came from switching between 7 different apps. Nuro changed everything. My focus is genuinely back."
              name="Aanya S." role="Designer, Bangalore" initial="A" color="#f97316"
            />
            <Testimonial
              quote="The brain score feature is addictive in the best way. I started avoiding mindless content because I could literally see it tank my score."
              name="Marcus T." role="Software Engineer, NYC" initial="M" color="#5865f2"
            />
            <Testimonial
              quote="Instants made me actually enjoy sharing again. No pressure to look perfect. My friends love seeing the real me for once."
              name="Priya K." role="Student, Mumbai" initial="P" color="#e879f9"
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          PRICING
      ══════════════════════════════════════════════ */}
      <section id="pricing" style={{ padding: '80px 48px 96px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 68 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(245,240,255,0.3)', marginBottom: 16 }}>Pricing</div>
            <h2 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, letterSpacing: '-0.04em', color: '#f5f0ff', lineHeight: 1.05, marginBottom: 16 }}>Simple, honest pricing.</h2>
            <p style={{ fontSize: 16, color: 'rgba(245,240,255,0.42)' }}>No dark patterns. No selling your data. Cancel any time.</p>
          </div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'stretch' }}>
            <PriceCard name="Free" price="$0" period="/month" cta="Get started"
              features={['Up to 3 platforms', 'Basic brain health score', '5 Instants per month', 'Unified inbox']} />
            <PriceCard name="Pro" price="$12" period="/month" cta="Start Pro free →" highlight
              features={['Unlimited platforms', 'Advanced AI brain scoring', 'Unlimited Instants', 'Feed intelligence ranking', 'AI reply suggestions', 'Weekly wellness reports', 'Anti-addiction nudges']} />
            <PriceCard name="Teams" price="$29" period="/mo per team" cta="Contact us"
              features={['Everything in Pro', 'Team brain health dashboard', 'Slack workspace integration', 'Admin controls', 'Priority support']} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════════ */}
      <section style={{ padding: '96px 48px', position: 'relative', zIndex: 1, overflow: 'hidden', background: 'rgba(255,255,255,0.018)' }}>
        {/* Glow center */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 400, background: 'radial-gradient(ellipse, rgba(249,115,22,0.12) 0%, rgba(232,121,249,0.07) 50%, transparent 70%)', pointerEvents: 'none' }} />
        {/* Rotating ring decoration */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 500, borderRadius: '50%', border: '1px solid rgba(249,115,22,0.08)', animation: 'spinSlow 40s linear infinite', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: -6, left: '50%', width: 12, height: 12, borderRadius: '50%', background: '#f97316', boxShadow: '0 0 16px #f97316', transform: 'translateX(-50%)' }} />
        </div>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 380, height: 380, borderRadius: '50%', border: '1px solid rgba(232,121,249,0.07)', animation: 'spinSlow 28s linear infinite reverse', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', bottom: -5, right: '20%', width: 10, height: 10, borderRadius: '50%', background: '#e879f9', boxShadow: '0 0 12px #e879f9' }} />
        </div>

        <div style={{ position: 'relative', maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(44px, 7vw, 82px)', fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1.0, marginBottom: 28 }}>
            <span style={{ color: '#f5f0ff' }}>Your brain</span><br />
            <span style={{
              fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
              background: 'linear-gradient(135deg, #f97316, #e879f9, #22d3ee)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>deserves better.</span>
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(245,240,255,0.42)', marginBottom: 48, lineHeight: 1.68 }}>
            Join thousands already using Nuro to reclaim their attention, connect more authentically, and live a less stimulated life.
          </p>
          <Link href="/" style={{
            display: 'inline-block', fontSize: 17, fontWeight: 700,
            padding: '18px 52px', borderRadius: 980,
            background: 'linear-gradient(135deg, #f97316, #e879f9)',
            color: 'white', textDecoration: 'none',
            boxShadow: '0 8px 48px rgba(249,115,22,0.42)',
          }}>
            Start for free — no card needed
          </Link>
          <p style={{ fontSize: 13, color: 'rgba(245,240,255,0.22)', marginTop: 24 }}>
            Available on iOS, Android &amp; Web · End-to-end encrypted
          </p>

          {/* Cal credit line */}
          <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, color: 'rgba(245,240,255,0.3)' }}>
            <span>Built with 🧠 by a</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
              <span>🐻</span>
              <span style={{ color: '#4a90e2' }}>Cal</span>
              <span style={{ color: '#FDB515' }}>Berkeley</span>
            </span>
            <span>student</span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════ */}
      <footer style={{ padding: '36px 48px', background: '#040310', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <NuroWordmark size={30} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 980, background: 'rgba(0,50,160,0.15)', border: '1px solid rgba(0,80,200,0.2)', fontSize: 11, fontWeight: 600 }}>
            <span>🐻</span><span style={{ color: '#4a90e2' }}>Cal</span><span style={{ color: '#FDB515' }}>Berkeley</span>
          </div>
        </div>
        <span style={{ fontSize: 13, color: 'rgba(245,240,255,0.25)' }}>© 2026 Nuro · Built to fight brain rot.</span>
        <div style={{ display: 'flex', gap: 28 }}>
          {['Privacy', 'Terms', 'Blog'].map(l => (
            <a key={l} href="#" style={{ fontSize: 13, color: 'rgba(245,240,255,0.3)', textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  )
}
