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

  return (
    <div className="flex items-center gap-2 mt-2">
      <button
        onClick={handleToggle}
        aria-label={isThisPlaying ? `Pause ${title}` : `Play ${title}`}
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:scale-110 active:scale-95"
        style={{ background: 'var(--muse-primary)' }}
      >
        {isThisPlaying ? (
          <Pause className="w-3 h-3 text-white" fill="white" />
        ) : (
          <Play className="w-3 h-3 text-white" fill="white" />
        )}
      </button>

      <WaveformBars isPlaying={isThisPlaying} />

      <span className="text-[0.68rem] tabular-nums" style={{ color: 'var(--text-muted)' }}>
        {formatDuration(elapsed * 1000)} / {formatDuration(total * 1000)}
      </span>
    </div>
  )
}
