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
  showHeader?: boolean
}

export function PlaylistColumn({ title, dotColor, tracks, vibeProfile, isLoading, isUnderground, showHeader = true }: PlaylistColumnProps) {
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null)

  function handleExpand(trackId: string) {
    setExpandedCardId((prev) => (prev === trackId ? null : trackId))
  }

  const vibeKeywords = vibeProfile.sonicTexture
  const moodLabel = vibeProfile.moodLabel

  return (
    <div className="flex flex-col gap-3">
      {/* Column header */}
      {showHeader && (
        <div className="mb-1">
          <div className="flex items-center gap-2">
            {/* Thin vertical bar */}
            <div
              style={{
                width: '2px',
                height: '18px',
                background: dotColor,
                borderRadius: '1px',
                flexShrink: 0,
              }}
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h2
                  style={{
                    fontFamily: 'var(--font-geist-mono)',
                    fontSize: '0.65rem',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    fontWeight: 400,
                  }}
                >
                  {title}
                </h2>
                {tracks.length > 0 && (
                  <span
                    style={{
                      fontFamily: 'var(--font-geist-mono)',
                      fontSize: '0.62rem',
                      letterSpacing: '0.1em',
                      color: 'var(--text-muted)',
                      opacity: 0.6,
                    }}
                  >
                    ({tracks.length} tracks)
                  </span>
                )}
              </div>
              {isUnderground && (
                <p
                  style={{
                    fontFamily: 'var(--font-geist-mono)',
                    fontSize: '0.58rem',
                    letterSpacing: '0.1em',
                    color: 'var(--text-muted)',
                    opacity: 0.55,
                    marginTop: '0.15rem',
                    textTransform: 'uppercase',
                  }}
                >
                  Independent · Audius
                </p>
              )}
            </div>
          </div>
        </div>
      )}

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
