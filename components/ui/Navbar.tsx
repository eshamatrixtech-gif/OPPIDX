// components/ui/Navbar.tsx

'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

const navItems = [
  { id: 'home', label: 'Home', icon: '◉' },
  { id: 'inbox', label: 'Inbox', icon: '✉' },
  { id: 'feed', label: 'Feed', icon: '◫' },
  { id: 'insights', label: 'Insights', icon: '✧' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
]

export function Navbar() {
  const [active, setActive] = useState('home')

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
    >
      <div 
        className="flex items-center gap-1 px-2 py-2 rounded-full"
        style={{
          background: 'linear-gradient(135deg, rgba(26, 10, 46, 0.8), rgba(26, 10, 46, 0.6))',
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
        }}
      >
        {navItems.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => setActive(item.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative px-4 py-2 rounded-full text-sm transition-colors"
            style={{
              color: active === item.id ? '#ff9933' : 'rgba(255,248,240,0.6)',
            }}
          >
            {active === item.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'rgba(255, 153, 51, 0.15)',
                  border: '1px solid rgba(255, 153, 51, 0.3)',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <span>{item.icon}</span>
              <span className="hidden sm:inline">{item.label}</span>
            </span>
          </motion.button>
        ))}
      </div>
    </motion.nav>
  )
}