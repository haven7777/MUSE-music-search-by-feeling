'use client'

import { useState } from 'react'
import { Bookmark, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'
import { AudiusTrack, SpotifyTrackData, TrackCardProps } from '@/types'
import { truncateTitle } from '@/lib/utils'
import { useAudio } from '@/components/shared/AudioContext'
import { addFavoriteTrackCloud, removeFavoriteTrackCloud } from '@/lib/cloudStorage'
import { useAuth } from '@/components/auth/AuthContext'
import { useToast } from '@/components/shared/Toast'
import { AnimatePresence } from 'framer-motion'
import { AuthModal } from '@/components/auth/AuthModal'
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

export function TrackCard({ rankedTrack, index, moodLabel, onOpen }: TrackCardProps) {
  const { source, track } = rankedTrack
  const { currentTrackId, isPlaying } = useAudio()
  const isSpotify = source === 'spotify'

  const spotifyTrack = isSpotify ? (track as SpotifyTrackData) : null
  const audiusTrack = !isSpotify ? (track as AudiusTrack) : null

  const rawTitle = track.title
  const displayTitle = truncateTitle(rawTitle)
  const isThisPlaying = currentTrackId === track.id && isPlaying

  const [isSaved, setIsSaved] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { user } = useAuth()
  const { showToast } = useToast()

  function stopProp(e: React.MouseEvent) { e.stopPropagation() }

  function toggleSaved(e: React.MouseEvent) {
    e.stopPropagation()
    if (!user) {
      setShowAuthModal(true)
      return
    }
    if (isSaved) {
      removeFavoriteTrackCloud(track.id).then(() => {
        setIsSaved(false)
        showToast('Song removed', 'info')
      })
    } else {
      addFavoriteTrackCloud({
        id: track.id,
        source,
        title: track.title,
        artist: track.artist,
        coverArt: track.coverArt ?? '',
        savedAt: Date.now(),
        moodLabel,
        spotifyUrl: spotifyTrack?.spotifyUrl,
        streamUrl: audiusTrack?.streamUrl,
        previewUrl: spotifyTrack?.itunesPreviewUrl ?? undefined,
      }).then(() => {
        setIsSaved(true)
        showToast('Song saved ✓', 'success')
      })
    }
  }

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label={`${rawTitle} by ${track.artist} — tap for details`}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen() }
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35, ease: 'easeOut' }}
      className="track-card group"
      style={{
        padding: 0,
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        borderLeftColor: isThisPlaying ? 'var(--muse-primary)' : undefined,
        borderLeftWidth: isThisPlaying ? '2px' : undefined,
        willChange: 'transform',
      }}
    >
      {/* Pulsing glow dot when playing */}
      {isThisPlaying && (
        <div
          style={{
            position: 'absolute', top: '50%', left: '-1px',
            transform: 'translateY(-50%)',
            width: '6px', height: '6px', borderRadius: '50%',
            background: 'var(--muse-primary)',
            animation: 'pulseGlow 2s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Bookmark button — top-right, always visible */}
      <button
        onClick={toggleSaved}
        aria-label={isSaved ? 'Remove from saved songs' : 'Save this song'}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          zIndex: 2,
          background: isSaved ? 'rgba(var(--muse-primary-rgb), 0.15)' : 'rgba(0,0,0,0.4)',
          border: 'none',
          cursor: 'pointer',
          padding: '6px',
          borderRadius: '8px',
          color: isSaved ? 'var(--muse-primary)' : 'rgba(255,255,255,0.7)',
          transition: 'all 0.15s ease',
        }}
        className="hover:scale-110"
      >
        <Bookmark size={16} fill={isSaved ? 'currentColor' : 'none'} />
      </button>

      <div style={{ padding: '1rem' }}>
        <div className="flex gap-3">
          {/* Artwork */}
          <div
            className="relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden"
            style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.4), 0 0 0 1px var(--glass-border)' }}
          >
            {track.coverArt ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={track.coverArt}
                alt={`${rawTitle} by ${track.artist}`}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl" style={{ background: 'var(--muse-surface)' }}>
                🎵
              </div>
            )}
            <div className="absolute top-1 right-1">
              {isSpotify ? <SpotifyIcon /> : <AudiusIcon />}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-[1rem] leading-tight truncate" title={rawTitle} style={{ color: 'var(--muse-text)' }}>
                  {displayTitle}
                </p>
                <p className="text-[0.88rem] mt-0.5 truncate" title={track.artist} style={{ color: 'var(--text-secondary)' }}>
                  {track.artist}
                </p>
              </div>
            </div>

            {/* Player — stop click from opening modal */}
            <div onClick={stopProp}>
              {spotifyTrack?.itunesPreviewUrl ? (
                <MiniPlayer previewUrl={spotifyTrack.itunesPreviewUrl} trackId={spotifyTrack.id} title={rawTitle} />
              ) : isSpotify && spotifyTrack ? (
                <a
                  href={spotifyTrack.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${rawTitle} in Spotify`}
                  className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-[0.72rem] font-semibold transition-all hover:opacity-90"
                  style={{ background: '#1DB954', color: 'white' }}
                >
                  <SpotifyIcon />
                  Open in Spotify
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : null}

              {audiusTrack && (
                <FullPlayer streamUrl={audiusTrack.streamUrl} trackId={audiusTrack.id} title={rawTitle} durationMs={audiusTrack.durationMs} />
              )}
            </div>
          </div>
        </div>

        {/* Tap hint */}
        <p style={{ marginTop: '0.55rem', fontSize: '0.72rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
          Tap for AI analysis &amp; details →
        </p>
      </div>
      <AnimatePresence>
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </AnimatePresence>
    </motion.div>
  )
}
