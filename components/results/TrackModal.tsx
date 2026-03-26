'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { X, ExternalLink, Sparkles, Music } from 'lucide-react'
import { RankedTrack, VibeProfile, isSpotifyTrack, isAudiusTrack } from '@/types'
import { MiniPlayer } from './MiniPlayer'
import { FullPlayer } from './FullPlayer'

interface TrackModalProps {
  rankedTrack: RankedTrack
  vibeProfile: VibeProfile
  onClose: () => void
}

function FeatureBar({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ flex: 1, minWidth: '120px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
        <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
          {label}
        </span>
        <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '0.65rem', color: 'var(--muse-primary)' }}>
          {Math.round(value * 100)}%
        </span>
      </div>
      <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
          style={{ height: '100%', background: 'linear-gradient(90deg, var(--muse-primary), var(--muse-secondary))', borderRadius: '2px' }}
        />
      </div>
    </div>
  )
}

export function TrackModal({ rankedTrack, vibeProfile, onClose }: TrackModalProps) {
  const { track, source, explanation } = rankedTrack
  const spotifyTrack = isSpotifyTrack(track) ? track : null
  const audiusTrack = isAudiusTrack(track) ? track : null
  const isSpotify = !!spotifyTrack
  const keywords = [vibeProfile.moodLabel, vibeProfile.emotionalCore, ...vibeProfile.sonicTexture]
    .slice(0, 6)
    .map((k) => k.charAt(0).toUpperCase() + k.slice(1).toLowerCase())
    .filter(Boolean)

  // Track drag offset separately from the mount animation to avoid conflicts
  const dragOffset = useMotionValue(0)
  const backdropOpacity = useTransform(dragOffset, [0, 300], [1, 0])
  const sheetRef = useRef<HTMLDivElement>(null)
  const [dismissing, setDismissing] = useState(false)
  const canClose = useRef(false)

  // Lock body scroll + prevent click-through from triggering immediate close
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const timer = setTimeout(() => { canClose.current = true }, 300)
    return () => { clearTimeout(timer); document.body.style.overflow = '' }
  }, [])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  function handleDrag(_: unknown, info: PanInfo) {
    dragOffset.set(Math.max(0, info.offset.y))
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.y > 100 || info.velocity.y > 500) {
      setDismissing(true)
      setTimeout(onClose, 300)
    }
    dragOffset.set(0)
  }

  const af = spotifyTrack?.audioFeatures

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={() => { if (canClose.current) onClose() }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        opacity: backdropOpacity as unknown as number,
      }}
    >
      <motion.div
        ref={sheetRef}
        initial={{ y: '100%' }}
        animate={{ y: dismissing ? '100%' : 0 }}
        exit={{ y: '100%' }}
        transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.5 }}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onClick={(e) => e.stopPropagation()}
        className="track-modal-sheet"
      >
        {/* Drag handle — swipe down to dismiss */}
        <div
          style={{
            display: 'flex', justifyContent: 'center', paddingTop: '0.75rem', paddingBottom: '0.5rem',
            cursor: 'grab',
          }}
        >
          <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.3)' }} />
        </div>

        {/* Top bar: close */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem', padding: '0 1.5rem' }}>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: '44px', height: '44px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--glass-1)', border: '1px solid var(--glass-border)',
              cursor: 'pointer', color: 'var(--text-secondary)',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content with padding */}
        <div style={{ padding: '0 1.5rem' }}>

        {/* Album art + track info */}
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', marginBottom: '1.75rem' }}>
          {/* Album art */}
          <div
            style={{
              flexShrink: 0, width: '100px', height: '100px', borderRadius: '16px', overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px var(--glass-border)',
            }}
          >
            {track.coverArt ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={track.coverArt} alt={`${track.title} album art`} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--muse-surface)', fontSize: '2rem' }}>
                🎵
              </div>
            )}
          </div>

          {/* Text info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2
              className="gradient-text"
              style={{
                fontFamily: 'var(--font-syne)', fontSize: 'clamp(1.2rem, 4vw, 1.6rem)',
                fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: '0.35rem',
              }}
            >
              {track.title}
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              {track.artist}
            </p>
            {spotifyTrack && (
              <p style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {spotifyTrack.album}{spotifyTrack.releaseYear ? ` · ${spotifyTrack.releaseYear}` : ''}
              </p>
            )}
            {audiusTrack && (
              <p style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                {audiusTrack.playCount.toLocaleString()} plays
              </p>
            )}
          </div>
        </div>

        {/* Player */}
        {spotifyTrack?.itunesPreviewUrl && (
          <div style={{ marginBottom: '1.5rem' }}>
            <MiniPlayer previewUrl={spotifyTrack.itunesPreviewUrl} trackId={spotifyTrack.id} title={track.title} />
          </div>
        )}
        {audiusTrack && (
          <div style={{ marginBottom: '1.5rem' }}>
            <FullPlayer streamUrl={audiusTrack.streamUrl} trackId={audiusTrack.id} title={track.title} durationMs={audiusTrack.durationMs} />
          </div>
        )}

        {/* ── Listen on ── */}
        <div style={{ marginBottom: '1.75rem' }}>
          <p style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Listen on
          </p>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            {spotifyTrack && (
              <a
                href={spotifyTrack.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.6rem 1.1rem', borderRadius: '50px',
                  background: '#1DB954', color: 'white',
                  fontFamily: 'var(--font-geist-sans)', fontSize: '0.85rem', fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
                Spotify
                <ExternalLink size={12} />
              </a>
            )}
            {audiusTrack && (
              <a
                href={`https://audius.co`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.6rem 1.1rem', borderRadius: '50px',
                  background: '#CC0FE0', color: 'white',
                  fontFamily: 'var(--font-geist-sans)', fontSize: '0.85rem', fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <Music size={14} />
                Audius
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>

        {/* ── AI Analysis ── */}
        <div
          style={{
            background: 'rgba(var(--muse-primary-rgb, 139,92,246), 0.07)',
            border: '1px solid rgba(var(--muse-primary-rgb, 139,92,246), 0.15)',
            borderRadius: '16px',
            padding: '1.25rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.9rem' }}>
            <Sparkles size={13} style={{ color: 'var(--muse-primary)', flexShrink: 0 }} aria-hidden="true" />
            <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muse-primary)' }}>
              Why the AI chose this
            </span>
          </div>
          <p style={{ fontSize: '0.95rem', fontStyle: 'italic', color: 'var(--muse-text)', lineHeight: 1.75, margin: '0 0 1rem' }}>
            &ldquo;{explanation}&rdquo;
          </p>
          {keywords.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {keywords.map((kw) => (
                <span
                  key={kw}
                  style={{
                    background: 'rgba(var(--muse-primary-rgb, 139,92,246), 0.12)',
                    border: '1px solid rgba(var(--muse-primary-rgb, 139,92,246), 0.25)',
                    color: 'var(--muse-primary)',
                    borderRadius: '50px', padding: '0.18rem 0.55rem',
                    fontFamily: 'var(--font-geist-mono)', fontSize: '0.65rem',
                    fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}
                >
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Audio DNA (Spotify only) ── */}
        {af && (
          <div>
            <p style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '0.9rem' }}>
              Audio DNA
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem 1.5rem' }}>
              <FeatureBar label="Energy" value={af.energy} />
              <FeatureBar label="Mood" value={af.valence} />
              <FeatureBar label="Dance" value={af.danceability} />
              <FeatureBar label="Acoustic" value={af.acousticness} />
            </div>
          </div>
        )}
        </div>{/* end scrollable content padding */}
      </motion.div>
    </motion.div>
  )
}
