'use client'

import { useRef } from 'react'

interface WaveformProgressProps {
  progress: number // 0–1
  isPlaying: boolean
  onSeek?: (ratio: number) => void
  seekable?: boolean
  barCount?: number
}

// Generate deterministic pseudo-random heights for the bars
function generateBarHeights(count: number): number[] {
  const heights: number[] = []
  for (let i = 0; i < count; i++) {
    // Deterministic pattern that looks organic
    const base = 0.3
    const wave1 = Math.sin(i * 0.7) * 0.25
    const wave2 = Math.cos(i * 1.3) * 0.15
    const wave3 = Math.sin(i * 2.1 + 1) * 0.1
    heights.push(Math.min(1, Math.max(0.15, base + wave1 + wave2 + wave3)))
  }
  return heights
}

export function WaveformProgress({ progress, isPlaying, onSeek, seekable, barCount = 40 }: WaveformProgressProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const heights = useRef(generateBarHeights(barCount)).current

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!onSeek || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    onSeek(Math.min(Math.max(ratio, 0), 1))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (!onSeek) return
    if (e.key === 'ArrowRight') onSeek(Math.min(progress + 0.02, 1))
    else if (e.key === 'ArrowLeft') onSeek(Math.max(progress - 0.02, 0))
  }

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={seekable ? 0 : -1}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      className="flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-1"
      style={{
        display: 'flex',
        alignItems: 'end',
        gap: '1.5px',
        height: '28px',
        cursor: seekable ? 'pointer' : 'default',
        padding: '2px 0',
      }}
    >
      {heights.map((h, i) => {
        const barProgress = i / barCount
        const isFilled = barProgress < progress
        const isEdge = Math.abs(barProgress - progress) < 1 / barCount

        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${h * 100}%`,
              borderRadius: '1.5px',
              background: isFilled
                ? 'var(--muse-primary)'
                : 'rgba(255,255,255,0.12)',
              opacity: isEdge ? 0.7 : isFilled ? 1 : 0.5,
              transform: isPlaying && isFilled
                ? `scaleY(${0.7 + Math.sin(Date.now() / 300 + i * 0.5) * 0.3})`
                : 'scaleY(1)',
              transformOrigin: 'bottom',
              transition: 'background 0.1s ease, opacity 0.15s ease',
              animation: isPlaying && isFilled
                ? `waveBar ${0.5 + (i % 5) * 0.1}s ease-in-out ${(i % 7) * 0.05}s infinite`
                : 'none',
            }}
          />
        )
      })}
    </div>
  )
}
