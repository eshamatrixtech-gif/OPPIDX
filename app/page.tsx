'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MomentCapture } from '@/components/ui/MomentCapture'

/* ─── Types ──────────────────────────────────────────────────────── */
type Platform = 'WhatsApp' | 'Instagram' | 'Gmail' | 'Discord' | 'Twitter'

interface Message { id: string; from: 'me' | 'them'; text: string; time: string }
interface Conversation {
  id: string; name: string; platform: Platform; avatar: string
  preview: string; time: string; unread: number; color: string
  brainScore: number; messages: Message[]
}
interface Moment {
  id: string; user: string; avatar: string; back: string; front: string
  caption: string; time: string; reactions: Record<string, number>
  brainScore: number
}
interface FeedItem {
  id: string; platform: Platform; author: string; avatar: string
  content: string; media?: string; time: string
  brainScore: number; category: 'genuine' | 'neutral' | 'brainrot'
}

type NavTab = 'home' | 'inbox' | 'instants' | 'brain'

/* ─── Data ───────────────────────────────────────────────────────── */
const PLATFORM_COLORS: Record<string, string> = {
  WhatsApp: '#25d366', Instagram: '#e1306c',
  Gmail: '#ea4335', Discord: '#5865f2', Twitter: '#1d9bf0',
}
const PLATFORM_ICONS: Record<string, string> = {
  WhatsApp: '💬', Instagram: '📸',
  Gmail: '📧', Discord: '🎮', Twitter: '🐦',
}

const CONVERSATIONS: Conversation[] = [
  { id: '1', name: 'Mom', platform: 'WhatsApp', avatar: 'M', preview: 'Are you coming home this weekend?', time: '9:41 AM', unread: 2, color: '#30d158', brainScore: 94,
    messages: [
      { id: 'a', from: 'them', text: 'Hey! Are you free this weekend? 🏠', time: '9:38 AM' },
      { id: 'b', from: 'them', text: 'Are you coming home? Miss you so much!', time: '9:41 AM' },
      { id: 'c', from: 'me', text: 'Yes!! Arriving Friday evening 🙌', time: '9:43 AM' },
      { id: 'd', from: 'them', text: "Amazing, I'll make your favourite food 💚", time: '9:44 AM' },
    ]
  },
  { id: '2', name: 'Work Design', platform: 'Discord', avatar: 'W', preview: 'Can you review the Figma?', time: '9:30 AM', unread: 5, color: '#5865f2', brainScore: 71,
    messages: [
      { id: 'a', from: 'them', text: 'Hey team, standup in 10 mins', time: '9:00 AM' },
      { id: 'b', from: 'me', text: 'On it!', time: '9:05 AM' },
      { id: 'c', from: 'them', text: 'Can you review the Figma file before EOD?', time: '9:30 AM' },
    ]
  },
  { id: '3', name: 'Rahul', platform: 'WhatsApp', avatar: 'R', preview: 'bro the match last night 💀', time: '8:55 AM', unread: 0, color: '#25d366', brainScore: 83,
    messages: [
      { id: 'a', from: 'them', text: 'bro did you see that match 💀', time: '8:55 AM' },
      { id: 'b', from: 'me', text: 'insane ending ngl', time: '8:57 AM' },
      { id: 'c', from: 'them', text: 'dropped my phone when they scored 😭', time: '8:59 AM' },
    ]
  },
  { id: '4', name: 'TechDigest', platform: 'Gmail', avatar: 'T', preview: 'Your weekly digest is ready', time: '7:10 AM', unread: 1, color: '#ea4335', brainScore: 52,
    messages: [
      { id: 'a', from: 'them', text: "This week in tech: AI race heats up, new iPhone leaks, and the app killing your productivity you don't know about yet.", time: '7:10 AM' },
    ]
  },
  { id: '5', name: 'Aysha ✨', platform: 'Instagram', avatar: 'A', preview: 'omg look at this 😭', time: 'Yesterday', unread: 3, color: '#e1306c', brainScore: 67,
    messages: [
      { id: 'a', from: 'them', text: 'omg look at this 😭', time: 'Yesterday' },
      { id: 'b', from: 'me', text: '💀💀💀', time: 'Yesterday' },
      { id: 'c', from: 'them', text: 'tell me why I spent 3 hours on reels today', time: 'Yesterday' },
    ]
  },
  { id: '6', name: 'Gaming Crew', platform: 'Discord', avatar: 'G', preview: 'hop on we need a 4th', time: 'Yesterday', unread: 0, color: '#5865f2', brainScore: 78,
    messages: [
      { id: 'a', from: 'them', text: 'hop on we need a 4th', time: 'Yesterday' },
      { id: 'b', from: 'me', text: 'omw give me 5', time: 'Yesterday' },
    ]
  },
]

