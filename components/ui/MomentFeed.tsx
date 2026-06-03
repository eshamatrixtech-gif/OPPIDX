// components/ui/MomentFeed.tsx

'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { MomentCard } from './MomentCard'
import { MomentCapture } from './MomentCapture'
import { GlassCard } from './GlassCard'

interface Moment {
  id: string
  username: string
  avatar?: string
  frontImage: string
  backImage: string
  caption?: string
  timestamp: string
  location?: string
  reactions: { emoji: string; count: number }[]
}

// Mock data
const mockMoments: Moment[] = [
  {
    id: '1',
    username: 'Priya',
    frontImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    backImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    caption: 'Morning chai with this view ☕️',
    timestamp: '2 min ago',
    location: 'Mumbai',
    reactions: [{ emoji: '❤️', count: 3 }, { emoji: '🔥', count: 1 }],
  },
  {
    id: '2',
    username: 'Rahul',
    frontImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    backImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
    caption: 'Finally learned to cook 😅',
    timestamp: '15 min ago',
    location: 'Delhi',
    reactions: [{ emoji: '😂', count: 5 }, { emoji: '👏', count: 2 }],
  },
  {
    id: '3',
    username: 'Ananya',
    frontImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    backImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
    caption: 'Grind never stops 💻',
    timestamp: '1 hr ago',
    reactions: [{ emoji: '💪', count: 4 }],
  },
]

export function MomentFeed() {
  const [moments, setMoments] = useState<Moment[]>(mockMoments)
  const [captureOpen, setCaptureOpen] = useState(false)
  const [hasPostedToday, setHasPostedToday] = useState(false)

  const handleCapture = (frontImage: string, backImage: string, caption: string) => {
    const newMoment: Moment = {
      id: Date.now().toString(),
      username: 'You',
      frontImage,
      backImage,
      caption,
      timestamp: 'Just now',
      reactions: [],
    }
    setMoments([newMoment, ...moments])
    setHasPostedToday(true)
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-light text-warm">Satya</h2>
          <p className="text-warm/40 text-xs uppercase tracking-wider">Moments of truth</p>
        </div>

        {!hasPostedToday && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCaptureOpen(true)}
            className="px-4 py-2 rounded-full text-sm font-medium"
            style={{
              background: 'linear-gradient(135deg, #ff9933, #ff1493)',
              boxShadow: '0 4px 20px rgba(255, 153, 51, 0.3)',
            }}
          >
            ✨ Share Yours
          </motion.button>
        )}
      </div>

      {/* Notification Card (if user hasn't posted) */}
      {!hasPostedToday && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <GlassCard glow="saffron" className="p-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 153, 51, 0.2), rgba(255, 20, 147, 0.2))',
                }}
              >
                📸
              </div>
              <div className="flex-1">
                <p className="text-warm text-sm font-medium">Time for Satya!</p>
                <p className="text-warm/50 text-xs">Share your genuine moment to see friends</p>
              </div>
              <div className="text-saffron text-sm font-medium">
                1:58
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Blurred overlay if user hasn't posted */}
      <div className={!hasPostedToday ? 'relative' : ''}>
        {!hasPostedToday && (
          <div 
            className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl"
            style={{
              background: 'rgba(10, 5, 18, 0.7)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div className="text-center p-6">
              <p className="text-warm/70 text-sm mb-3">Post your Satya to see friends</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCaptureOpen(true)}
                className="px-6 py-3 rounded-full text-sm font-medium text-white"
                style={{
                  background: 'linear-gradient(135deg, #ff9933, #ff1493)',
                }}
              >
                📸 Capture Now
              </motion.button>
            </div>
          </div>
        )}

        {/* Feed */}
        <div className="space-y-8">
          {moments.map((moment, index) => (
            <motion.div
              key={moment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <MomentCard {...moment} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Capture Modal */}
      <MomentCapture
        isOpen={captureOpen}
        onClose={() => setCaptureOpen(false)}
        onCapture={handleCapture}
        timeRemaining={118}
      />
    </div>
  )
}
