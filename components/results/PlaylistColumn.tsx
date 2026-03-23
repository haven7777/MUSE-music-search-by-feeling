'use client'

import { useState } from 'react'
import { RankedTrack, VibeProfile } from '@/types'
import { TrackCard } from './TrackCard'
import { TrackCardSkeleton } from '@/components/shared/LoadingSkeleton'

interface PlaylistColumnProps {
  title: string
  dotColor: string
  tracks: RankedTrack[]
  vibeProfile: VibeProfile
  isLoading?: boolean
  isUnderground?: boolean
}

export function PlaylistColumn({ title, dotColor, tracks, vibeProfile, isLoading, isUnderground }: PlaylistColumnProps) {
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null)

  function handleExpand(trackId: string) {
    setExpandedCardId((prev) => (prev === trackId ? null : trackId))
  }

  const vibeKeywords = vibeProfile.sonicTexture
  const moodLabel = vibeProfile.moodLabel

  return (
    <div className="flex flex-col gap-3">
      {/* Column header */}
      <div className="mb-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dotColor }} />
          <h2
            className={`text-[0.7rem] font-mono font-bold uppercase tracking-[0.15em] ${isUnderground ? 'italic' : ''}`}
            style={{ color: 'var(--text-secondary)' }}
          >
            {title}
          </h2>
        </div>
        {isUnderground && (
          <p className="text-[0.62rem] font-mono mt-0.5 ml-4" style={{ color: 'var(--text-muted)' }}>
            Independent artists · Audius
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <TrackCardSkeleton key={i} />)
        ) : tracks.length === 0 ? (
          <div
            className="rounded-2xl p-6 text-center"
            style={{
              background: 'var(--muse-surface)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <p className="text-2xl mb-2">🎵</p>
            <p className="text-[0.8rem] font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              Still discovering gems
            </p>
            <p className="text-[0.72rem]" style={{ color: 'var(--text-muted)' }}>
              We&apos;re still finding underground tracks for this vibe. Try a different feeling or check back.
            </p>
          </div>
        ) : (
          tracks.map((track, i) => (
            <TrackCard
              key={track.track.id}
              rankedTrack={track}
              index={i}
              vibeKeywords={vibeKeywords}
              moodLabel={moodLabel}
              isExpanded={expandedCardId === track.track.id}
              onExpand={() => handleExpand(track.track.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
