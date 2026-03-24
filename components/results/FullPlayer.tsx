'use client'

import { Pause, Play } from 'lucide-react'
import { useRef } from 'react'
import { useAudio } from '@/components/shared/AudioContext'
import { formatDuration } from '@/lib/utils'
import { WaveformBars } from './WaveformBars'

interface FullPlayerProps {
  streamUrl: string
  trackId: string
  title: string
  durationMs: number
}

export function FullPlayer({ streamUrl, trackId, title, durationMs }: FullPlayerProps) {
  const { play, pause, seek, currentTrackId, isPlaying, progress, currentTime, duration } =
    useAudio()
  const barRef = useRef<HTMLDivElement>(null)

  const isThisPlaying = currentTrackId === trackId && isPlaying
  const isThisTrack = currentTrackId === trackId

  function handleToggle() {
    if (isThisPlaying) {
      pause()
    } else {
      play(trackId, streamUrl)
    }
  }

  function handleBarKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (!isThisTrack || !duration) return
    if (e.key === 'ArrowRight') seek(Math.min(progress + 5 / duration, 1))
    else if (e.key === 'ArrowLeft') seek(Math.max(progress - 5 / duration, 0))
  }

  function handleBarClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!barRef.current || !isThisTrack) return
    const rect = barRef.current.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    seek(Math.min(Math.max(ratio, 0), 1))
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
          width: '34px',
          height: '34px',
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
          <Pause style={{ width: '12px', height: '12px', color: 'white', fill: 'white' }} />
        ) : (
          <Play style={{ width: '12px', height: '12px', color: 'white', fill: 'white' }} />
        )}
      </button>

      {isThisPlaying && <WaveformBars isPlaying={isThisPlaying} />}

      {/* Interactive seekable progress bar */}
      <div
        ref={barRef}
        onClick={handleBarClick}
        onKeyDown={handleBarKeyDown}
        tabIndex={isThisTrack ? 0 : -1}
        className="flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-1"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(displayProgress * 100)}
        aria-label={`${title} progress — use arrow keys to seek`}
        style={{
          height: '6px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '3px',
          cursor: 'pointer',
          overflow: 'hidden',
          padding: '8px 0',
          backgroundClip: 'content-box',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${displayProgress * 100}%`,
            background: 'var(--muse-primary)',
            borderRadius: '2px',
            transition: 'width 100ms linear',
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
