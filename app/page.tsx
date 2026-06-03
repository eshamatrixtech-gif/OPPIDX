'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MomentCapture } from '@/components/ui/MomentCapture'

/* ═══════════════════════════════════════════════════════════════
   COLOUR PALETTE — identical tokens to landing page
   Day  (06:00–20:00): warm cream light
   Night (20:00–06:00): warm near-black dark
═══════════════════════════════════════════════════════════════ */
const DARK = {
  bg:        '#080705',
  surface:   '#110F0C',
  surfaceHi: '#1A1612',
  border:    'rgba(240,235,227,0.07)',
  borderHi:  'rgba(240,235,227,0.13)',
  text1:     '#F0EBE3',
  text2:     'rgba(240,235,227,0.52)',
  text3:     'rgba(240,235,227,0.28)',
  accent:    '#E8651A',
  accentDim: 'rgba(232,101,26,0.13)',
  accentGlow:'rgba(232,101,26,0.22)',
  shadow:    '0 2px 16px rgba(0,0,0,0.4)',
}
const LIGHT = {
  bg:        '#F7F4EF',
  surface:   '#EDEAE3',
  surfaceHi: '#E4E0D8',
  border:    'rgba(28,24,20,0.08)',
  borderHi:  'rgba(28,24,20,0.14)',
  text1:     '#1C1814',
  text2:     'rgba(28,24,20,0.55)',
  text3:     'rgba(28,24,20,0.3)',
  accent:    '#E8651A',
  accentDim: 'rgba(232,101,26,0.1)',
  accentGlow:'rgba(232,101,26,0.18)',
  shadow:    '0 2px 16px rgba(28,24,20,0.08)',
}

function getTheme() {
  const h = new Date().getHours()
  return h >= 6 && h < 20 ? LIGHT : DARK
}

function getGreeting() {
  const h = new Date().getHours()
  if (h >= 5  && h < 12) return 'Good morning'
  if (h >= 12 && h < 17) return 'Good afternoon'
  if (h >= 17 && h < 21) return 'Good evening'
  return 'Good night'
}

/* ─── Score colours — semantic but earthy ─────────────────────── */
function scoreColor(s: number) {
  if (s >= 80) return '#4A7C59'   // sage green
  if (s >= 60) return '#E8651A'   // saffron
  return '#B85450'                // muted brick
}
function scoreLabel(s: number) {
  if (s >= 85) return 'Excellent'
  if (s >= 70) return 'Good'
  if (s >= 55) return 'Fair'
  return 'Low'
}

/* ─── Types ───────────────────────────────────────────────────── */
type Platform = 'WhatsApp' | 'Instagram' | 'Gmail' | 'Discord' | 'Twitter'
interface Msg  { id: string; from: 'me' | 'them'; text: string; time: string }
interface Conv {
  id: string; name: string; platform: Platform; avatar: string
  preview: string; time: string; unread: number
  brainScore: number; messages: Msg[]
}
interface Moment {
  id: string; user: string; avatar: string
  scene: string; caption: string; time: string
  brainScore: number; reactions: Record<string, number>
}
interface FeedItem {
  id: string; platform: Platform; author: string; avatar: string
  content: string; time: string
  brainScore: number; category: 'genuine' | 'neutral' | 'brainrot'
}
type Tab = 'home' | 'inbox' | 'instants' | 'brain'

/* ─── Platform meta ───────────────────────────────────────────── */
const PCOLOR: Record<string, string> = {
  WhatsApp: '#25d366', Instagram: '#e1306c',
  Gmail: '#ea4335', Discord: '#5865f2', Twitter: '#1d9bf0',
}

