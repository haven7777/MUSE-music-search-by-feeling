'use client'

import { Pause, Play } from 'lucide-react'
import { useAudio } from '@/components/shared/AudioContext'
import { formatDuration } from '@/lib/utils'
import { WaveformProgress } from './WaveformProgress'

interface FullPlayerProps {
  streamUrl: string
  trackId: string
  title: string
  durationMs: number
}

export function FullPlayer({ streamUrl, trackId, title, durationMs }: FullPlayerProps) {
  const { play, pause, seek, currentTrackId, isPlaying, progress, currentTime, duration } =
    useAudio()

  const isThisPlaying = currentTrackId === trackId && isPlaying
  const isThisTrack = currentTrackId === trackId

  function handleToggle() {
    if (isThisPlaying) {
      pause()
    } else {
      play(trackId, streamUrl)
    }
  }

  const displayProgress = isThisTrack ? progress : 0
  const elapsed = isThisTrack && duration > 0 ? currentTime : 0
  const total = isThisTrack && duration > 0 ? duration : durationMs / 1000

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

      <WaveformProgress
        progress={displayProgress}
        isPlaying={isThisPlaying}
        seekable={isThisTrack}
        onSeek={isThisTrack ? seek : undefined}
        barCount={45}
      />

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
