'use client'

import { Pause, Play } from 'lucide-react'
import { useAudio } from '@/components/shared/AudioContext'
import { formatDuration } from '@/lib/utils'
import { WaveformBars } from './WaveformBars'

interface MiniPlayerProps {
  previewUrl: string
  trackId: string
  title: string
}

export function MiniPlayer({ previewUrl, trackId, title }: MiniPlayerProps) {
  const { play, pause, currentTrackId, isPlaying, currentTime, duration } = useAudio()
  const isThisPlaying = currentTrackId === trackId && isPlaying

  function handleToggle() {
    if (isThisPlaying) {
      pause()
    } else {
      play(trackId, previewUrl)
    }
  }

  const elapsed = currentTrackId === trackId ? currentTime : 0
  const total = currentTrackId === trackId && duration > 0 ? duration : 30
  const progress = total > 0 ? (elapsed / total) * 100 : 0

  return (
    <div className="flex items-center gap-2.5 mt-2">
      <button
        onClick={handleToggle}
        aria-label={isThisPlaying ? `Pause ${title}` : `Play ${title}`}
        className="flex items-center justify-center flex-shrink-0 transition-all hover:scale-110 active:scale-95"
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: 'var(--muse-primary)',
          boxShadow: isThisPlaying
            ? '0 0 12px rgba(var(--muse-primary-rgb), 0.5)'
            : 'none',
          transition: 'box-shadow 0.3s ease',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {isThisPlaying ? (
          <Pause style={{ width: '14px', height: '14px', color: 'white', fill: 'white' }} />
        ) : (
          <Play style={{ width: '14px', height: '14px', color: 'white', fill: 'white' }} />
        )}
      </button>

      {isThisPlaying && <WaveformBars isPlaying={isThisPlaying} />}

      {/* Progress track */}
      <div
        className="flex-1"
        style={{
          height: '2px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '1px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: 'var(--muse-primary)',
            borderRadius: '1px',
            transition: 'width 0.25s linear',
          }}
        />
      </div>

      <span
        className="flex-shrink-0"
        style={{
          fontFamily: 'var(--font-geist-mono)',
          fontSize: '0.65rem',
          color: 'var(--text-muted)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {formatDuration(elapsed * 1000)} / {formatDuration(total * 1000)}
      </span>
    </div>
  )
}
