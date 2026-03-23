'use client'

import { ExternalLink, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AudiusTrack, SpotifyTrackData, TrackCardProps } from '@/types'
import { formatCount, truncateTitle } from '@/lib/utils'
import { useAudio } from '@/components/shared/AudioContext'
import { FullPlayer } from './FullPlayer'
import { MiniPlayer } from './MiniPlayer'

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

export function TrackCard({ rankedTrack, index, vibeKeywords, moodLabel, isExpanded, onExpand }: TrackCardProps) {
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
  const audioFeatures = spotifyTrack?.audioFeatures

  const allKeywords = Array.from(
    new Set([moodLabel, ...vibeKeywords].map((k) => k.trim()).filter(Boolean))
  )

  function stopProp(e: React.MouseEvent) {
    e.stopPropagation()
  }

  return (
    <motion.div
      layout
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      aria-controls={`why-panel-${track.id}`}
      onClick={onExpand}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onExpand()
        }
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: 'easeOut' }}
      className="track-card group"
      style={{
        padding: 0,
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        gridColumn: isExpanded ? 'span 2' : undefined,
        borderLeftColor: isThisPlaying
          ? 'var(--muse-primary)'
          : isExpanded
            ? 'rgba(var(--muse-primary-rgb), 0.5)'
            : undefined,
        borderLeftWidth: isThisPlaying || isExpanded ? '2px' : undefined,
        willChange: 'transform',
      }}
    >
      {/* Pulsing glow dot on left edge when playing */}
      {isThisPlaying && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '-1px',
            transform: 'translateY(-50%)',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'var(--muse-primary)',
            animation: 'pulseGlow 2s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Main card content */}
      <div style={{ padding: '1rem' }}>
        <div className="flex gap-3">

          {/* Artwork — 64x64 */}
          <div
            className="relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden"
            style={{
              boxShadow: '0 4px 16px rgba(0,0,0,0.4), 0 0 0 1px var(--glass-border), 0 8px 24px var(--glow-primary-ambient)',
            }}
          >
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
            {/* Platform badge */}
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
                  className="font-semibold text-[1rem] leading-tight truncate"
                  title={rawTitle}
                  style={{ color: 'var(--muse-text)' }}
                >
                  {displayTitle}
                </p>
                <p
                  className="text-[0.88rem] mt-0.5 truncate"
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
                    style={{
                      fontFamily: 'var(--font-geist-mono)',
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      padding: '0.15rem 0.4rem',
                      borderRadius: '4px',
                      background: 'color-mix(in srgb, #CC0FE0 20%, transparent)',
                      color: '#CC0FE0',
                      border: '1px solid color-mix(in srgb, #CC0FE0 30%, transparent)',
                    }}
                  >
                    Full
                  </span>
                )}
                {audiusTrack && (
                  <span
                    style={{
                      fontFamily: 'var(--font-geist-mono)',
                      fontSize: '0.65rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {formatCount(audiusTrack.playCount)} plays
                  </span>
                )}
              </div>
            </div>

            {/* Players — stop click from toggling the card */}
            <div onClick={stopProp}>
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
        </div>

        {/* "Tap to see why" hint — disappears when panel is open */}
        <AnimatePresence initial={false}>
          {!isExpanded && (
            <motion.div
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{
                marginTop: '0.55rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.28rem',
              }}
            >
              <Sparkles
                size={9}
                aria-hidden="true"
                style={{ color: 'rgba(var(--muse-primary-rgb), 0.55)', flexShrink: 0 }}
              />
              <span
                style={{
                  fontSize: '0.75rem',
                  fontStyle: 'italic',
                  color: 'var(--text-muted)',
                }}
              >
                Why did the AI choose this?
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI analysis panel */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id={`why-panel-${track.id}`}
            key="why-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.32, ease: [0.4, 0, 0.2, 1] },
              opacity: { duration: 0.2, ease: 'easeOut' },
            }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                background: 'rgba(var(--muse-primary-rgb), 0.07)',
                borderTop: '1px solid rgba(var(--muse-primary-rgb), 0.18)',
                borderRadius: '0 0 20px 20px',
                padding: '1rem',
              }}
            >
              {/* Panel header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  marginBottom: '0.65rem',
                }}
              >
                <Sparkles
                  size={11}
                  aria-hidden="true"
                  style={{ color: 'var(--muse-primary)', flexShrink: 0 }}
                />
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--muse-primary)',
                  }}
                >
                  Why the AI chose this
                </span>
              </div>

              {/* Full AI explanation */}
              <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: '-0.6rem',
                    left: '-0.05rem',
                    fontSize: '2.2rem',
                    fontFamily: 'Georgia, serif',
                    color: 'rgba(var(--muse-primary-rgb), 0.25)',
                    lineHeight: 1,
                    userSelect: 'none',
                    pointerEvents: 'none',
                  }}
                >
                  &ldquo;
                </span>
                <p
                  style={{
                    fontSize: '1rem',
                    fontStyle: 'italic',
                    color: 'color-mix(in srgb, var(--muse-text) 92%, transparent)',
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  {explanation}
                </p>
              </div>

              {/* Mood keyword pills */}
              {allKeywords.length > 0 && (
                <div style={{ marginTop: '0.9rem' }}>
                  <p
                    style={{
                      fontSize: '0.6rem',
                      color: 'var(--text-muted)',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      margin: '0 0 0.4rem',
                    }}
                  >
                    Matched on
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {allKeywords.map((kw) => (
                      <span
                        key={kw}
                        style={{
                          background: 'rgba(var(--muse-primary-rgb), 0.12)',
                          border: '1px solid rgba(var(--muse-primary-rgb), 0.25)',
                          color: 'var(--muse-primary)',
                          borderRadius: '50px',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          padding: '0.15rem 0.5rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                        }}
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Audio feature bars — Spotify only */}
              {audioFeatures && (
                <div style={{ marginTop: '0.9rem', display: 'flex', gap: '1.25rem' }}>
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontSize: '0.6rem',
                        color: 'var(--text-muted)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        margin: '0 0 0.3rem',
                      }}
                    >
                      Energy
                    </p>
                    <div
                      style={{
                        height: '3px',
                        borderRadius: '2px',
                        background: 'rgba(255,255,255,0.1)',
                        overflow: 'hidden',
                      }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${audioFeatures.energy * 100}%` }}
                        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
                        style={{ height: '100%', background: 'var(--muse-primary)', borderRadius: '2px' }}
                      />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontSize: '0.6rem',
                        color: 'var(--text-muted)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        margin: '0 0 0.3rem',
                      }}
                    >
                      Mood
                    </p>
                    <div
                      style={{
                        height: '3px',
                        borderRadius: '2px',
                        background: 'rgba(255,255,255,0.1)',
                        overflow: 'hidden',
                      }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${audioFeatures.valence * 100}%` }}
                        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1], delay: 0.18 }}
                        style={{ height: '100%', background: 'var(--muse-primary)', borderRadius: '2px' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
