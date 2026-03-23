'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useAudio } from '@/components/shared/AudioContext'

export function NowPlayingBar() {
  const { isPlaying, progress } = useAudio()

  return (
    <AnimatePresence>
      {isPlaying && (
        <motion.div
          key="now-playing-bar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: '3px',
            zIndex: 50,
            background: 'var(--depth-1)',
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        >
          {/* Progress fill */}
          <motion.div
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, var(--muse-primary), var(--muse-secondary))',
              transformOrigin: 'left',
            }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.1, ease: 'linear' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
