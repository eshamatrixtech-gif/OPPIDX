// components/ui/MomentCard.tsx

'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

interface MomentCardProps {
  id: string
  username: string
  avatar?: string
  frontImage: string
  backImage: string
  caption?: string
  timestamp: string
  location?: string
  reactions?: { emoji: string; count: number }[]
}

export function MomentCard({
  username,
  avatar,
  frontImage,
  backImage,
  caption,
  timestamp,
  location,
  reactions = [],
}: MomentCardProps) {
  const [flipped, setFlipped] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-sm mx-auto"
    >
      {/* User Header */}
      <div className="flex items-center gap-3 mb-3">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium"
          style={{
            background: 'linear-gradient(135deg, #ff9933, #ff1493)',
          }}
        >
          {avatar || username[0].toUpperCase()}
        </div>
        <div className="flex-1">
          <p className="text-warm text-sm font-medium">{username}</p>
          <p className="text-warm/40 text-xs">
            {timestamp} {location && `· ${location}`}
          </p>
        </div>
        <div className="text-warm/30 text-xs uppercase tracking-wider">
          Satya
        </div>
      </div>

      {/* Image Container */}
      <motion.div
        className="relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer"
        onClick={() => setFlipped(!flipped)}
        style={{
          background: 'linear-gradient(135deg, rgba(26, 10, 46, 0.8), rgba(26, 10, 46, 0.6))',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Main Image (Back Camera) */}
        <motion.img
          src={backImage}
          alt="moment"
          className="absolute inset-0 w-full h-full object-cover"
          animate={{ opacity: flipped ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        />

        {/* Flipped Image (Front Camera) */}
        <motion.img
          src={frontImage}
          alt="selfie"
          className="absolute inset-0 w-full h-full object-cover"
          animate={{ opacity: flipped ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Small Preview (opposite of current view) */}
        <motion.div
          className="absolute top-3 left-3 w-20 h-28 rounded-xl overflow-hidden"
          style={{
            border: '2px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <img
            src={flipped ? backImage : frontImage}
            alt="preview"
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Tap hint */}
        <div className="absolute bottom-3 right-3 text-white/50 text-xs bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm">
          Tap to flip
        </div>

        {/* Late indicator (if posted late) */}
        {/* <div className="absolute top-3 right-3 text-xs bg-earth/80 text-white px-2 py-1 rounded-full">
          2h late
        </div> */}
      </motion.div>

      {/* Caption */}
      {caption && (
        <p className="text-warm/70 text-sm mt-3 leading-relaxed">
          {caption}
        </p>
      )}

      {/* Reactions */}
      <div className="flex items-center gap-2 mt-3">
        {reactions.map((reaction, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <span>{reaction.emoji}</span>
            <span className="text-warm/50 text-xs">{reaction.count}</span>
          </motion.button>
        ))}
        
        {/* Add reaction button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-8 h-8 rounded-full flex items-center justify-center text-warm/30"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          +
        </motion.button>
      </div>
    </motion.div>
  )
}