/* ─── Data ────────────────────────────────────────────────────── */
const CONVS: Conv[] = [
  { id:'1', name:'Mom', platform:'WhatsApp', avatar:'M',
    preview:'Are you coming home this weekend?', time:'9:41 AM', unread:2, brainScore:94,
    messages:[
      { id:'a', from:'them', text:'Hey, are you free this weekend?', time:'9:38 AM' },
      { id:'b', from:'them', text:'Was thinking you could come home. Miss you.', time:'9:40 AM' },
      { id:'c', from:'me',   text:'Yes! Arriving Friday evening.', time:'9:43 AM' },
      { id:'d', from:'them', text:"Perfect. I'll make your favourite.", time:'9:44 AM' },
    ]},
  { id:'2', name:'Work Design', platform:'Discord', avatar:'W',
    preview:'Can you review the Figma before EOD?', time:'9:30 AM', unread:5, brainScore:71,
    messages:[
      { id:'a', from:'them', text:'Standup in 10.', time:'9:00 AM' },
      { id:'b', from:'me',   text:'On it.', time:'9:05 AM' },
      { id:'c', from:'them', text:'Can you review the Figma file before EOD?', time:'9:30 AM' },
    ]},
  { id:'3', name:'Rahul', platform:'WhatsApp', avatar:'R',
    preview:"Did you see the match last night?", time:'8:55 AM', unread:0, brainScore:83,
    messages:[
      { id:'a', from:'them', text:'Did you watch the match last night?', time:'8:55 AM' },
      { id:'b', from:'me',   text:'Insane ending. Could not believe it.', time:'8:57 AM' },
      { id:'c', from:'them', text:'Dropped my phone when they scored.', time:'8:59 AM' },
    ]},
  { id:'4', name:'TechDigest', platform:'Gmail', avatar:'T',
    preview:'Your weekly digest is ready', time:'7:10 AM', unread:1, brainScore:52,
    messages:[
      { id:'a', from:'them', text:'This week in tech: AI models improving rapidly, new privacy legislation in the EU, and tools worth trying. Read time: 4 min.', time:'7:10 AM' },
    ]},
  { id:'5', name:'Sydney', platform:'Instagram', avatar:'S',
    preview:'Did you see that post?', time:'Yesterday', unread:3, brainScore:67,
    messages:[
      { id:'a', from:'them', text:'Did you see that post going around?', time:'Yesterday' },
      { id:'b', from:'me',   text:'Which one?', time:'Yesterday' },
      { id:'c', from:'them', text:'I spent way too long on reels last night honestly.', time:'Yesterday' },
    ]},
  { id:'6', name:'Dev squad', platform:'Discord', avatar:'D',
    preview:'Hop on, we need a fourth', time:'Yesterday', unread:0, brainScore:78,
    messages:[
      { id:'a', from:'them', text:'Hop on, we need a fourth.', time:'Yesterday' },
      { id:'b', from:'me',   text:'Give me five minutes.', time:'Yesterday' },
    ]},
]

const MOMENTS: Moment[] = [
  { id:'1', user:'Ananya', avatar:'A', scene:'Sunrise hike', caption:'first hike of the year', time:'2 hours ago', brainScore:96, reactions:{ '❤': 12, '+': 8 } },
  { id:'2', user:'Dev',    avatar:'D', scene:'Morning coffee', caption:'quiet morning', time:'4 hours ago', brainScore:91, reactions:{ '❤': 7 } },
  { id:'3', user:'Meera',  avatar:'M', scene:'Library desk', caption:'finals season', time:'6 hours ago', brainScore:88, reactions:{ '❤': 14 } },
]

const FEED: FeedItem[] = [
  { id:'1', platform:'Instagram', author:'natgeo',      avatar:'N', time:'12m', brainScore:89, category:'genuine',
    content:'The Amazon absorbs 2 billion tonnes of CO₂ per year. Protecting it is protecting ourselves.' },
  { id:'2', platform:'Twitter',   author:'paulg',       avatar:'P', time:'1h',  brainScore:84, category:'genuine',
    content:"The secret to doing great work isn't talent — it's the willingness to feel uncertain and keep going anyway." },
  { id:'3', platform:'Instagram', author:'gossip_daily',avatar:'G', time:'2h',  brainScore:18, category:'brainrot',
    content:"You won't believe what happened. Watch till the end. [47 sec video]" },
  { id:'4', platform:'Twitter',   author:'sama',        avatar:'S', time:'3h',  brainScore:78, category:'genuine',
    content:'Models are improving faster than most people realise. Stay curious.' },
  { id:'5', platform:'Instagram', author:'meme.page',   avatar:'M', time:'4h',  brainScore:31, category:'brainrot',
    content:'When you check your phone for the 47th time this hour. #relatable' },
]

/* ─── Logo (same as landing) ──────────────────────────────────── */
function NuroIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="11" fill="#E8651A" />
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

/* ─── SVG nav icons ───────────────────────────────────────────── */
function IconHome({ size=18, color='currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L10 3l7 6.5V18a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M7 19V12h6v7" />
    </svg>
  )
}
function IconInbox({ size=18, color='currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="16" height="13" rx="2" />
      <path d="M2 8l8 5 8-5" />
    </svg>
  )
}
function IconCamera({ size=18, color='currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="6" width="18" height="12" rx="2" />
      <circle cx="10" cy="12" r="3" />
      <path d="M7 6l1.5-2.5h3L13 6" />
    </svg>
  )
}
function IconBrain({ size=18, color='currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 3C7.5 3 5 5 5 8c0 1.5.5 2.5 1 3.5-.5 1-1 2-1 3 0 1.5 1 2.5 2.5 2.5" />
      <path d="M10 3c2.5 0 5 2 5 5 0 1.5-.5 2.5-1 3.5.5 1 1 2 1 3 0 1.5-1 2.5-2.5 2.5" />
      <path d="M5 11.5c-1 .5-2 1.5-2 2.5" />
      <path d="M15 11.5c1 .5 2 1.5 2 2.5" />
      <line x1="10" y1="3" x2="10" y2="17" />
    </svg>
  )
}

