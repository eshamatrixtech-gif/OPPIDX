// components/ui/MomentCapture.tsx

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { GlassCard } from './GlassCard'

interface MomentCaptureProps {
  isOpen: boolean
  onClose: () => void
  onCapture: (frontImage: string, backImage: string, caption: string) => void
  timeRemaining?: number // seconds remaining to capture
}

export function MomentCapture({ isOpen, onClose, onCapture, timeRemaining = 120 }: MomentCaptureProps) {
  const [step, setStep] = useState<'back' | 'front' | 'preview'>('back')
  const [backImage, setBackImage] = useState<string | null>(null)
  const [frontImage, setFrontImage] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Start camera
  useEffect(() => {
    if (!isOpen) return

    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: step === 'front' ? 'user' : 'environment' },
          audio: false,
        })
        setStream(mediaStream)
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      } catch (err) {
        console.error('Camera error:', err)
      }
    }

    startCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [isOpen, step])

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Flip horizontally for front camera
    if (step === 'front') {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }

    ctx.drawImage(video, 0, 0)
    const imageData = canvas.toDataURL('image/jpeg', 0.8)

    if (step === 'back') {
      setBackImage(imageData)
      setStep('front')
    } else if (step === 'front') {
      setFrontImage(imageData)
      setStep('preview')
    }
  }

  const handleSubmit = () => {
    if (frontImage && backImage) {
      onCapture(frontImage, backImage, caption)
      resetState()
      onClose()
    }
  }

  const resetState = () => {
    setStep('back')
    setBackImage(null)
    setFrontImage(null)
    setCaption('')
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(10, 5, 18, 0.95)' }}
        >
          {/* Timer */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              background: timeRemaining < 30 ? 'rgba(196, 30, 58, 0.3)' : 'rgba(255, 153, 51, 0.2)',
              border: `1px solid ${timeRemaining < 30 ? 'rgba(196, 30, 58, 0.5)' : 'rgba(255, 153, 51, 0.3)'}`,
            }}
          >
            <span className="text-sm" style={{ color: timeRemaining < 30 ? '#c41e3a' : '#ff9933' }}>
              ⏱ {formatTime(timeRemaining)}
            </span>
          </motion.div>

          {/* Close button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => { resetState(); onClose(); }}
            className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center text-warm/50"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            ✕
          </motion.button>

          <div className="w-full max-w-md">
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {['back', 'front', 'preview'].map((s, i) => (
                <div
                  key={s}
                  className="flex items-center gap-2"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
                    style={{
                      background: step === s ? 'linear-gradient(135deg, #ff9933, #ff1493)' : 'rgba(255,255,255,0.1)',
                      color: step === s ? 'white' : 'rgba(255,255,255,0.4)',
                    }}
                  >
                    {i + 1}
                  </div>
                  {i < 2 && <div className="w-8 h-px bg-white/10" />}
                </div>
              ))}
            </div>

            {/* Camera / Preview */}
            {step !== 'preview' ? (
              <motion.div
                key={step}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-[3/4] rounded-3xl overflow-hidden mb-6"
                style={{
                  background: 'linear-gradient(135deg, rgba(26, 10, 46, 0.8), rgba(26, 10, 46, 0.6))',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ transform: step === 'front' ? 'scaleX(-1)' : 'none' }}
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Instruction */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
                  <p className="text-white/80 text-sm font-medium mb-1">
                    {step === 'back' ? 'Capture your view' : 'Now capture yourself'}
                  </p>
                  <p className="text-white/40 text-xs">
                    {step === 'back' ? 'What are you looking at?' : 'Show us your reaction'}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-[3/4] rounded-3xl overflow-hidden mb-6"
                style={{
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                {/* Back image (main) */}
                <img
                  src={backImage!}
                  alt="captured"
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Front image (small) */}
                <div
                  className="absolute top-3 left-3 w-20 h-28 rounded-xl overflow-hidden"
                  style={{
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                  }}
                >
                  <img
                    src={frontImage!}
                    alt="selfie"
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            )}

            {/* Caption input (preview step) */}
            {step === 'preview' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add a caption..."
                  maxLength={100}
                  className="w-full px-4 py-3 rounded-xl text-sm text-warm placeholder-warm/30 outline-none"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                />
              </motion.div>
            )}

            {/* Action button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={step === 'preview' ? handleSubmit : capturePhoto}
              className="w-full py-4 rounded-2xl text-white font-medium"
              style={{
                background: 'linear-gradient(135deg, #ff9933, #ff1493)',
                boxShadow: '0 10px 40px rgba(255, 153, 51, 0.3)',
              }}
            >
              {step === 'back' && '📸 Capture View'}
              {step === 'front' && '🤳 Capture Selfie'}
              {step === 'preview' && '✨ Share Moment'}
            </motion.button>

            {/* Retake button (preview step) */}
            {step === 'preview' && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => { setStep('back'); setBackImage(null); setFrontImage(null); }}
                className="w-full py-3 mt-3 rounded-xl text-warm/50 text-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                Retake
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
