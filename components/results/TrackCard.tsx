'use client'

import { ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'
import { AudiusTrack, RankedTrack, SpotifyTrackData } from '@/types'
import { formatCount, truncateTitle } from '@/lib/utils'
import { useAudio } from '@/components/shared/AudioContext'
import { AudioFeatureBars } from './AudioFeatureBars'
import { ExplanationText } from './ExplanationText'
import { FullPlayer } from './FullPlayer'
import { MiniPlayer } from './MiniPlayer'

interface TrackCardProps {
  rankedTrack: RankedTrack
  index: number
}

function SpotifyIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="#1DB954" aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#1DB954" />
      <path d="M17.9 10.9C14.7 9 9.35 8.8 6.3 9.75c-.5.15-1-.15-1.15-.6-.15-.5.15-1 .6-1.15 3.55-1.05 9.4-.85 13.1 1.35.45.25.6.85.35 1.3-.25.35-.85.5-1.3.25zm-.1 2.8c-.25.35-.7.5-1.05.25-2.7-1.65-6.8-2.15-9.95-1.15-.4.1-.85-.1-.95-.5-.1-.4.1-.85.5-.95 3.65-1.1 8.15-.55 11.25 1.35.3.15.45.65.2 1zm-1.2 2.75c-.2.3-.55.4-.85.2-2.35-1.45-5.3-1.75-8.8-.95-.3.1-.65-.1-.75-.45-.1-.3.1-.65.45-.75 3.8-.85 7.1-.5 9.7 1.1.35.15.4.55.25.85z" fill="white" />
    </svg>
  )
}

function AudiusIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#CC0FE0" />
      <text x="12" y="16" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">A</text>
    </svg>
  )
}

export function TrackCard({ rankedTrack, index }: TrackCardProps) {
  const { source, explanation, track } = rankedTrack
  const { currentTrackId, isPlaying } = useAudio()
  const isSpotify = source === 'spotify'

  const spotifyTrack = isSpotify ? (track as SpotifyTrackData) : null
  const audiusTrack = !isSpotify ? (track as AudiusTrack) : null

  const rawTitle = track.title
  const displayTitle = truncateTitle(rawTitle)
  const artist = track.artist
  const coverArt = track.coverArt

  const isThisPlaying = currentTrackId === track.id && isPlaying

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: 'easeOut' }}
      className="track-card group"
      style={{
        borderLeftColor: isThisPlaying ? 'var(--muse-primary)' : undefined,
        borderLeftWidth: isThisPlaying ? '2px' : undefined,
        willChange: 'transform',
      }}
    >
      <div className="flex gap-3">
        {/* Artwork */}
        <div className="relative flex-shrink-0 w-[72px] h-[72px] rounded-xl overflow-hidden">
          {coverArt ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverArt}
              alt={`${rawTitle} by ${artist} album art`}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-2xl rounded-xl"
              style={{ background: 'var(--muse-surface)' }}
            >
              🎵
            </div>
          )}
          {/* Platform badge — top right of artwork */}
          <div className="absolute top-1 right-1">
            {isSpotify ? <SpotifyIcon /> : <AudiusIcon />}
          </div>
          {isThisPlaying && (
            <div
              className="absolute inset-0 rounded-xl"
              style={{ boxShadow: `inset 0 0 0 2px color-mix(in srgb, var(--muse-primary) 60%, transparent)` }}
            />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p
                className="font-semibold text-[0.88rem] leading-tight truncate"
                title={rawTitle}
                style={{ color: 'var(--muse-text)' }}
              >
                {displayTitle}
              </p>
              <p
                className="text-[0.78rem] mt-0.5 truncate"
                title={artist}
                style={{ color: 'var(--text-secondary)' }}
              >
                {artist}
              </p>
            </div>

            {/* Badges */}
            <div className="flex-shrink-0 flex items-center gap-1.5">
              {!isSpotify && (
                <span
                  className="text-[0.6rem] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                  style={{
                    background: 'color-mix(in srgb, #CC0FE0 20%, transparent)',
                    color: '#CC0FE0',
                    border: '1px solid color-mix(in srgb, #CC0FE0 30%, transparent)',
                  }}
                >
                  Full
                </span>
              )}
              {audiusTrack && (
                <span className="text-[0.65rem] font-mono" style={{ color: 'var(--text-muted)' }}>
                  {formatCount(audiusTrack.playCount)} plays
                </span>
              )}
            </div>
          </div>

          {/* Audio feature bars for Spotify */}
          {spotifyTrack?.audioFeatures && (
            <AudioFeatureBars features={spotifyTrack.audioFeatures} />
          )}

          {/* Players */}
          {spotifyTrack?.itunesPreviewUrl ? (
            <MiniPlayer
              previewUrl={spotifyTrack.itunesPreviewUrl}
              trackId={spotifyTrack.id}
              title={rawTitle}
            />
          ) : isSpotify && spotifyTrack ? (
            <a
              href={spotifyTrack.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${rawTitle} in Spotify`}
              className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-[0.72rem] font-semibold transition-all hover:opacity-90 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-1"
              style={{ background: '#1DB954', color: 'white' }}
            >
              <SpotifyIcon />
              Open in Spotify
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : null}

          {audiusTrack && (
            <FullPlayer
              streamUrl={audiusTrack.streamUrl}
              trackId={audiusTrack.id}
              title={rawTitle}
              durationMs={audiusTrack.durationMs}
            />
          )}
        </div>
      </div>

      {/* Explanation */}
      <ExplanationText text={explanation} />
    </motion.div>
  )
}
