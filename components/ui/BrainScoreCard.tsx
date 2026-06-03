// components/ui/BrainScoreCard.tsx

'use client'

import { motion, useSpring, useTransform } from 'framer-motion'
import { useEffect } from 'react'
import { GlassCard } from './GlassCard'

interface BrainScoreCardProps {
  score: number
  label: string
  insight: string
}

export function BrainScoreCard({ score, label, insight }: BrainScoreCardProps) {
  const springScore = useSpring(0, { stiffness: 40, damping: 20 })
  const displayScore = useTransform(springScore, (val) => Math.round(val))

  useEffect(() => {
    springScore.set(score)
  }, [score, springScore])

  const getGlow = (s: number) => {
    if (s >= 70) return 'turquoise'
    if (s >= 50) return 'saffron'
    return 'magenta'
  }

  const getColor = (s: number) => {
    if (s >= 70) return '#40e0d0'
    if (s >= 50) return '#ff9933'
    return '#ff1493'
  }

  return (
    <GlassCard glow={getGlow(score)} className="p-8 max-w-sm mx-auto">
      <div className="flex flex-col items-center text-center">
        
        {/* Header */}
        <span className="text-xs uppercase tracking-[0.25em] text-warm/40 mb-6">
          Mind Wellness
        </span>

        {/* Score Ring */}
        <div className="relative mb-6">
          {/* Glow */}
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0 rounded-full blur-2xl"
            style={{ background: getColor(score) }}
          />

          <svg className="w-40 h-40" viewBox="0 0 160 160">
            {/* Mandala dots */}
            {[...Array(24)].map((_, i) => (
              <motion.circle
                key={i}
                cx={80 + 70 * Math.cos((i * 15 * Math.PI) / 180)}
                cy={80 + 70 * Math.sin((i * 15 * Math.PI) / 180)}
                r="1.5"
                fill="#ff9933"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ delay: i * 0.03 }}
              />
            ))}

            {/* Background ring */}
            <circle
              cx="80"
              cy="80"
              r="55"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="6"
            />

            {/* Progress ring */}
            <motion.circle
              cx="80"
              cy="80"
              r="55"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={345}
              initial={{ strokeDashoffset: 345 }}
              animate={{ strokeDashoffset: 345 - (345 * score) / 100 }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
            />

            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff9933" />
                <stop offset="50%" stopColor="#ff1493" />
                <stop offset="100%" stopColor="#40e0d0" />
              </linearGradient>
            </defs>
          </svg>

          {/* Score display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span className="text-5xl font-light text-warm">
              {displayScore}
            </motion.span>
          </div>
        </div>

        {/* Label pill */}
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="px-4 py-1.5 rounded-full text-sm mb-4"
          style={{
            background: `${getColor(score)}20`,
            border: `1px solid ${getColor(score)}40`,
            color: getColor(score),
          }}
        >
          {label}
        </motion.span>

        {/* Insight */}
        <p className="text-warm/50 text-sm leading-relaxed max-w-xs">
          {insight}
        </p>
      </div>
    </GlassCard>
  )
}