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

  const barHeights = [20, 35, 50, 45, 60, 40, 28]
  const barDurations = ['0.6s', '0.9s', '0.7s', '1.1s', '0.8s', '1.0s', '0.65s']
  const barDelays = ['0s', '0.1s', '0.2s', '0.15s', '0.05s', '0.25s', '0.3s']

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-8 py-16"
    >
      {/* Label above visualizer */}
      <motion.p
        animate={{ opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          fontFamily: 'var(--font-syne)',
          fontWeight: 600,
          fontSize: '0.82rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.4)',
          margin: 0,
        }}
      >
        MUSE IS FEELING YOUR MOMENT
      </motion.p>

      {/* Equalizer visualizer */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
        {/* Ambient glow behind bars */}
        <div
          style={{
            position: 'absolute',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle at center, var(--muse-primary) 15%, transparent 70%)',
            opacity: 0.12,
            filter: 'blur(18px)',
            pointerEvents: 'none',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
        <div
          className="flex items-end gap-[3px]"
          style={{ height: '64px', position: 'relative', zIndex: 1 }}
        >
          {barHeights.map((height, i) => (
            <div
              key={i}
              style={{
                width: '4px',
                height: `${height}px`,
                borderRadius: '2px',
                background: 'var(--muse-primary)',
                transformOrigin: 'bottom',
                animation: `waveBar ${barDurations[i]} ease-in-out ${barDelays[i]} infinite`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        {/* Progress bar */}
        <div
          style={{
            width: '180px',
            height: '2px',
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '1px',
            overflow: 'hidden',
          }}
        >
          <motion.div
            style={{ height: '100%', background: 'var(--muse-primary)', borderRadius: '1px' }}
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
                style={{
                  fontFamily: 'var(--font-geist-mono)',
                  fontSize: '0.68rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  padding: '0.3rem 0.7rem',
                  border: '1px solid rgba(var(--muse-primary-rgb), 0.3)',
                  background: 'rgba(var(--muse-primary-rgb), 0.08)',
                  borderRadius: '4px',
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