/* ─── Score ring ──────────────────────────────────────────────── */
function ScoreRing({ score, size = 120, C }: { score: number; size?: number; C: typeof DARK }) {
  const r = size * 0.38
  const circ = 2 * Math.PI * r
  const offset = circ - (circ * score) / 100
  const col = scoreColor(score)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={size * 0.055} />
      <motion.circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={col} strokeWidth={size * 0.055} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ filter: `drop-shadow(0 0 6px ${col}60)` }}
      />
      <text x={size/2} y={size/2 - 2} textAnchor="middle" dominantBaseline="central"
        fill={C.text1} fontSize={size * 0.24} fontWeight="700" fontFamily="'DM Sans',sans-serif">{score}</text>
      <text x={size/2} y={size/2 + size*0.18} textAnchor="middle" dominantBaseline="central"
        fill={col} fontSize={size * 0.09} fontFamily="'DM Sans',sans-serif" fontWeight="600">{scoreLabel(score)}</text>
    </svg>
  )
}

/* ─── Conversation row ────────────────────────────────────────── */
function ConvRow({ cv, active, C, onClick }: { cv: Conv; active: boolean; C: typeof DARK; onClick: () => void }) {
  return (
    <motion.div onClick={onClick} whileHover={{ backgroundColor: C.accentDim }}
      style={{
        display:'flex', alignItems:'center', gap:11,
        padding:'10px 13px', borderRadius:11, cursor:'pointer',
        background: active ? C.accentDim : 'transparent',
        border: `1px solid ${active ? C.accent + '30' : 'transparent'}`,
        transition:'all 0.15s',
      }}>
      <div style={{
        width:36, height:36, borderRadius:'50%', flexShrink:0,
        background: C.accentDim,
        border: `1.5px solid ${C.accent}35`,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:13, fontWeight:700, color: C.accent,
      }}>{cv.avatar}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}>
          <span style={{ fontSize:13, fontWeight:600, color:C.text1 }}>{cv.name}</span>
          <span style={{ fontSize:10, color:C.text3 }}>{cv.time}</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:12, color:C.text2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>{cv.preview}</span>
          {cv.unread > 0 && (
            <span style={{ fontSize:10, fontWeight:700, background:C.accent, color:'white', borderRadius:980, padding:'1px 6px', flexShrink:0 }}>{cv.unread}</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Chat bubble ─────────────────────────────────────────────── */
function Bubble({ msg, C }: { msg: Msg; C: typeof DARK }) {
  const isMe = msg.from === 'me'
  return (
    <motion.div initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }}
      style={{ display:'flex', flexDirection:'column', alignItems: isMe ? 'flex-end' : 'flex-start', marginBottom:8 }}>
      <div style={{
        maxWidth:'66%', padding:'10px 14px',
        borderRadius: isMe ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
        background: isMe ? C.accent : C.surfaceHi,
        color: isMe ? 'white' : C.text1,
        fontSize:14, lineHeight:1.55,
        border: isMe ? 'none' : `1px solid ${C.border}`,
        boxShadow: isMe ? `0 4px 16px ${C.accentGlow}` : 'none',
      }}>{msg.text}</div>
      <span style={{ fontSize:10, color:C.text3, marginTop:4 }}>{msg.time}</span>
    </motion.div>
  )
}

/* ─── Feed card ───────────────────────────────────────────────── */
function FeedCard({ item, C }: { item: FeedItem; C: typeof DARK }) {
  const col = scoreColor(item.brainScore)
  return (
    <div style={{ padding:'14px 16px', borderRadius:14, marginBottom:10, background:C.surface, border:`1px solid ${C.border}` }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
        <div style={{ width:32, height:32, borderRadius:'50%', background:`${PCOLOR[item.platform]}15`, border:`1.5px solid ${PCOLOR[item.platform]}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:PCOLOR[item.platform], flexShrink:0 }}>{item.avatar}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:600, color:C.text1 }}>@{item.author}</div>
          <div style={{ fontSize:11, color:C.text3 }}>{item.platform} · {item.time}</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:980, background:`${col}15`, color:col, border:`1px solid ${col}30` }}>{item.brainScore}</div>
          <div style={{ fontSize:10, color:C.text3, marginTop:2 }}>
            {item.category === 'genuine' ? 'Genuine' : item.category === 'brainrot' ? 'Brain rot' : 'Neutral'}
          </div>
        </div>
      </div>
      <p style={{ fontSize:13, color:C.text2, lineHeight:1.6 }}>{item.content}</p>
    </div>
  )
}

/* ─── Moment card ─────────────────────────────────────────────── */
function MomentTile({ m, C, onPost, own }: { m?: Moment; C: typeof DARK; onPost?: () => void; own?: boolean }) {
  if (own) return (
    <motion.div whileHover={{ y:-2 }} onClick={onPost}
      style={{ borderRadius:18, aspectRatio:'9/16', cursor:'pointer', background:C.accentDim, border:`2px dashed ${C.accent}40`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10, padding:20 }}>
      <div style={{ width:44, height:44, borderRadius:'50%', background:C.accentDim, border:`1.5px solid ${C.accent}50`, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <IconCamera size={20} color={C.accent} />
      </div>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:13, fontWeight:600, color:C.accent, marginBottom:3 }}>Post your Instant</div>
        <div style={{ fontSize:11, color:C.text3, lineHeight:1.5 }}>Friends posted.<br />Your turn.</div>
      </div>
    </motion.div>
  )
  if (!m) return null
  return (
    <motion.div whileHover={{ y:-2 }} style={{ borderRadius:18, aspectRatio:'9/16', background:C.surface, border:`1px solid ${C.border}`, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <div style={{ flex:1, background:C.surfaceHi, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', fontSize:36 }}>
        {m.scene}
        <div style={{ position:'absolute', top:8, right:8, padding:'3px 9px', borderRadius:980, background:`${scoreColor(m.brainScore)}15`, border:`1px solid ${scoreColor(m.brainScore)}30`, fontSize:10, fontWeight:700, color:scoreColor(m.brainScore) }}>{m.brainScore}</div>
      </div>
      <div style={{ padding:'10px 12px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:5 }}>
          <div style={{ width:24, height:24, borderRadius:'50%', background:C.accentDim, border:`1px solid ${C.accent}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:C.accent }}>{m.avatar}</div>
          <span style={{ fontSize:12, fontWeight:600, color:C.text1 }}>{m.user}</span>
          <span style={{ fontSize:10, color:C.text3, marginLeft:'auto' }}>{m.time}</span>
        </div>
        <div style={{ fontSize:12, color:C.text2, marginBottom:7 }}>{m.caption}</div>
        <div style={{ display:'flex', gap:5 }}>
          {Object.entries(m.reactions).map(([emoji, count]) => (
            <button key={emoji} style={{ padding:'2px 8px', borderRadius:980, background:C.accentDim, border:`1px solid ${C.border}`, fontSize:11, color:C.text2, cursor:'pointer' }}>{emoji} {count}</button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════════ */
export default function App() {
  const [tab, setTab]               = useState<Tab>('inbox')
  const [activeId, setActiveId]     = useState('1')
  const [input, setInput]           = useState('')
  const [convs, setConvs]           = useState(CONVS)
  const [capturing, setCapturing]   = useState(false)
  const [moments, setMoments]       = useState(MOMENTS)
  const [C, setC]                   = useState(getTheme)
  const bottomRef                   = useRef<HTMLDivElement>(null)

  /* Update theme every minute */
  useEffect(() => {
    const id = setInterval(() => setC(getTheme()), 60_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [activeId])

  const active    = convs.find(c => c.id === activeId) ?? convs[0]
  const avgScore  = Math.round(convs.reduce((a, c) => a + c.brainScore, 0) / convs.length)
  const totalUnread = convs.reduce((a, c) => a + c.unread, 0)

  function send() {
    if (!input.trim()) return
    setConvs(prev => prev.map(c => c.id === activeId
      ? { ...c, messages:[...c.messages, { id:Date.now().toString(), from:'me', text:input.trim(), time:'Now' }], preview:input.trim() }
      : c
    ))
    setInput('')
  }

  function onCapture(_f: string, _b: string, caption: string) {
    setMoments(prev => [{ id:Date.now().toString(), user:'You', avatar:'Y', scene:'Your moment', caption: caption || 'A moment', time:'Just now', brainScore:90, reactions:{} }, ...prev])
  }

  const NAV: { id: Tab; label: string; Icon: React.FC<{ size?: number; color?: string }> }[] = [
    { id:'home',     label:'Home',     Icon: IconHome   },
    { id:'inbox',    label:'Inbox',    Icon: IconInbox  },
    { id:'instants', label:'Instants', Icon: IconCamera },
    { id:'brain',    label:'Brain',    Icon: IconBrain  },
  ]

  /* ── Shared card style ── */
  const card = (extra?: object) => ({
    borderRadius:18, background:C.surface, border:`1px solid ${C.border}`, ...extra
  })

  return (
    <div style={{ display:'flex', height:'100vh', background:C.bg, color:C.text1, overflow:'hidden', fontFamily:"'DM Sans', system-ui, sans-serif", transition:'background 0.6s, color 0.6s' }}>

      {/* ════════════════════════════
          SIDEBAR
      ════════════════════════════ */}
      <div style={{ width:64, display:'flex', flexDirection:'column', alignItems:'center', padding:'18px 0', background:C.surface, borderRight:`1px solid ${C.border}`, gap:4, flexShrink:0, transition:'background 0.6s' }}>
        <div style={{ marginBottom:18 }}><NuroIcon size={30} /></div>

        {NAV.map(({ id, label, Icon }) => {
          const isActive = tab === id
          return (
            <motion.button key={id} onClick={() => setTab(id)} whileTap={{ scale:0.93 }} title={label}
              style={{
                width:42, height:42, borderRadius:11, border:'none',
                background: isActive ? C.accentDim : 'transparent',
                outline: `1px solid ${isActive ? C.accent+'35' : 'transparent'}`,
                cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                color: isActive ? C.accent : C.text3,
                transition:'all 0.15s',
              }}>
              <Icon size={17} color={isActive ? C.accent : C.text3} />
            </motion.button>
          )
        })}

        <div style={{ marginTop:'auto', display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
          <div style={{ fontSize:9, color:C.text3, textAlign:'center', lineHeight:1.4 }}>
            4 live
          </div>
          <div style={{ width:32, height:32, borderRadius:'50%', background:C.accentDim, border:`1.5px solid ${C.accent}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:C.accent, cursor:'pointer' }}>
            Y
          </div>
        </div>
      </div>

      {/* ════════════════════════════
          CONTENT
      ════════════════════════════ */}
      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
        <AnimatePresence mode="wait">

          {/* ── HOME ── */}
          {tab === 'home' && (
            <motion.div key="home" initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-10 }} transition={{ duration:0.18 }}
              style={{ flex:1, padding:'28px 30px', overflowY:'auto', display:'flex', flexDirection:'column', gap:20 }}>

              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <h1 style={{ fontSize:21, fontWeight:700, letterSpacing:'-0.02em', color:C.text1, marginBottom:3, fontFamily:"'Instrument Serif', serif", fontStyle:'italic' }}>
                    {getGreeting()}
                  </h1>
                  <p style={{ fontSize:13, color:C.text3 }}>Here's your mind health overview</p>
                </div>
                <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                  onClick={() => setCapturing(true)}
                  style={{ padding:'9px 18px', borderRadius:11, background:C.accent, border:'none', color:'white', fontWeight:600, fontSize:13, cursor:'pointer', boxShadow:`0 4px 16px ${C.accentGlow}` }}>
                  Post Instant
                </motion.button>
              </div>

              {/* Stats */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14 }}>
                {[
                  { label:'Mind Score',  val:`${avgScore}`,     sub:'average today',       color:scoreColor(avgScore) },
                  { label:'Unread',      val:`${totalUnread}`,  sub:'across 4 platforms',  color:C.accent },
                  { label:'Screen time', val:'3.2h',            sub:'0.8h below average',  color:'#4A7C59' },
                  { label:'Instants',    val:`${moments.length}`,sub:'friends posted today',color:C.accent },
                ].map((s, i) => (
                  <motion.div key={i} whileHover={{ y:-2 }} style={{ ...card(), padding:'16px 18px' }}>
                    <div style={{ fontSize:24, fontWeight:800, letterSpacing:'-0.03em', color:s.color, marginBottom:2, fontFamily:"'Instrument Serif', serif" }}>{s.val}</div>
                    <div style={{ fontSize:12, fontWeight:600, color:C.text1, marginBottom:1 }}>{s.label}</div>
                    <div style={{ fontSize:11, color:C.text3 }}>{s.sub}</div>
                  </motion.div>
                ))}
              </div>

              {/* Two columns */}
              <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:16 }}>
                {/* Recent messages */}
                <div style={{ ...card(), padding:'18px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                    <span style={{ fontSize:13, fontWeight:600, color:C.text1 }}>Recent messages</span>
                    <button onClick={() => setTab('inbox')} style={{ fontSize:12, color:C.accent, background:'none', border:'none', cursor:'pointer', fontWeight:500 }}>View all →</button>
                  </div>
                  {convs.slice(0,4).map(c => (
                    <div key={c.id} onClick={() => { setTab('inbox'); setActiveId(c.id) }}
                      style={{ display:'flex', alignItems:'center', gap:9, padding:'8px 8px', borderRadius:9, cursor:'pointer', transition:'background 0.12s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = C.accentDim)}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <div style={{ width:30, height:30, borderRadius:'50%', background:C.accentDim, border:`1.5px solid ${C.accent}35`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:C.accent, flexShrink:0 }}>{c.avatar}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', justifyContent:'space-between' }}>
                          <span style={{ fontSize:12, fontWeight:600, color:C.text1 }}>{c.name}</span>
                          <span style={{ fontSize:10, padding:'1px 6px', borderRadius:980, background:`${scoreColor(c.brainScore)}14`, color:scoreColor(c.brainScore), fontWeight:700 }}>{c.brainScore}</span>
                        </div>
                        <span style={{ fontSize:11, color:C.text3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', display:'block' }}>{c.preview}</span>
                      </div>
                      {c.unread > 0 && <span style={{ width:7, height:7, borderRadius:'50%', background:C.accent, flexShrink:0 }} />}
                    </div>
                  ))}
                </div>

                {/* Feed preview */}
                <div style={{ ...card(), padding:'18px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                    <span style={{ fontSize:13, fontWeight:600, color:C.text1 }}>Feed</span>
                    <span style={{ fontSize:11, color:C.text3 }}>By brain value</span>
                  </div>
                  {FEED.slice(0,4).map(item => (
                    <div key={item.id} style={{ display:'flex', gap:9, padding:'7px 0', borderBottom:`1px solid ${C.border}` }}>
                      <div style={{ width:28, height:28, borderRadius:'50%', background:`${PCOLOR[item.platform]}14`, border:`1.5px solid ${PCOLOR[item.platform]}35`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:PCOLOR[item.platform], flexShrink:0 }}>{item.avatar}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}>
                          <span style={{ fontSize:11, fontWeight:600, color:C.text1 }}>@{item.author}</span>
                          <span style={{ fontSize:10, padding:'1px 5px', borderRadius:980, background:`${scoreColor(item.brainScore)}13`, color:scoreColor(item.brainScore), fontWeight:700 }}>{item.brainScore}</span>
                        </div>
                        <span style={{ fontSize:11, color:C.text3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', display:'block' }}>{item.content}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Platforms */}
              <div style={{ ...card(), padding:'16px 18px' }}>
                <div style={{ fontSize:12, fontWeight:600, color:C.text1, marginBottom:10 }}>Connected platforms</div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {[
                    { label:'WhatsApp',  color:'#25d366', on:true  },
                    { label:'Instagram', color:'#e1306c', on:true  },
                    { label:'Gmail',     color:'#ea4335', on:true  },
                    { label:'Discord',   color:'#5865f2', on:true  },
                    { label:'Twitter/X', color:'#1d9bf0', on:false },
                    { label:'LinkedIn',  color:'#0077b5', on:false },
                  ].map(p => (
                    <div key={p.label} style={{
                      display:'flex', alignItems:'center', gap:6,
                      padding:'5px 12px', borderRadius:980, fontSize:12, fontWeight:500,
                      background: p.on ? `${p.color}10` : C.surface,
                      border:`1px solid ${p.on ? p.color+'28' : C.border}`,
                      color: p.on ? p.color : C.text3, cursor:'pointer',
                    }}>
                      <span style={{ width:5, height:5, borderRadius:'50%', background: p.on ? p.color : C.text3, display:'inline-block' }} />
                      {p.label}
                      {!p.on && <span style={{ fontSize:10, color:C.accent }}>Connect</span>}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── INBOX ── */}
          {tab === 'inbox' && (
            <motion.div key="inbox" initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-10 }} transition={{ duration:0.18 }}
              style={{ flex:1, display:'flex', overflow:'hidden' }}>

              {/* Conv list */}
              <div style={{ width:270, borderRight:`1px solid ${C.border}`, display:'flex', flexDirection:'column', background:C.surface, flexShrink:0, transition:'background 0.6s' }}>
                <div style={{ padding:'18px 14px 10px' }}>
                  <div style={{ fontSize:14, fontWeight:600, color:C.text1, marginBottom:10 }}>Messages</div>
                  <input placeholder="Search" style={{ width:'100%', padding:'8px 11px', borderRadius:9, background:C.surfaceHi, border:`1px solid ${C.border}`, color:C.text1, fontSize:13, outline:'none' }} />
                </div>
                <div style={{ flex:1, overflowY:'auto', padding:'0 8px 14px' }}>
                  {convs.map(c => <ConvRow key={c.id} cv={c} active={c.id === activeId} C={C} onClick={() => setActiveId(c.id)} />)}
                </div>
              </div>

              {/* Chat */}
              <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
                <div style={{ padding:'13px 18px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:11, background:C.surface, flexShrink:0, transition:'background 0.6s' }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:C.accentDim, border:`1.5px solid ${C.accent}35`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:C.accent }}>{active.avatar}</div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:600, color:C.text1 }}>{active.name}</div>
                    <div style={{ fontSize:11, color:C.text3 }}>via {active.platform}</div>
                  </div>
                  <div style={{ marginLeft:'auto', padding:'4px 12px', borderRadius:980, background:C.accentDim, border:`1px solid ${C.accent}30`, fontSize:11, fontWeight:700, color:C.accent }}>
                    {active.brainScore} mind score
                  </div>
                </div>

                <div style={{ flex:1, overflowY:'auto', padding:'18px 22px', display:'flex', flexDirection:'column' }}>
                  {active.messages.map(m => <Bubble key={m.id} msg={m} C={C} />)}
                  <div ref={bottomRef} />
                </div>

                <div style={{ padding:'12px 18px', borderTop:`1px solid ${C.border}`, display:'flex', gap:9, flexShrink:0 }}>
                  <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter' && send()}
                    placeholder={`Reply to ${active.name}`}
                    style={{ flex:1, padding:'11px 14px', borderRadius:12, background:C.surfaceHi, border:`1px solid ${C.border}`, color:C.text1, fontSize:13, outline:'none' }} />
                  <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }} onClick={send}
                    style={{ width:42, height:42, borderRadius:11, background:C.accent, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:17, flexShrink:0, boxShadow:`0 4px 14px ${C.accentGlow}` }}>↑</motion.button>
                </div>
              </div>

              {/* Brain panel */}
              <div style={{ width:210, borderLeft:`1px solid ${C.border}`, padding:'20px 16px', display:'flex', flexDirection:'column', gap:18, background:C.surface, overflowY:'auto', flexShrink:0, transition:'background 0.6s' }}>
                <div style={{ fontSize:10, fontWeight:700, color:C.text3, letterSpacing:'0.09em', textTransform:'uppercase' }}>Mind Health</div>
                <div style={{ display:'flex', justifyContent:'center' }}>
                  <ScoreRing score={active.brainScore} size={120} C={C} />
                </div>
                <div style={{ height:1, background:C.border }} />
                <div style={{ fontSize:10, fontWeight:700, color:C.text3, letterSpacing:'0.08em', textTransform:'uppercase' }}>All conversations</div>
                {convs.map(c => (
                  <div key={c.id} onClick={() => setActiveId(c.id)} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', opacity: c.id === activeId ? 1 : 0.55 }}>
                    <div style={{ width:26, height:26, borderRadius:'50%', background:C.accentDim, border:`1px solid ${C.accent}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:C.accent, flexShrink:0 }}>{c.avatar}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:11, fontWeight:600, color:C.text1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.name}</div>
                      <div style={{ width:'100%', height:3, borderRadius:2, background:C.border, marginTop:3 }}>
                        <motion.div initial={{ width:0 }} animate={{ width:`${c.brainScore}%` }} transition={{ duration:0.9, ease:[0.22,1,0.36,1] }}
                          style={{ height:'100%', borderRadius:2, background:scoreColor(c.brainScore) }} />
                      </div>
                    </div>
                    <span style={{ fontSize:11, fontWeight:700, color:scoreColor(c.brainScore), flexShrink:0 }}>{c.brainScore}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── INSTANTS ── */}
          {tab === 'instants' && (
            <motion.div key="instants" initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-10 }} transition={{ duration:0.18 }}
              style={{ flex:1, padding:'26px 28px', overflowY:'auto' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:22 }}>
                <div>
                  <h1 style={{ fontSize:20, fontWeight:700, letterSpacing:'-0.02em', color:C.text1, marginBottom:2, fontFamily:"'Instrument Serif', serif", fontStyle:'italic' }}>Instants</h1>
                  <p style={{ fontSize:13, color:C.text3 }}>Real moments, unfiltered</p>
                </div>
                <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} onClick={() => setCapturing(true)}
                  style={{ padding:'9px 18px', borderRadius:11, background:C.accent, border:'none', color:'white', fontWeight:600, fontSize:13, cursor:'pointer', boxShadow:`0 4px 16px ${C.accentGlow}` }}>
                  Post Instant
                </motion.button>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:14 }}>
                <MomentTile own C={C} onPost={() => setCapturing(true)} />
                {moments.map(m => <MomentTile key={m.id} m={m} C={C} />)}
              </div>
            </motion.div>
          )}

          {/* ── BRAIN ── */}
          {tab === 'brain' && (
            <motion.div key="brain" initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-10 }} transition={{ duration:0.18 }}
              style={{ flex:1, padding:'26px 28px', overflowY:'auto', display:'flex', flexDirection:'column', gap:18 }}>

              <div>
                <h1 style={{ fontSize:20, fontWeight:700, letterSpacing:'-0.02em', color:C.text1, marginBottom:2, fontFamily:"'Instrument Serif', serif", fontStyle:'italic' }}>Brain Health</h1>
                <p style={{ fontSize:13, color:C.text3 }}>How your digital life is affecting your mind</p>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'240px 1fr', gap:16 }}>
                <div style={{ ...card(), padding:'24px 20px', display:'flex', flexDirection:'column', alignItems:'center', gap:14 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:C.text3, letterSpacing:'0.09em', textTransform:'uppercase' }}>Overall</div>
                  <ScoreRing score={avgScore} size={150} C={C} />
                  <p style={{ fontSize:12, color:C.text2, textAlign:'center', lineHeight:1.65 }}>
                    Your conversations are <strong style={{ color:scoreColor(avgScore) }}>{scoreLabel(avgScore).toLowerCase()}</strong>. Watch your Instagram feed time.
                  </p>
                </div>

                <div style={{ ...card(), padding:'20px' }}>
                  <div style={{ fontSize:13, fontWeight:600, color:C.text1, marginBottom:18 }}>Score by conversation</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
                    {convs.map(c => (
                      <div key={c.id} style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{ width:26, height:26, borderRadius:'50%', background:C.accentDim, border:`1.5px solid ${C.accent}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:C.accent, flexShrink:0 }}>{c.avatar}</div>
                        <div style={{ width:72, flexShrink:0 }}>
                          <div style={{ fontSize:12, fontWeight:600, color:C.text1 }}>{c.name}</div>
                          <div style={{ fontSize:10, color:C.text3 }}>{c.platform}</div>
                        </div>
                        <div style={{ flex:1, height:5, borderRadius:3, background:C.border }}>
                          <motion.div initial={{ width:0 }} animate={{ width:`${c.brainScore}%` }} transition={{ duration:1, ease:[0.22,1,0.36,1] }}
                            style={{ height:'100%', borderRadius:3, background:scoreColor(c.brainScore) }} />
                        </div>
                        <span style={{ fontSize:12, fontWeight:700, color:scoreColor(c.brainScore), width:26, textAlign:'right', flexShrink:0 }}>{c.brainScore}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ ...card(), padding:'20px' }}>
                <div style={{ fontSize:13, fontWeight:600, color:C.text1, marginBottom:4 }}>Feed — ranked by brain value</div>
                <div style={{ fontSize:11, color:C.text3, marginBottom:16 }}>AI-sorted content from your platforms</div>
                {FEED.map(item => <FeedCard key={item.id} item={item} C={C} />)}
              </div>

              <div style={{ padding:'20px', borderRadius:16, background:C.accentDim, border:`1px solid ${C.accent}20` }}>
                <div style={{ fontSize:13, fontWeight:600, color:C.accent, marginBottom:14 }}>Recommendations</div>
                <div style={{ display:'flex', flexDirection:'column', gap:11 }}>
                  {[
                    'You spend 45 min/day on Instagram Reels. A 20-min limit would improve your score significantly.',
                    'Your peak distraction window is 9–11 PM. Consider scheduling Do Not Disturb.',
                    'Conversations with Mom and Rahul score highest — genuine connections worth nurturing.',
                  ].map((tip, i) => (
                    <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                      <span style={{ width:5, height:5, borderRadius:'50%', background:C.accent, marginTop:6, flexShrink:0, display:'inline-block' }} />
                      <span style={{ fontSize:13, color:C.text2, lineHeight:1.62 }}>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <MomentCapture isOpen={capturing} onClose={() => setCapturing(false)} onCapture={onCapture} timeRemaining={120} />
    </div>
  )
}