const MOMENTS: Moment[] = [
  { id: '1', user: 'Ananya', avatar: 'A', back: '🏔️', front: '😄', caption: 'first sunrise hike of the year', time: '2 hours ago', brainScore: 96, reactions: { '❤️': 12, '🔥': 8, '💚': 5 } },
  { id: '2', user: 'Dev', avatar: 'D', back: '☕', front: '🙂', caption: 'early morning, just me and coffee', time: '4 hours ago', brainScore: 91, reactions: { '❤️': 7, '✨': 3 } },
  { id: '3', user: 'Meera', avatar: 'M', back: '📚', front: '🤓', caption: 'studying for finals. send help 😭', time: '6 hours ago', brainScore: 88, reactions: { '💀': 14, '🫡': 6 } },
]

const FEED_ITEMS: FeedItem[] = [
  { id: '1', platform: 'Instagram', author: 'natgeo', avatar: 'N', content: 'The Amazon rainforest absorbs 2 billion tonnes of CO₂ per year. Protecting it is protecting ourselves. 🌿', time: '12m', brainScore: 89, category: 'genuine' },
  { id: '2', platform: 'Twitter', author: 'paulg', avatar: 'P', content: "The secret to doing great work isn't talent — it's the willingness to feel uncertain and keep going anyway.", time: '1h', brainScore: 84, category: 'genuine' },
  { id: '3', platform: 'Instagram', author: 'gossip_daily', avatar: 'G', content: 'You WONT believe what happened next 😱😱😱 (watch till the end) [VIDEO - 47 sec]', time: '2h', brainScore: 18, category: 'brainrot' },
  { id: '4', platform: 'Twitter', author: 'sama', avatar: 'S', content: 'Models are getting so good so fast. The next 5 years will be weirder than most people expect. Stay curious.', time: '3h', brainScore: 78, category: 'genuine' },
  { id: '5', platform: 'Instagram', author: 'meme.page', avatar: 'M', content: 'When you check your phone for the 47th time this hour 😂😂😂 #relatable', time: '4h', brainScore: 31, category: 'brainrot' },
]

/* ─── Helpers ────────────────────────────────────────────────────── */
function scoreColor(s: number) {
  if (s >= 80) return '#34d399'
  if (s >= 60) return '#f97316'
  return '#ef4444'
}
function scoreLabel(s: number) {
  if (s >= 85) return 'Excellent'
  if (s >= 70) return 'Good'
  if (s >= 55) return 'Fair'
  return 'Poor'
}

