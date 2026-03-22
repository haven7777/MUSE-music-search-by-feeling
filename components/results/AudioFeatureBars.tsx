'use client'

import { AudioFeatures } from '@/types'

interface AudioFeatureBarsProps {
  features: AudioFeatures
}

export function AudioFeatureBars({ features }: AudioFeatureBarsProps) {
  const bars = [
    { value: features.energy, label: 'E' },
    { value: features.valence, label: 'V' },
  ]

  return (
    <div className="flex gap-1.5 mt-2" aria-label="Audio features">
      {bars.map(({ value, label }) => (
        <div key={label} className="flex items-center gap-1">
          <div className="w-12 h-[3px] rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.round(value * 100)}%`,
                background: 'var(--muse-primary)',
                opacity: 0.7,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
