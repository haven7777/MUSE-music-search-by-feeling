'use client'

import { motion } from 'framer-motion'
import { X } from 'lucide-react'

interface ListeningPillProps {
  onStop: () => void
}

export function ListeningPill({ onStop }: ListeningPillProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-2.5 px-4 py-2 rounded-full z-10"
      style={{
        background: 'rgba(10,10,20,0.85)',
        border: '1px solid rgba(var(--muse-primary-rgb, 139,92,246), 0.4)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        whiteSpace: 'nowrap',
      }}
    >
      {/* Pulsing dot */}
      <span className="relative flex h-2 w-2">
        <span
          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
          style={{ background: 'var(--muse-primary, #8b5cf6)' }}
        />
        <span
          className="relative inline-flex rounded-full h-2 w-2"
          style={{ background: 'var(--muse-primary, #8b5cf6)' }}
        />
      </span>

      <span
        className="text-[0.75rem] font-medium"
        style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'var(--font-geist-mono)' }}
      >
        Listening...
      </span>

      <button
        type="button"
        onClick={onStop}
        aria-label="Stop listening"
        className="flex items-center justify-center w-4 h-4 rounded-full opacity-60 hover:opacity-100 transition-opacity"
        style={{ color: 'white' }}
      >
        <X className="w-3 h-3" />
      </button>
    </motion.div>
  )
}
