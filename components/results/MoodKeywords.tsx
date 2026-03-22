'use client'

import { motion } from 'framer-motion'

interface MoodKeywordsProps {
  keywords: string[]
}

export function MoodKeywords({ keywords }: MoodKeywordsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {keywords.map((kw, i) => (
        <motion.span
          key={kw}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.3 }}
          className="px-3 py-1 rounded-full text-[0.72rem] font-medium"
          style={{
            background: 'color-mix(in srgb, var(--muse-primary) 12%, transparent)',
            border: '1px solid color-mix(in srgb, var(--muse-primary) 28%, transparent)',
            color: 'var(--muse-primary)',
          }}
        >
          {kw}
        </motion.span>
      ))}
    </div>
  )
}
