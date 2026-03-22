'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface ProcessingStateProps {
  keywords: string[]
}

export function ProcessingState({ keywords }: ProcessingStateProps) {
  const [progress, setProgress] = useState(0)

  // Fake progress: slowly fills to 85%, jumps to 100 on completion
  useEffect(() => {
    const intervals: ReturnType<typeof setTimeout>[] = []
    const steps = [
      { to: 20, after: 300 },
      { to: 45, after: 900 },
      { to: 65, after: 1800 },
      { to: 80, after: 3000 },
      { to: 85, after: 4500 },
    ]
    steps.forEach(({ to, after }) => {
      intervals.push(setTimeout(() => setProgress(to), after))
    })
    return () => intervals.forEach(clearTimeout)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-8 py-12"
    >
      {/* Animated waveform orb */}
      <div className="relative flex items-center justify-center w-32 h-32">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 60 + i * 28,
              height: 60 + i * 28,
              background: `color-mix(in srgb, var(--muse-primary) ${18 - i * 5}%, transparent)`,
              border: `1px solid color-mix(in srgb, var(--muse-primary) ${25 - i * 7}%, transparent)`,
            }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.25, 0.6] }}
            transition={{ duration: 2.2, delay: i * 0.35, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
        {/* Center waveform bars */}
        <div className="relative z-10 flex items-center gap-[3px]">
          {[0.5, 0.8, 1, 0.7, 0.9, 0.6, 1].map((h, i) => (
            <motion.div
              key={i}
              className="w-[4px] rounded-full"
              style={{ background: 'var(--muse-primary)' }}
              animate={{ scaleY: [h, h * 0.4, h] }}
              transition={{
                duration: 0.8,
                delay: i * 0.1,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              initial={{ height: 20, originY: 0.5 }}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 text-center">
        <motion.p
          className="text-lg font-medium"
          style={{ color: 'var(--muse-text)' }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          MUSE is feeling your moment…
        </motion.p>

        {/* Progress bar */}
        <div className="w-48 h-[2px] rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'var(--muse-primary)' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>

        {/* Keywords — staggered fade in */}
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center max-w-sm">
            {keywords.map((kw, i) => (
              <motion.span
                key={kw}
                initial={{ opacity: 0, scale: 0.85, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: i * 0.12, duration: 0.3, ease: 'easeOut' }}
                className="px-3 py-1 rounded-full text-[0.7rem] font-mono font-bold uppercase tracking-widest"
                style={{
                  background: 'color-mix(in srgb, var(--muse-primary) 15%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--muse-primary) 25%, transparent)',
                  color: 'var(--muse-primary)',
                }}
              >
                {kw}
              </motion.span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
