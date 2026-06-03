// components/ui/StatCard.tsx

'use client'

import { motion } from 'framer-motion'
import { GlassCard } from './GlassCard'

interface StatCardProps {
  label: string
  value: string
  change?: string
  positive?: boolean
  icon: string
}

export function StatCard({ label, value, change, positive, icon }: StatCardProps) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-warm/40 uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-2xl font-light text-warm">{value}</p>
          {change && (
            <p 
              className="text-xs mt-1"
              style={{ color: positive ? '#40e0d0' : '#ff1493' }}
            >
              {positive ? '↑' : '↓'} {change}
            </p>
          )}
        </div>
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="text-2xl opacity-50"
        >
          {icon}
        </motion.div>
      </div>
    </GlassCard>
  )
}