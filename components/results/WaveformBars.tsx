'use client'

interface WaveformBarsProps {
  isPlaying: boolean
  color?: string
}

export function WaveformBars({ isPlaying, color }: WaveformBarsProps) {
  const bars = [0.4, 0.7, 1.0, 0.6, 0.85, 0.5]

  return (
    <div className="flex items-center gap-[2px] h-4" aria-hidden="true">
      {bars.map((baseHeight, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full transition-all"
          style={{
            height: isPlaying ? undefined : `${Math.floor(baseHeight * 12)}px`,
            background: color ?? 'var(--muse-primary)',
            animation: isPlaying ? `waveform${i + 1} ${0.6 + i * 0.1}s ease-in-out infinite alternate` : 'none',
            minHeight: '3px',
            maxHeight: '14px',
          }}
        />
      ))}
    </div>
  )
}