/* ─── Sub-components ─────────────────────────────────────────────── */
function ConvRow({ c, active, onClick }: { c: Conversation; active: boolean; onClick: () => void }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '11px 14px', borderRadius: 12, cursor: 'pointer',
        background: active ? 'rgba(249,115,22,0.12)' : 'transparent',
        border: active ? '1px solid rgba(249,115,22,0.2)' : '1px solid transparent',
        transition: 'all 0.15s',
      }}
    >
      <div style={{
        width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
        background: `${c.color}18`, border: `1.5px solid ${c.color}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 700, color: c.color,
      }}>
        {c.avatar}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#f5f0ff' }}>{c.name}</span>
          <span style={{ fontSize: 10, color: 'rgba(245,240,255,0.3)' }}>{c.time}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11 }}>{PLATFORM_ICONS[c.platform]}</span>
          <span style={{ fontSize: 12, color: 'rgba(245,240,255,0.38)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{c.preview}</span>
          {c.unread > 0 && (
            <span style={{ fontSize: 10, fontWeight: 700, background: '#f97316', color: 'white', borderRadius: 980, padding: '1px 6px', flexShrink: 0 }}>
              {c.unread}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function ChatBubble({ msg }: { msg: Message }) {
  const isMe = msg.from === 'me'
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', marginBottom: 8 }}
    >
      <div style={{
        maxWidth: '68%', padding: '11px 15px',
        borderRadius: isMe ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
        background: isMe
          ? 'linear-gradient(135deg, #f97316, #e879f9)'
          : 'rgba(255,255,255,0.07)',
        color: '#f5f0ff', fontSize: 14, lineHeight: 1.55,
        border: isMe ? 'none' : '1px solid rgba(255,255,255,0.09)',
        boxShadow: isMe ? '0 4px 20px rgba(249,115,22,0.25)' : 'none',
      }}>
        {msg.text}
      </div>
      <span style={{ fontSize: 10, color: 'rgba(245,240,255,0.28)', marginTop: 4 }}>{msg.time}</span>
    </motion.div>
  )
}

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const r = size * 0.38
  const circ = 2 * Math.PI * r
  const offset = circ - (circ * score) / 100
  const color = scoreColor(score)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={size * 0.06} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={size * 0.06} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
      />
      <text x={size / 2} y={size / 2 - 4} textAnchor="middle" dominantBaseline="central"
        fill="#f5f0ff" fontSize={size * 0.24} fontWeight="700" fontFamily="'DM Sans', sans-serif">
        {score}
      </text>
      <text x={size / 2} y={size / 2 + size * 0.18} textAnchor="middle" dominantBaseline="central"
        fill={color} fontSize={size * 0.095} fontFamily="'DM Sans', sans-serif" fontWeight="600">
        {scoreLabel(score)}
      </text>
    </svg>
  )
}

function MomentCard({ m, own, onPost }: { m?: Moment; own?: boolean; onPost?: () => void }) {
  if (own) return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onPost}
      style={{
        borderRadius: 20, overflow: 'hidden', cursor: 'pointer',
        background: 'rgba(249,115,22,0.08)', border: '2px dashed rgba(249,115,22,0.3)',
        aspectRatio: '9/16', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24,
      }}
    >
      <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(249,115,22,0.15)', border: '1.5px solid rgba(249,115,22,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>📸</div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#f97316', marginBottom: 4 }}>Post your Instant</div>
        <div style={{ fontSize: 11, color: 'rgba(245,240,255,0.35)', lineHeight: 1.5 }}>Your friends posted.<br />Show them your real moment.</div>
      </div>
    </motion.div>
  )
  if (!m) return null
  return (
    <motion.div whileHover={{ y: -2 }} style={{ borderRadius: 20, overflow: 'hidden', aspectRatio: '9/16', background: '#0d0a1f', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Back image */}
      <div style={{ flex: 1, background: 'linear-gradient(145deg, #1a1040, #0d0a2e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60, position: 'relative' }}>
        {m.back}
        {/* Selfie inset */}
        <div style={{ position: 'absolute', top: 10, left: 10, width: 60, height: 75, borderRadius: 14, background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
          {m.front}
        </div>
        {/* Score badge */}
        <div style={{ position: 'absolute', top: 10, right: 10, padding: '4px 10px', borderRadius: 980, background: `${scoreColor(m.brainScore)}20`, border: `1px solid ${scoreColor(m.brainScore)}40`, fontSize: 11, fontWeight: 700, color: scoreColor(m.brainScore) }}>
          🧠 {m.brainScore}
        </div>
      </div>
      {/* Info */}
      <div style={{ padding: '10px 12px', background: 'rgba(0,0,0,0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #f97316, #e879f9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white' }}>
            {m.avatar}
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#f5f0ff' }}>{m.user}</span>
          <span style={{ fontSize: 10, color: 'rgba(245,240,255,0.35)', marginLeft: 'auto' }}>{m.time}</span>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(245,240,255,0.6)', marginBottom: 8 }}>{m.caption}</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {Object.entries(m.reactions).map(([emoji, count]) => (
            <button key={emoji} style={{ padding: '3px 8px', borderRadius: 980, background: 'rgba(255,255,255,0.07)', border: 'none', fontSize: 12, color: 'rgba(245,240,255,0.6)', cursor: 'pointer' }}>
              {emoji} {count}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function FeedCard({ item }: { item: FeedItem }) {
  const color = scoreColor(item.brainScore)
  const catLabel = item.category === 'genuine' ? '✓ Genuine' : item.category === 'brainrot' ? '⚠ Brain rot' : '· Neutral'
  return (
    <motion.div
      whileHover={{ y: -2 }}
      style={{
        padding: '16px 18px', borderRadius: 16, marginBottom: 12,
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
        transition: 'all 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${PLATFORM_COLORS[item.platform]}20`, border: `1.5px solid ${PLATFORM_COLORS[item.platform]}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: PLATFORM_COLORS[item.platform] }}>
          {item.avatar}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#f5f0ff' }}>@{item.author}</div>
          <div style={{ fontSize: 11, color: 'rgba(245,240,255,0.35)' }}>{PLATFORM_ICONS[item.platform]} {item.platform} · {item.time}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
          <div style={{ padding: '3px 10px', borderRadius: 980, background: `${color}15`, border: `1px solid ${color}35`, fontSize: 11, fontWeight: 700, color }}>{item.brainScore}</div>
          <div style={{ fontSize: 10, color: item.category === 'brainrot' ? '#ef4444' : item.category === 'genuine' ? '#34d399' : 'rgba(245,240,255,0.3)' }}>{catLabel}</div>
        </div>
      </div>
      <p style={{ fontSize: 14, color: 'rgba(245,240,255,0.72)', lineHeight: 1.6 }}>{item.content}</p>
    </motion.div>
  )
}

/* ─── Main App ───────────────────────────────────────────────────── */
export default function Home() {
  const [tab, setTab] = useState<NavTab>('inbox')
  const [activeConvoId, setActiveConvoId] = useState('1')
  const [input, setInput] = useState('')
  const [conversations, setConversations] = useState(CONVERSATIONS)
  const [capturing, setCapturing] = useState(false)
  const [moments, setMoments] = useState(MOMENTS)
  const bottomRef = useRef<HTMLDivElement>(null)

  const activeConvo = conversations.find(c => c.id === activeConvoId) ?? conversations[0]
  const avgBrainScore = Math.round(conversations.reduce((a, c) => a + c.brainScore, 0) / conversations.length)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConvoId])

  const sendMessage = () => {
    if (!input.trim()) return
    setConversations(prev => prev.map(c =>
      c.id === activeConvoId
        ? { ...c, messages: [...c.messages, { id: Date.now().toString(), from: 'me', text: input.trim(), time: 'Now' }], preview: input.trim() }
        : c
    ))
    setInput('')
  }

  const handleCapture = (front: string, back: string, caption: string) => {
    const newMoment: Moment = {
      id: Date.now().toString(), user: 'You', avatar: 'Y',
      back: '📷', front: '🤳',
      caption: caption || 'My instant moment',
      time: 'Just now', brainScore: 90,
      reactions: {},
    }
    setMoments(prev => [newMoment, ...prev])
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#070510', color: '#f5f0ff', overflow: 'hidden', fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* ── Left Sidebar ── */}
      <div style={{ width: 68, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', background: 'rgba(255,255,255,0.025)', borderRight: '1px solid rgba(255,255,255,0.07)', gap: 6, flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg, #f97316, #e879f9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 16, boxShadow: '0 4px 16px rgba(249,115,22,0.4)' }}>
          🧠
        </div>

        {/* Nav */}
        {([
          { id: 'home', icon: '◉', label: 'Home' },
          { id: 'inbox', icon: '💬', label: 'Inbox' },
          { id: 'instants', icon: '📸', label: 'Instants' },
          { id: 'brain', icon: '✧', label: 'Brain' },
        ] as { id: NavTab; icon: string; label: string }[]).map(item => (
          <motion.button
            key={item.id}
            onClick={() => setTab(item.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={item.label}
            style={{
              width: 44, height: 44, borderRadius: 13, border: 'none',
              background: tab === item.id ? 'linear-gradient(135deg, rgba(249,115,22,0.25), rgba(232,121,249,0.2))' : 'transparent',
              outline: tab === item.id ? '1px solid rgba(249,115,22,0.35)' : '1px solid transparent',
              cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: tab === item.id ? '#f97316' : 'rgba(245,240,255,0.35)',
              transition: 'all 0.15s',
            }}
          >
            {item.icon}
          </motion.button>
        ))}

        {/* Bottom: Connect + Avatar */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 10, color: 'rgba(245,240,255,0.25)', textAlign: 'center', lineHeight: 1.4 }}>
            Platforms<br />
            <span style={{ fontWeight: 700, color: '#34d399' }}>6 live</span>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #5865f2, #22d3ee)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'white', cursor: 'pointer' }}>
            Y
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <AnimatePresence mode="wait">

          {/* ── HOME TAB ── */}
          {tab === 'home' && (
            <motion.div key="home" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}
              style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: '#f5f0ff', marginBottom: 2 }}>Good morning 👋</h1>
                  <p style={{ fontSize: 14, color: 'rgba(245,240,255,0.45)' }}>Here&rsquo;s your mind health overview</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setCapturing(true)}
                  style={{ padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg, #f97316, #e879f9)', border: 'none', color: 'white', fontWeight: 600, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 20px rgba(249,115,22,0.3)' }}
                >
                  📸 Post Instant
                </motion.button>
              </div>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                {[
                  { label: 'Brain Score', val: `${avgBrainScore}`, sub: 'avg today', color: scoreColor(avgBrainScore), icon: '🧠' },
                  { label: 'Unread DMs', val: `${conversations.reduce((a, c) => a + c.unread, 0)}`, sub: 'across 6 apps', color: '#f97316', icon: '💬' },
                  { label: 'Screen time', val: '3.2h', sub: '↓ 0.8h vs avg', color: '#34d399', icon: '⏱️' },
                  { label: 'Instants', val: `${moments.length}`, sub: 'friends posted', color: '#e879f9', icon: '✨' },
                ].map((s, i) => (
                  <motion.div key={i} whileHover={{ y: -3 }} style={{ padding: '18px 20px', borderRadius: 18, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: 20, marginBottom: 10 }}>{s.icon}</div>
                    <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: s.color, marginBottom: 2 }}>{s.val}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#f5f0ff', marginBottom: 2 }}>{s.label}</div>
                    <div style={{ fontSize: 11, color: 'rgba(245,240,255,0.35)' }}>{s.sub}</div>
                  </motion.div>
                ))}
              </div>

              {/* Two column: inbox preview + instants preview */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
                {/* Recent conversations */}
                <div style={{ padding: '20px', borderRadius: 18, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#f5f0ff' }}>Recent messages</span>
                    <button onClick={() => setTab('inbox')} style={{ fontSize: 12, color: '#f97316', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>View all →</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {conversations.slice(0, 4).map(c => (
                      <div key={c.id} onClick={() => { setTab('inbox'); setActiveConvoId(c.id) }}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 11, cursor: 'pointer', transition: 'background 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${c.color}18`, border: `1.5px solid ${c.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: c.color, flexShrink: 0 }}>{c.avatar}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#f5f0ff' }}>{c.name}</span>
                            <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 980, background: `${scoreColor(c.brainScore)}15`, color: scoreColor(c.brainScore), fontWeight: 700 }}>{c.brainScore}</span>
                          </div>
                          <span style={{ fontSize: 12, color: 'rgba(245,240,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{c.preview}</span>
                        </div>
                        {c.unread > 0 && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#f97316', flexShrink: 0 }} />}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Feed preview */}
                <div style={{ padding: '20px', borderRadius: 18, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#f5f0ff' }}>Feed intelligence</span>
                    <span style={{ fontSize: 12, color: 'rgba(245,240,255,0.4)' }}>Sorted by brain value</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {FEED_ITEMS.slice(0, 4).map(item => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 10px', borderRadius: 11 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: `${PLATFORM_COLORS[item.platform]}18`, border: `1.5px solid ${PLATFORM_COLORS[item.platform]}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: PLATFORM_COLORS[item.platform], flexShrink: 0 }}>{item.avatar}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#f5f0ff' }}>@{item.author}</span>
                            <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 980, background: `${scoreColor(item.brainScore)}15`, color: scoreColor(item.brainScore), fontWeight: 700 }}>{item.brainScore}</span>
                          </div>
                          <span style={{ fontSize: 12, color: 'rgba(245,240,255,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{item.content}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Platform connect row */}
              <div style={{ padding: '18px 20px', borderRadius: 18, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#f5f0ff', marginBottom: 12 }}>Connected platforms</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {([
                    { label: 'WhatsApp', color: '#30d158', connected: true },
                    { label: 'WhatsApp', color: '#25d366', connected: true },
                    { label: 'Instagram', color: '#e1306c', connected: true },
                    { label: 'Gmail', color: '#ea4335', connected: true },
                    { label: 'Discord', color: '#5865f2', connected: true },
                    { label: 'Discord', color: '#ecb22e', connected: true },
                    { label: 'Twitter', color: '#1d9bf0', connected: false },
                    { label: 'LinkedIn', color: '#0077b5', connected: false },
                  ]).map(p => (
                    <div key={p.label} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '6px 12px', borderRadius: 980, fontSize: 12, fontWeight: 500,
                      background: p.connected ? `${p.color}12` : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${p.connected ? `${p.color}30` : 'rgba(255,255,255,0.08)'}`,
                      color: p.connected ? p.color : 'rgba(245,240,255,0.4)',
                      cursor: 'pointer',
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.connected ? p.color : 'rgba(255,255,255,0.2)' }} />
                      {p.label}
                      {!p.connected && <span style={{ fontSize: 10, opacity: 0.6 }}>+ Connect</span>}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── INBOX TAB ── */}
          {tab === 'inbox' && (
            <motion.div key="inbox" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}
              style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

              {/* Conversation list */}
              <div style={{ width: 280, borderRight: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.015)', flexShrink: 0 }}>
                <div style={{ padding: '20px 16px 12px' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#f5f0ff', marginBottom: 12 }}>Messages</div>
                  <input
                    placeholder="Search…"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', color: '#f5f0ff', fontSize: 13, outline: 'none' }}
                  />
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px 16px' }}>
                  {conversations.map(c => (
                    <ConvRow key={c.id} c={c} active={c.id === activeConvoId} onClick={() => setActiveConvoId(c.id)} />
                  ))}
                </div>
              </div>

              {/* Chat area */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Chat header */}
                <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.02)', flexShrink: 0 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: `${activeConvo.color}18`, border: `1.5px solid ${activeConvo.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: activeConvo.color }}>
                    {activeConvo.avatar}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#f5f0ff' }}>{activeConvo.name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(245,240,255,0.35)' }}>
                      {PLATFORM_ICONS[activeConvo.platform]} via {activeConvo.platform}
                    </div>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ padding: '5px 12px', borderRadius: 980, background: `${scoreColor(activeConvo.brainScore)}12`, border: `1px solid ${scoreColor(activeConvo.brainScore)}30`, fontSize: 12, fontWeight: 700, color: scoreColor(activeConvo.brainScore) }}>
                      🧠 {activeConvo.brainScore} mind score
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column' }}>
                  {activeConvo.messages.map(msg => <ChatBubble key={msg.id} msg={msg} />)}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') sendMessage() }}
                    placeholder={`Reply to ${activeConvo.name}…`}
                    style={{ flex: 1, padding: '12px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', color: '#f5f0ff', fontSize: 14, outline: 'none' }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={sendMessage}
                    style={{ width: 44, height: 44, borderRadius: 13, background: 'linear-gradient(135deg, #f97316, #e879f9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'white', flexShrink: 0, boxShadow: '0 4px 16px rgba(249,115,22,0.35)' }}
                  >
                    ↑
                  </motion.button>
                </div>
              </div>

              {/* Right: Brain score panel */}
              <div style={{ width: 220, borderLeft: '1px solid rgba(255,255,255,0.07)', padding: '24px 18px', display: 'flex', flexDirection: 'column', gap: 20, background: 'rgba(255,255,255,0.015)', overflowY: 'auto', flexShrink: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(245,240,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Mind Health</div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <ScoreRing score={activeConvo.brainScore} size={130} />
                </div>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.07)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(245,240,255,0.3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>All conversations</div>
                  {conversations.map(c => (
                    <div key={c.id} onClick={() => setActiveConvoId(c.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', opacity: c.id === activeConvoId ? 1 : 0.6 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${c.color}15`, border: `1px solid ${c.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: c.color, flexShrink: 0 }}>{c.avatar}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#f5f0ff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                        <div style={{ width: '100%', height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.08)', marginTop: 3 }}>
                          <div style={{ width: `${c.brainScore}%`, height: '100%', borderRadius: 2, background: scoreColor(c.brainScore), transition: 'width 0.8s ease' }} />
                        </div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: scoreColor(c.brainScore), flexShrink: 0 }}>{c.brainScore}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── INSTANTS TAB ── */}
          {tab === 'instants' && (
            <motion.div key="instants" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}
              style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                  <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: '#f5f0ff', marginBottom: 2 }}>Instants ✨</h1>
                  <p style={{ fontSize: 14, color: 'rgba(245,240,255,0.4)' }}>Real moments, unfiltered — see your friends&rsquo; actual life</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setCapturing(true)}
                  style={{ padding: '11px 22px', borderRadius: 13, background: 'linear-gradient(135deg, #f97316, #e879f9)', border: 'none', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 20px rgba(249,115,22,0.35)' }}
                >
                  📸 Post your Instant
                </motion.button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
                <MomentCard own onPost={() => setCapturing(true)} />
                {moments.map(m => <MomentCard key={m.id} m={m} />)}
              </div>
            </motion.div>
          )}

          {/* ── BRAIN TAB ── */}
          {tab === 'brain' && (
            <motion.div key="brain" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}
              style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: '#f5f0ff', marginBottom: 2 }}>Brain Health 🧠</h1>
                <p style={{ fontSize: 14, color: 'rgba(245,240,255,0.4)' }}>How social media is affecting your mind today</p>
              </div>

              {/* Main score + breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20 }}>
                <div style={{ padding: '28px 24px', borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(245,240,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Overall Score</div>
                  <ScoreRing score={avgBrainScore} size={160} />
                  <div style={{ fontSize: 13, color: 'rgba(245,240,255,0.5)', textAlign: 'center', lineHeight: 1.6 }}>
                    Your conversations and feeds are <strong style={{ color: scoreColor(avgBrainScore) }}>mostly healthy</strong>. Watch your Instagram feed usage.
                  </div>
                </div>

                <div style={{ padding: '24px', borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#f5f0ff', marginBottom: 20 }}>Score breakdown by platform</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {conversations.map(c => (
                      <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${c.color}18`, border: `1.5px solid ${c.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: c.color, flexShrink: 0 }}>{c.avatar}</div>
                        <div style={{ width: 80, flexShrink: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#f5f0ff' }}>{c.name}</div>
                          <div style={{ fontSize: 10, color: 'rgba(245,240,255,0.3)' }}>{c.platform}</div>
                        </div>
                        <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${c.brainScore}%` }}
                            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                            style={{ height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${scoreColor(c.brainScore)}, ${scoreColor(c.brainScore)}80)` }}
                          />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: scoreColor(c.brainScore), width: 28, textAlign: 'right', flexShrink: 0 }}>{c.brainScore}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Feed score breakdown */}
              <div style={{ padding: '24px', borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#f5f0ff', marginBottom: 4 }}>Ranked feed — sorted by brain value</div>
                <div style={{ fontSize: 12, color: 'rgba(245,240,255,0.4)', marginBottom: 20 }}>AI-sorted content from your platforms</div>
                {FEED_ITEMS.map(item => <FeedCard key={item.id} item={item} />)}
              </div>

              {/* Tips */}
              <div style={{ padding: '24px', borderRadius: 20, background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.2)' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#f97316', marginBottom: 16 }}>💡 Personalized recommendations</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { icon: '📵', text: 'You spend 45 min/day on Instagram Reels. Try a 20-min limit to boost your score.' },
                    { icon: '⏰', text: 'Your peak brain-rot window is 9–11 PM. Schedule Do Not Disturb during this time.' },
                    { icon: '🌱', text: 'Conversations with Mom and Rahul score highest — they\'re genuine connections. Nurture them.' },
                  ].map((tip, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{tip.icon}</span>
                      <span style={{ fontSize: 14, color: 'rgba(245,240,255,0.65)', lineHeight: 1.6 }}>{tip.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── MomentCapture modal ── */}
      <MomentCapture
        isOpen={capturing}
        onClose={() => setCapturing(false)}
        onCapture={handleCapture}
        timeRemaining={120}
      />
    </div>
  )
}
