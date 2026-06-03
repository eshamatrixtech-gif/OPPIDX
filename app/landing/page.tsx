'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

/* ─── Floating orb component ─────────────────────────────────────── */
function Orb({ x, y, size, color, delay = 0 }: {
  x: string; y: string; size: number; color: string; delay?: number
}) {
  return (
    <div style={{
      position: 'absolute',
      left: x, top: y,
      width: size, height: size,
      borderRadius: '50%',
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      filter: 'blur(1px)',
      opacity: 0,
      animation: `fadeIn 1.5s ease ${delay}s forwards`,
      pointerEvents: 'none',
    }} />
  )
}

/* ─── Platform pill ──────────────────────────────────────────────── */
function PlatformPill({ name, icon, color }: { name: string; icon: string; color: string }) {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 14px',
      borderRadius: 980,
      background: `${color}12`,
      border: `1px solid ${color}30`,
      fontSize: 13,
      fontWeight: 500,
      color: color,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ fontSize: 15 }}>{icon}</span>
      {name}
    </div>
  )
}

/* ─── Feature card ───────────────────────────────────────────────── */
function FeatureCard({ icon, title, desc, gradient, delay }: {
  icon: string; title: string; desc: string; gradient: string; delay: number
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '28px 24px',
        borderRadius: 20,
        background: hovered ? 'rgba(255,255,255,0.065)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.08)'}`,
        transition: 'all 0.25s ease',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        cursor: 'default',
        opacity: 0,
        animation: `fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}s forwards`,
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: gradient,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, marginBottom: 18,
        boxShadow: `0 8px 24px ${gradient.includes('249') ? 'rgba(249,115,22,0.3)' : 'rgba(232,121,249,0.3)'}`,
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.02em', color: '#f5f0ff' }}>
        {title}
      </h3>
      <p style={{ fontSize: 14, color: 'rgba(245,240,255,0.5)', lineHeight: 1.65, margin: 0 }}>
        {desc}
      </p>
    </div>
  )
}

/* ─── Stat card ──────────────────────────────────────────────────── */
function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontSize: 42, fontWeight: 800, letterSpacing: '-0.04em',
        fontFamily: "'Instrument Serif', Georgia, serif",
        background: 'linear-gradient(135deg, #f97316, #e879f9)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        {value}
      </div>
      <div style={{ fontSize: 14, color: 'rgba(245,240,255,0.45)', marginTop: 4 }}>{label}</div>
    </div>
  )
}

/* ─── Testimonial card ───────────────────────────────────────────── */
function Testimonial({ quote, name, role, avatar }: {
  quote: string; name: string; role: string; avatar: string
}) {
  return (
    <div style={{
      padding: '28px',
      borderRadius: 20,
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
    }}>
      <p style={{ fontSize: 15, color: 'rgba(245,240,255,0.75)', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>
        &ldquo;{quote}&rdquo;
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'linear-gradient(135deg, #f97316, #e879f9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 700, color: 'white', flexShrink: 0,
        }}>
          {avatar}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#f5f0ff' }}>{name}</div>
          <div style={{ fontSize: 12, color: 'rgba(245,240,255,0.4)' }}>{role}</div>
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
      padding: '32px 28px',
      borderRadius: 24,
      background: highlight
        ? 'linear-gradient(145deg, rgba(249,115,22,0.15), rgba(232,121,249,0.1))'
        : 'rgba(255,255,255,0.04)',
      border: highlight ? '1px solid rgba(249,115,22,0.4)' : '1px solid rgba(255,255,255,0.08)',
      position: 'relative',
      flex: 1,
    }}>
      {highlight && (
        <div style={{
          position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
          background: 'linear-gradient(90deg, #f97316, #e879f9)',
          color: 'white', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase', padding: '4px 16px', borderRadius: 980,
          whiteSpace: 'nowrap',
        }}>
          Most Popular
        </div>
      )}
      <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 600, color: 'rgba(245,240,255,0.5)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        {name}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
        <span style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-0.04em', color: '#f5f0ff' }}>{price}</span>
        <span style={{ fontSize: 15, color: 'rgba(245,240,255,0.4)' }}>{period}</span>
      </div>
      <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '24px 0' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
        {features.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: '#34d399', fontSize: 14 }}>✓</span>
            <span style={{ fontSize: 14, color: 'rgba(245,240,255,0.65)' }}>{f}</span>
          </div>
        ))}
      </div>
      <Link href="/" style={{
        display: 'block', textAlign: 'center',
        padding: '14px',
        borderRadius: 14,
        background: highlight
          ? 'linear-gradient(135deg, #f97316, #e879f9)'
          : 'rgba(255,255,255,0.08)',
        color: highlight ? 'white' : 'rgba(245,240,255,0.7)',
        fontWeight: 600, fontSize: 15,
        textDecoration: 'none',
        transition: 'opacity 0.2s',
        boxShadow: highlight ? '0 8px 32px rgba(249,115,22,0.3)' : 'none',
      }}>
        {cta}
      </Link>
    </div>
  )
}

/* ─── Main Landing Page ──────────────────────────────────────────── */
export default function Landing() {
  const heroParallaxRef = useRef<HTMLDivElement>(null)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const el = heroParallaxRef.current
    if (!el) return
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30
      const y = (e.clientY / window.innerHeight - 0.5) * 30
      el.style.transform = `translate(${x}px, ${y}px)`
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  const navOpacity = Math.min(1, scrollY / 80)

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: '#070510', color: '#f5f0ff', overflowX: 'hidden' }}>

      {/* ── Ambient background ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <Orb x="10%" y="15%" size={600} color="rgba(249,115,22,0.12)" delay={0} />
        <Orb x="65%" y="5%"  size={500} color="rgba(232,121,249,0.1)"  delay={0.3} />
        <Orb x="40%" y="60%" size={800} color="rgba(34,211,238,0.06)"  delay={0.6} />
        <Orb x="80%" y="70%" size={400} color="rgba(249,115,22,0.08)"  delay={0.9} />
      </div>

      {/* ── Navigation ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 48px', height: 68,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: `rgba(7,5,16,${navOpacity * 0.9})`,
        backdropFilter: navOpacity > 0.1 ? 'blur(20px)' : 'none',
        borderBottom: `1px solid rgba(255,255,255,${navOpacity * 0.08})`,
        transition: 'background 0.3s, border-color 0.3s',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg, #f97316, #e879f9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
            boxShadow: '0 4px 16px rgba(249,115,22,0.4)',
          }}>
            🧠
          </div>
          <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', color: '#f5f0ff' }}>
            Nuro
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          {['Features', 'How it works', 'Pricing'].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`} style={{
              fontSize: 14, color: 'rgba(245,240,255,0.55)',
              textDecoration: 'none', fontWeight: 500,
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = '#f5f0ff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,240,255,0.55)')}
            >
              {l}
            </a>
          ))}
          <Link href="/" style={{
            fontSize: 14, fontWeight: 600,
            padding: '9px 22px', borderRadius: 980,
            background: 'linear-gradient(135deg, #f97316, #e879f9)',
            color: 'white', textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(249,115,22,0.35)',
          }}>
            Open App →
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '120px 24px 80px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Parallax orbs layer */}
        <div ref={heroParallaxRef} style={{ position: 'absolute', inset: 0, transition: 'transform 0.12s ease-out', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '20%', left: '8%', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', top: '30%', right: '10%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,121,249,0.12) 0%, transparent 70%)' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 820 }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 18px', borderRadius: 980, marginBottom: 40,
            background: 'rgba(249,115,22,0.1)',
            border: '1px solid rgba(249,115,22,0.3)',
            fontSize: 13, fontWeight: 500,
            color: 'rgba(245,240,255,0.75)',
            opacity: 0, animation: 'fadeUp 0.5s ease 0.1s forwards',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399', display: 'inline-block', boxShadow: '0 0 8px #34d399' }} />
            Unified messaging + brain health. One app.
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(52px, 9vw, 96px)',
            fontWeight: 800, lineHeight: 1.0,
            letterSpacing: '-0.045em',
            marginBottom: 32,
            opacity: 0, animation: 'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s forwards',
          }}>
            <span style={{ color: '#f5f0ff' }}>All your messages.</span>
            <br />
            <span style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontStyle: 'italic',
              background: 'linear-gradient(135deg, #f97316 0%, #e879f9 50%, #22d3ee 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Your mind, protected.
            </span>
          </h1>

          {/* Subhead */}
          <p style={{
            fontSize: 20, lineHeight: 1.65,
            color: 'rgba(245,240,255,0.5)',
            maxWidth: 560, margin: '0 auto 56px',
            opacity: 0, animation: 'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.35s forwards',
          }}>
            Nuro unifies WhatsApp, Instagram, Discord, Gmail and every DM you have — then uses AI to score what&rsquo;s draining your brain and nudges you back to real life.
          </p>

          {/* CTAs */}
          <div style={{
            display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap',
            marginBottom: 72,
            opacity: 0, animation: 'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.5s forwards',
          }}>
            <Link href="/" style={{
              fontSize: 16, fontWeight: 700,
              padding: '17px 40px', borderRadius: 980,
              background: 'linear-gradient(135deg, #f97316, #e879f9)',
              color: 'white', textDecoration: 'none',
              boxShadow: '0 8px 40px rgba(249,115,22,0.4)',
              letterSpacing: '-0.01em',
            }}>
              Start for free
            </Link>
            <a href="#features" style={{
              fontSize: 16, fontWeight: 600,
              padding: '17px 40px', borderRadius: 980,
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(245,240,255,0.75)', textDecoration: 'none',
              letterSpacing: '-0.01em',
            }}>
              See how it works
            </a>
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

        {/* Hero app preview */}
        <div style={{
          position: 'relative', zIndex: 1,
          marginTop: 80, width: '100%', maxWidth: 1020,
          opacity: 0, animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.6s forwards',
        }}>
          <div style={{
            borderRadius: 24,
            background: 'rgba(13,10,31,0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.1)',
            overflow: 'hidden',
          }}>
            {/* Window chrome */}
            <div style={{ padding: '14px 20px', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <div style={{
                  padding: '4px 16px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.05)',
                  fontSize: 12, color: 'rgba(255,255,255,0.3)',
                }}>
                  nuro.app — Unified Inbox
                </div>
              </div>
            </div>

            {/* App content */}
            <div style={{ display: 'flex', height: 420 }}>
              {/* Left sidebar */}
              <div style={{ width: 64, background: 'rgba(0,0,0,0.2)', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 16, gap: 12 }}>
                {['🧠', '💬', '✨', '📊', '⚙️'].map((icon, i) => (
                  <div key={i} style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: i === 0 ? 'linear-gradient(135deg, rgba(249,115,22,0.3), rgba(232,121,249,0.3))' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, cursor: 'pointer',
                    border: i === 0 ? '1px solid rgba(249,115,22,0.4)' : '1px solid transparent',
                  }}>
                    {icon}
                  </div>
                ))}
              </div>

              {/* Inbox list */}
              <div style={{ width: 260, borderRight: '1px solid rgba(255,255,255,0.06)', padding: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Inbox · 8 unread</div>
                {[
                  { name: 'Mom', platform: 'iMessage', color: '#30d158', preview: 'Are you coming home?', score: 94, unread: 2 },
                  { name: 'Work team', platform: 'Slack', color: '#ecb22e', preview: 'Standup in 5 mins', score: 72, unread: 5 },
                  { name: 'Priya ✨', platform: 'Instagram', color: '#e1306c', preview: 'omg did you see this 😭', score: 61, unread: 3 },
                  { name: 'Rahul', platform: 'WhatsApp', color: '#25d366', preview: 'bro the match last night', score: 88, unread: 0 },
                  { name: 'TechNews', platform: 'Gmail', color: '#ea4335', preview: 'Your weekly digest', score: 45, unread: 1 },
                ].map((c, i) => (
                  <div key={i} style={{
                    padding: '10px 12px', borderRadius: 12,
                    background: i === 0 ? 'rgba(255,255,255,0.07)' : 'transparent',
                    display: 'flex', alignItems: 'center', gap: 10,
                    cursor: 'pointer',
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: `${c.color}20`,
                      border: `1.5px solid ${c.color}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, color: c.color, flexShrink: 0,
                    }}>
                      {c.name[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#f5f0ff' }}>{c.name}</span>
                        <span style={{
                          fontSize: 10, padding: '1px 6px', borderRadius: 980,
                          background: c.score >= 80 ? 'rgba(52,211,153,0.15)' : c.score >= 60 ? 'rgba(249,115,22,0.15)' : 'rgba(239,68,68,0.15)',
                          color: c.score >= 80 ? '#34d399' : c.score >= 60 ? '#f97316' : '#ef4444',
                          fontWeight: 700,
                        }}>
                          {c.score}
                        </span>
                      </div>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{c.preview}</span>
                    </div>
                    {c.unread > 0 && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, minWidth: 18, height: 18,
                        background: '#f97316', color: 'white', borderRadius: 980,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
                      }}>
                        {c.unread}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Chat view */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.1)' }}>
                {/* Chat header */}
                <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(48,209,88,0.2)', border: '1.5px solid rgba(48,209,88,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#30d158' }}>M</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#f5f0ff' }}>Mom</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>via iMessage · Active now</div>
                  </div>
                  <div style={{ marginLeft: 'auto', padding: '5px 12px', borderRadius: 980, background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', fontSize: 11, fontWeight: 700, color: '#34d399' }}>
                    🧠 94 mind score
                  </div>
                </div>
                {/* Messages */}
                <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>
                  {[
                    { from: 'them', text: 'Hey! Are you free this weekend?' },
                    { from: 'them', text: 'Are you coming home? 🏠 Miss you' },
                    { from: 'me', text: 'Yes! Arriving Friday evening 🙌' },
                    { from: 'them', text: "Amazing! I'll make your favourite food 💚" },
                  ].map((m, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: m.from === 'me' ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        padding: '9px 14px', maxWidth: '70%',
                        borderRadius: m.from === 'me' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        background: m.from === 'me' ? 'linear-gradient(135deg, #f97316, #e879f9)' : 'rgba(255,255,255,0.08)',
                        border: m.from === 'me' ? 'none' : '1px solid rgba(255,255,255,0.07)',
                        fontSize: 13, color: 'white',
                      }}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Input */}
                <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ flex: 1, padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
                    Reply…
                  </div>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #f97316, #e879f9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                    ↑
                  </div>
                </div>
              </div>

              {/* Right panel: Brain Score */}
              <div style={{ width: 220, borderLeft: '1px solid rgba(255,255,255,0.06)', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Brain Health</div>
                {/* Score ring */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <svg width="100" height="100" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                    <circle cx="50" cy="50" r="38" fill="none"
                      stroke="url(#grad1)" strokeWidth="6" strokeLinecap="round"
                      strokeDasharray="239" strokeDashoffset="60"
                      transform="rotate(-90 50 50)"
                    />
                    <defs>
                      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#e879f9" />
                      </linearGradient>
                    </defs>
                    <text x="50" y="50" textAnchor="middle" dominantBaseline="central" fill="#f5f0ff" fontSize="18" fontWeight="700">74</text>
                  </svg>
                  <div style={{ fontSize: 12, color: '#f97316', fontWeight: 600 }}>Good</div>
                </div>
                {/* Mini stats */}
                {[
                  { label: 'Genuine msgs', val: '72%', color: '#34d399' },
                  { label: 'Screen time', val: '3.2h', color: '#f97316' },
                  { label: 'Brain rot risk', val: 'Low', color: '#22d3ee' },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{s.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Glow below preview */}
          <div style={{ position: 'absolute', bottom: -60, left: '50%', transform: 'translateX(-50%)', width: '60%', height: 120, background: 'radial-gradient(ellipse, rgba(249,115,22,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section style={{ padding: '60px 48px', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40 }}>
          <StatCard value="6+" label="platforms connected" />
          <StatCard value="94%" label="users feel less overwhelmed" />
          <StatCard value="2.1h" label="average daily screen time saved" />
          <StatCard value="4.9★" label="app store rating" />
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ padding: '120px 48px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(245,240,255,0.35)', marginBottom: 16 }}>
              What makes Nuro different
            </div>
            <h2 style={{
              fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 800, letterSpacing: '-0.04em',
              lineHeight: 1.05, color: '#f5f0ff',
            }}>
              Built for humans,<br />
              <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', background: 'linear-gradient(90deg, #f97316, #e879f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                not engagement metrics.
              </span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            <FeatureCard icon="💬" title="Unified Inbox" delay={0.1}
              gradient="linear-gradient(135deg, rgba(89,130,234,0.8), rgba(88,101,242,0.8))"
              desc="Every DM from every platform in one gorgeous inbox. WhatsApp, Instagram, Discord, Gmail, Slack, iMessage — all together, finally." />
            <FeatureCard icon="🧠" title="Brain Health Score" delay={0.2}
              gradient="linear-gradient(135deg, rgba(249,115,22,0.9), rgba(232,121,249,0.8))"
              desc="AI scores every message, post, and feed item for genuine connection vs brain rot. See exactly what's draining your focus in real time." />
            <FeatureCard icon="📸" title="Instants (BeReal-style)" delay={0.3}
              gradient="linear-gradient(135deg, rgba(232,121,249,0.8), rgba(34,211,238,0.6))"
              desc="Dual-camera authentic moments. Capture what you're doing and your reaction — no filters, no curation. Real life, shared honestly." />
            <FeatureCard icon="📊" title="Feed Intelligence" delay={0.4}
              gradient="linear-gradient(135deg, rgba(34,211,238,0.7), rgba(52,211,153,0.7))"
              desc="Your Instagram, YouTube, and Twitter feeds ranked by brain value. Scroll with intention. Know which content builds you up vs tears you down." />
            <FeatureCard icon="🤖" title="AI Reply Assist" delay={0.5}
              gradient="linear-gradient(135deg, rgba(52,211,153,0.8), rgba(89,130,234,0.7))"
              desc="Smart, context-aware reply suggestions that actually sound like you. Spend less time typing, more time living." />
            <FeatureCard icon="⏱️" title="Anti-Addiction Mode" delay={0.6}
              gradient="linear-gradient(135deg, rgba(239,68,68,0.8), rgba(249,115,22,0.8))"
              desc="Usage nudges, decay scores, and scheduled Do Not Disturb. Nuro actively fights for your attention so Big Tech can't." />
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" style={{ padding: '120px 48px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(245,240,255,0.35)', marginBottom: 16 }}>
              How it works
            </div>
            <h2 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, letterSpacing: '-0.04em', color: '#f5f0ff', lineHeight: 1.05 }}>
              Three steps to a<br />clearer mind.
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 60 }}>
            {[
              { n: '01', title: 'Connect everything', desc: 'Link your platforms in one tap. Your data stays private — end-to-end encrypted, never sold.', icon: '🔗' },
              { n: '02', title: 'AI scores your world', desc: 'Every message, post, and minute of screen time gets a brain health rating. Instantly, privately.', icon: '🧠' },
              { n: '03', title: 'Reclaim your life', desc: 'Personalized nudges, wellness reports, and authentic moments replace doom-scrolling with real connection.', icon: '🌱' },
            ].map((s, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <div style={{ fontSize: 80, fontWeight: 800, color: 'rgba(255,255,255,0.04)', letterSpacing: '-0.05em', lineHeight: 1, marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>
                  {s.n}
                </div>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{s.icon}</div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, letterSpacing: '-0.02em', color: '#f5f0ff' }}>{s.title}</h3>
                <p style={{ fontSize: 15, color: 'rgba(245,240,255,0.45)', lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Instants / BeReal section ── */}
      <section style={{ padding: '120px 48px', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,121,249,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(245,240,255,0.35)', marginBottom: 16 }}>
              Instants
            </div>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: 24, color: '#f5f0ff' }}>
              Real moments.<br />
              <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#e879f9' }}>Not highlights.</span>
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(245,240,255,0.5)', lineHeight: 1.7, marginBottom: 32 }}>
              Like BeReal, but woven into your social life. Get a random notification once a day — and capture what you&rsquo;re genuinely doing, front and back camera simultaneously. Your friends see the real you.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { icon: '🎲', text: 'Random daily notification — no time to pose' },
                { icon: '📱', text: 'Dual camera captures you + your view simultaneously' },
                { icon: '🧠', text: 'AI scores your moment for genuine vs performative' },
                { icon: '👁️', text: 'Friends can only see yours after they post theirs' },
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{f.icon}</span>
                  <span style={{ fontSize: 15, color: 'rgba(245,240,255,0.6)', lineHeight: 1.5 }}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Phone mockup */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 280, position: 'relative' }} className="float">
              {/* Phone shell */}
              <div style={{
                borderRadius: 44,
                background: '#0d0a1f',
                border: '2px solid rgba(255,255,255,0.12)',
                overflow: 'hidden',
                boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.08)',
                aspectRatio: '9/19',
                display: 'flex', flexDirection: 'column',
              }}>
                {/* Notch */}
                <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px' }}>
                  <div style={{ width: 100, height: 28, borderRadius: 20, background: '#000' }} />
                </div>
                {/* Content */}
                <div style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {/* Notification badge */}
                  <div style={{ textAlign: 'center', padding: '8px 12px', borderRadius: 14, background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#f97316', letterSpacing: '0.04em' }}>⚡ TIME TO POST YOUR INSTANT</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>You have 2 mins · 12 friends waiting</div>
                  </div>
                  {/* Main photo (back camera) */}
                  <div style={{ flex: 1, borderRadius: 18, background: 'linear-gradient(145deg, #1a1040, #0d0a2e)', overflow: 'hidden', position: 'relative', minHeight: 160 }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(145deg, rgba(249,115,22,0.15), rgba(232,121,249,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
                      <div style={{ fontSize: 36 }}>🏔️</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>View from my hike</div>
                    </div>
                    {/* Selfie inset */}
                    <div style={{ position: 'absolute', top: 10, left: 10, width: 64, height: 80, borderRadius: 14, background: 'linear-gradient(145deg, rgba(89,130,234,0.4), rgba(88,101,242,0.3))', border: '2px solid rgba(255,255,255,0.25)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                      😄
                    </div>
                  </div>
                  {/* Caption and reactions */}
                  <div style={{ padding: '8px 0' }}>
                    <div style={{ fontSize: 12, color: '#f5f0ff', fontWeight: 500, marginBottom: 6 }}>first sunrise hike of the year 🌅</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['❤️ 12', '🔥 8', '💚 5'].map((r, i) => (
                        <span key={i} style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.07)', padding: '3px 8px', borderRadius: 980 }}>{r}</span>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Bottom bar */}
                <div style={{ padding: '8px 24px 20px', display: 'flex', justifyContent: 'space-around' }}>
                  {['💬', '📸', '🧠', '👤'].map((icon, i) => (
                    <div key={i} style={{ fontSize: 22, opacity: i === 1 ? 1 : 0.4 }}>{icon}</div>
                  ))}
                </div>
              </div>
              {/* Glow */}
              <div style={{ position: 'absolute', inset: -20, background: 'radial-gradient(ellipse, rgba(232,121,249,0.2) 0%, transparent 70%)', pointerEvents: 'none', zIndex: -1 }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ padding: '100px 48px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#f5f0ff' }}>
              People are getting their minds back.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            <Testimonial
              quote="I didn't realize how much anxiety came from switching between 7 different apps. Nuro changed everything. My focus is back."
              name="Aanya S." role="Designer, Bangalore" avatar="A"
            />
            <Testimonial
              quote="The brain score feature is addictive in the best way. I started avoiding doom-scroll content because I could literally see it tank my score."
              name="Marcus T." role="Engineer, NYC" avatar="M"
            />
            <Testimonial
              quote="Instants made me actually enjoy sharing again. No pressure to look perfect. My friends love seeing the real me."
              name="Priya K." role="Student, Mumbai" avatar="P"
            />
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" style={{ padding: '120px 48px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(245,240,255,0.35)', marginBottom: 16 }}>Pricing</div>
            <h2 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, letterSpacing: '-0.04em', color: '#f5f0ff', lineHeight: 1.05, marginBottom: 16 }}>
              Simple, honest pricing.
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(245,240,255,0.45)' }}>No dark patterns. No selling your data. Cancel any time.</p>
          </div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'stretch' }}>
            <PriceCard
              name="Free"
              price="$0"
              period="/month"
              cta="Get started"
              features={[
                'Up to 3 platforms connected',
                'Basic brain health score',
                'Instants (5/month)',
                'Unified inbox',
              ]}
            />
            <PriceCard
              name="Pro"
              price="$12"
              period="/month"
              cta="Start Pro free →"
              highlight
              features={[
                'Unlimited platforms',
                'Advanced AI brain scoring',
                'Unlimited Instants',
                'Feed intelligence ranking',
                'AI reply suggestions',
                'Weekly wellness reports',
                'Anti-addiction nudges',
              ]}
            />
            <PriceCard
              name="Teams"
              price="$29"
              period="/mo per team"
              cta="Contact us"
              features={[
                'Everything in Pro',
                'Team brain health dashboard',
                'Slack workspace integration',
                'Admin controls',
                'Priority support',
              ]}
            />
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ padding: '120px 48px', textAlign: 'center', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(249,115,22,0.1) 0%, rgba(232,121,249,0.06) 50%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(44px, 7vw, 80px)', fontWeight: 800, letterSpacing: '-0.045em',
            lineHeight: 1.0, marginBottom: 28,
          }}>
            <span style={{ color: '#f5f0ff' }}>Your brain</span><br />
            <span style={{
              fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
              background: 'linear-gradient(135deg, #f97316, #e879f9, #22d3ee)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              deserves better.
            </span>
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(245,240,255,0.45)', marginBottom: 48, lineHeight: 1.65 }}>
            Join thousands already using Nuro to reclaim their attention, connect more authentically, and live a less stimulated life.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" style={{
              fontSize: 17, fontWeight: 700, padding: '18px 48px', borderRadius: 980,
              background: 'linear-gradient(135deg, #f97316, #e879f9)',
              color: 'white', textDecoration: 'none',
              boxShadow: '0 8px 48px rgba(249,115,22,0.4)',
              letterSpacing: '-0.01em',
            }}>
              Start for free — no card needed
            </Link>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(245,240,255,0.25)', marginTop: 24 }}>
            Available on iOS, Android, and Web · End-to-end encrypted
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: '40px 48px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #f97316, #e879f9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>🧠</div>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#f5f0ff', letterSpacing: '-0.02em' }}>Nuro</span>
        </div>
        <span style={{ fontSize: 13, color: 'rgba(245,240,255,0.3)' }}>© 2026 Nuro · Built to fight brain rot.</span>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Privacy', 'Terms', 'Blog'].map(l => (
            <a key={l} href="#" style={{ fontSize: 13, color: 'rgba(245,240,255,0.35)', textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
      </footer>

    </div>
  )
}
