// components/ui/GlassCard.tsx

'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  glow?: 'saffron' | 'turquoise' | 'magenta' | 'none'
  hover?: boolean
}

export function GlassCard({ 
  children, 
  className = '', 
  glow = 'none',
  hover = true 
}: GlassCardProps) {
  
  const glowColors = {
    saffron: 'rgba(255, 153, 51, 0.15)',
    turquoise: 'rgba(64, 224, 208, 0.15)',
    magenta: 'rgba(255, 20, 147, 0.15)',
    none: 'transparent',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -4, scale: 1.01 } : {}}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`relative rounded-2xl overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(26, 10, 46, 0.7), rgba(26, 10, 46, 0.4))',
        backdropFilter: 'blur(40px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: `0 0 40px ${glowColors[glow]}, 0 20px 40px rgba(0,0,0,0.3)`,
      }}
    >
      {/* Top shine */}
      <div 
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
        }}
      />
      
      {children}
    </motion.div>
  )
}