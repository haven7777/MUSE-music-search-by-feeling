'use client'

interface WaveformBarsProps {
  isPlaying: boolean
  color?: string
}

export function WaveformBars({ isPlaying, color }: WaveformBarsProps) {
  // Heights in px when paused (frozen at mid-height)
  const bars = [
    { height: 12, duration: '0.7s', delay: '0s' },
    { height: 18, duration: '0.5s', delay: '0.1s' },
    { height: 14, duration: '0.9s', delay: '0.05s' },
    { height: 20, duration: '0.6s', delay: '0.15s' },
    { height: 16, duration: '0.8s', delay: '0.08s' },
  ]

  return (
    <div
      className="flex items-end gap-[2px]"
      style={{ height: '20px' }}
      aria-hidden="true"
    >
      {bars.map((bar, i) => (
        <div
          key={i}
          style={{
            width: '3px',
            height: `${bar.height}px`,
            borderRadius: '2px',
            background: color ?? 'var(--muse-primary)',
            transformOrigin: 'bottom',
            animation: isPlaying
              ? `waveBar ${bar.duration} ease-in-out ${bar.delay} infinite`
              : 'none',
            opacity: isPlaying ? 1 : 0.35,
            transition: 'opacity 0.3s ease',
          }}
        />
      ))}
    </div>
  )
}
