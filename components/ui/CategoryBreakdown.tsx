// components/ui/CategoryBreakdown.tsx

'use client'

import { motion } from 'framer-motion'
import { GlassCard } from './GlassCard'

interface Category {
  label: string
  score: number
  icon: string
}

interface CategoryBreakdownProps {
  categories: Category[]
}

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  const getColor = (score: number) => {
    if (score >= 70) return '#40e0d0'
    if (score >= 50) return '#ff9933'
    return '#ff1493'
  }

  return (
    <GlassCard className="p-6 w-full max-w-md">
      <h2 className="text-lg font-medium text-warm mb-6">Breakdown</h2>

      <div className="space-y-4">
        {categories.map((category, index) => (
          <motion.div
            key={category.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{category.icon}</span>
                <span className="text-sm text-warm/70">{category.label}</span>
              </div>
              <span 
                className="text-sm font-medium"
                style={{ color: getColor(category.score) }}
              >
                {category.score}
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${category.score}%` }}
                transition={{ duration: 1, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${getColor(category.score)}, ${getColor(category.score)}80)`,
                  boxShadow: `0 0 20px ${getColor(category.score)}40`,
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  )
}