'use client'

import { motion } from 'framer-motion'
import { GlassCard } from './GlassCard'

interface InboxMessage {
  id: string
  platform: string
  sender: string
  preview: string
  time: string
  unread: boolean
}

const PLATFORM_COLORS: Record<string, string> = {
  imessage: '#30d158', whatsapp: '#25d366', instagram: '#e1306c',
  gmail: '#ea4335', discord: '#5865f2', slack: '#e01e5a',
}

const PLATFORM_ICONS: Record<string, string> = {
  imessage: '💬', whatsapp: '🟢', instagram: '📸',
  gmail: '📧', discord: '🎮', slack: '🔷',
}

export function UnifiedInbox({ messages }: { messages: InboxMessage[] }) {
  return (
    <GlassCard className="p-6 w-full">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-medium text-warm">Inbox</h2>
        <span className="text-xs text-warm/40 uppercase tracking-wider">
          {messages.filter(m => m.unread).length} unread
        </span>
      </div>
      <div className="space-y-3">
        {messages.map((msg, i) => {
          const color = PLATFORM_COLORS[msg.platform] ?? '#ff9933'
          const icon  = PLATFORM_ICONS[msg.platform] ?? '✉'
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
              whileHover={{ background: 'rgba(255,255,255,0.06)' }}
            >
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${color}18`, border: `1.5px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color, flexShrink: 0 }}>
                {msg.sender[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#f5f0e8' }}>{msg.sender}</span>
                  <span style={{ fontSize: 10, color: 'rgba(245,240,232,0.3)' }}>{msg.time}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11 }}>{icon}</span>
                  <span style={{ fontSize: 12, color: 'rgba(245,240,232,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.preview}</span>
                  {msg.unread && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff9933', flexShrink: 0, marginLeft: 'auto' }} />}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </GlassCard>
  )
}