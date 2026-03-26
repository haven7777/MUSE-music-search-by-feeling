'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trash2, ExternalLink, Play, Pause } from 'lucide-react'
import { FavoriteTrack, MusePlaylist } from '@/types'
import { clearAllPlaylistsCloud, clearAllFavoriteTracksCloud, deletePlaylistCloud, getPlaylistsCloud, getFavoriteTracksCloud, removeFavoriteTrackCloud } from '@/lib/cloudStorage'
import { useToast } from '@/components/shared/Toast'
import { useAuth } from '@/components/auth/AuthContext'
import { useAudio } from '@/components/shared/AudioContext'
import { WaveformProgress } from '@/components/results/WaveformProgress'
import { MomentCardSkeleton, SavedSongSkeleton } from '@/components/shared/LoadingSkeleton'
import { MomentThumbnail } from './MomentThumbnail'

export function MomentsGallery() {
  const [playlists, setPlaylists] = useState<MusePlaylist[]>([])
  const [savedSongs, setSavedSongs] = useState<FavoriteTrack[]>([])
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showClearSongsConfirm, setShowClearSongsConfirm] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const { showToast } = useToast()
  const { user, loading: authLoading } = useAuth()
  const { play, pause: pauseAudio, seek, currentTrackId, isPlaying, progress: audioProgress } = useAudio()
  const router = useRouter()
  const MAX = 50

  useEffect(() => {
    if (authLoading) return
    if (!user) { setDataLoading(false); return }
    setDataLoading(true)
    Promise.all([
      getPlaylistsCloud().then((p) => setPlaylists(p)),
      getFavoriteTracksCloud().then((s) => setSavedSongs(s)),
    ]).finally(() => setDataLoading(false))
  }, [user, authLoading])

  function handleDelete(id: string) {
    void deletePlaylistCloud(id)
    setPlaylists((prev) => prev.filter((p) => p.id !== id))
    showToast('Moment deleted', 'info')
  }

  function handleClearAll() {
    void clearAllPlaylistsCloud()
    setPlaylists([])
    setShowClearConfirm(false)
    showToast('All moments cleared', 'info')
  }

  function handleClearAllSongs() {
    void clearAllFavoriteTracksCloud()
    setSavedSongs([])
    setShowClearSongsConfirm(false)
    showToast('All songs cleared', 'info')
  }

  function handleReexplore(input: string) {
    router.push(`/?q=${encodeURIComponent(input)}`)
  }

  function handleRemoveSong(id: string) {
    void removeFavoriteTrackCloud(id)
    setSavedSongs((prev) => prev.filter((s) => s.id !== id))
    showToast('Removed from saved songs', 'info')
  }

  const hasPlaylists = playlists.length > 0
  const hasSongs = savedSongs.length > 0

  if (authLoading || (user && dataLoading)) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }} className="moments-layout">
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="skeleton-block" style={{ width: '3px', height: '22px', borderRadius: '2px' }} />
            <div className="skeleton-block" style={{ height: '16px', width: '110px' }} />
          </div>
          <div className="flex flex-col gap-1.5">
            {Array.from({ length: 3 }).map((_, i) => <SavedSongSkeleton key={i} />)}
          </div>
        </section>
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="skeleton-block" style={{ height: '16px', width: '140px' }} />
          </div>
          <div className="flex flex-col gap-1.5">
            {Array.from({ length: 3 }).map((_, i) => <MomentCardSkeleton key={i} />)}
          </div>
        </section>
        <style>{`
          @media (max-width: 640px) {
            .moments-layout { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    )
  }

  if (!authLoading && !user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-6">
        <div style={{ fontSize: '3rem' }}>🔒</div>
        <div>
          <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 600, fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Sign in to see your moments
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '280px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            Your saved moments and songs live in the cloud — sign in to access them from any device.
          </p>
          <Link
            href="/"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: 'var(--muse-primary)', color: 'white', borderRadius: '50px',
              padding: '0.65rem 1.5rem', fontSize: '0.85rem', fontWeight: 600,
              boxShadow: '0 4px 20px var(--glow-primary-soft)',
            }}
          >
            Back to MUSE →
          </Link>
        </div>
      </div>
    )
  }

  if (!hasPlaylists && !hasSongs) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-6">
        <div style={{ position: 'relative', animation: 'spin 8s linear infinite' }}>
          <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="58" fill="#1a1a1a" />
            {[48, 42, 36, 30, 24, 18].map((r) => (
              <circle key={r} cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />
            ))}
            <circle cx="60" cy="60" r="14" fill="var(--muse-primary)" opacity="0.9" />
            <circle cx="60" cy="60" r="3" fill="#0a0a0a" />
            <text x="60" y="63" textAnchor="middle" fontSize="6" fontWeight="bold" fill="rgba(255,255,255,0.8)" fontFamily="var(--font-syne)">
              MUSE
            </text>
          </svg>
        </div>

        <div>
          <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 600, fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Your moments will live here
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', maxWidth: '280px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            Every feeling you translate becomes part of your musical memory.
          </p>
          <Link
            href="/"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: 'var(--muse-primary)', color: 'white', borderRadius: '50px',
              padding: '0.65rem 1.5rem', fontSize: '0.85rem', fontWeight: 600,
              boxShadow: '0 4px 20px var(--glow-primary-soft)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
          >
            Find my soundtrack →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: hasSongs && hasPlaylists ? '1fr 1fr' : '1fr', gap: '2rem', alignItems: 'start' }} className="moments-layout">
      {/* ── Saved Songs (LEFT) ── */}
      {hasSongs && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '3px', height: '22px', background: 'var(--muse-primary)', borderRadius: '2px' }} />
              <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: '1.1rem', letterSpacing: '0.05em', color: 'var(--text-secondary)', fontWeight: 700 }}>
                Saved Songs
              </h2>
              <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
                {savedSongs.length}
              </span>
            </div>
            {!showClearSongsConfirm ? (
              <button
                onClick={() => setShowClearSongsConfirm(true)}
                className="flex items-center gap-1 transition-all hover:opacity-100 focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-full"
                style={{
                  fontFamily: 'var(--font-geist-mono)',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: '#fca5a5',
                  background: 'rgba(239,68,68,0.12)',
                  border: '1px solid rgba(239,68,68,0.35)',
                  padding: '0.35rem 0.75rem',
                }}
              >
                <Trash2 className="w-3 h-3" />
                Clear all
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[0.7rem]" style={{ fontFamily: 'var(--font-geist-mono)', color: 'var(--text-muted)' }}>
                  Delete all?
                </span>
                <button
                  onClick={handleClearAllSongs}
                  className="text-[0.7rem] px-2.5 py-1 rounded-full transition-all hover:opacity-90 font-semibold"
                  style={{ fontFamily: 'var(--font-geist-mono)', background: '#ef4444', color: 'white' }}
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowClearSongsConfirm(false)}
                  className="text-[0.7rem] px-2.5 py-1 rounded-full transition-all hover:opacity-80 font-semibold"
                  style={{ fontFamily: 'var(--font-geist-mono)', background: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}
                >
                  No
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2.5">
            {savedSongs.map((song) => {
              const audioSrc = song.source === 'audius' ? song.streamUrl : song.previewUrl
              const isCurrent = currentTrackId === `saved-${song.id}`
              const isCurrentPlaying = isCurrent && isPlaying
              return (
              <div
                key={song.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.9rem',
                  background: 'var(--depth-2)',
                  border: `1px solid ${isCurrent ? 'rgba(255,255,255,0.2)' : 'var(--glass-border)'}`,
                  borderRadius: '14px',
                  padding: '0.65rem 0.9rem',
                }}
              >
                {/* Play button */}
                {audioSrc && (
                  <button
                    onClick={() => {
                      if (isCurrentPlaying) { pauseAudio() } else { play(`saved-${song.id}`, audioSrc) }
                    }}
                    aria-label={isCurrentPlaying ? `Pause ${song.title}` : `Play ${song.title}`}
                    className="flex items-center justify-center flex-shrink-0 transition-all hover:scale-110 active:scale-95"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'var(--muse-primary)',
                      boxShadow: isCurrentPlaying ? '0 0 12px rgba(var(--muse-primary-rgb), 0.5)' : 'none',
                      transition: 'box-shadow 0.3s ease',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {isCurrentPlaying ? (
                      <Pause style={{ width: '14px', height: '14px', color: 'white', fill: 'white' }} />
                    ) : (
                      <Play style={{ width: '14px', height: '14px', color: 'white', fill: 'white' }} />
                    )}
                  </button>
                )}

                {/* Artwork */}
                <div style={{ width: '52px', height: '52px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: 'var(--muse-surface)' }}>
                  {song.coverArt ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={song.coverArt} alt={song.title} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🎵</div>
                  )}
                </div>

                {/* Info + Waveform */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--muse-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {song.title}
                  </p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {song.artist}
                  </p>
                  {isCurrent && (
                    <div style={{ marginTop: '0.35rem' }}>
                      <WaveformProgress
                        progress={audioProgress}
                        isPlaying={isCurrentPlaying}
                        seekable={song.source === 'audius'}
                        onSeek={song.source === 'audius' ? seek : undefined}
                        barCount={30}
                      />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
                  {song.spotifyUrl && (
                    <a
                      href={song.spotifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Open in Spotify"
                      title="Open in Spotify"
                      style={{ padding: '8px', borderRadius: '8px', color: '#1DB954', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      className="hover:bg-white/10 active:bg-white/15 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  {song.source === 'audius' && (
                    <a
                      href={`https://audius.co/tracks/${song.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Open in Audius"
                      title="Open in Audius"
                      style={{ padding: '8px', borderRadius: '8px', color: '#CC0FE0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      className="hover:bg-white/10 active:bg-white/15 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => handleRemoveSong(song.id)}
                    aria-label="Remove from saved songs"
                    title="Remove"
                    style={{ padding: '8px', borderRadius: '8px', color: 'var(--text-muted)', display: 'flex', background: 'none', border: 'none', cursor: 'pointer', alignItems: 'center', justifyContent: 'center' }}
                    className="hover:bg-white/10 active:bg-white/15 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Saved Moments (RIGHT) ── */}
      {hasPlaylists && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '3px', height: '22px', background: 'var(--muse-secondary, var(--muse-primary))', borderRadius: '2px' }} />
              <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: '1.1rem', letterSpacing: '0.05em', color: 'var(--text-secondary)', fontWeight: 700 }}>
                Saved Moments
              </h2>
              <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
                {playlists.length}
              </span>
            </div>
            {!showClearConfirm ? (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-1 transition-all hover:opacity-100 focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-full"
                style={{
                  fontFamily: 'var(--font-geist-mono)',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: '#fca5a5',
                  background: 'rgba(239,68,68,0.12)',
                  border: '1px solid rgba(239,68,68,0.35)',
                  padding: '0.35rem 0.75rem',
                }}
              >
                <Trash2 className="w-3 h-3" />
                Clear all
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[0.7rem]" style={{ fontFamily: 'var(--font-geist-mono)', color: 'var(--text-muted)' }}>
                  Delete all?
                </span>
                <button
                  onClick={handleClearAll}
                  className="text-[0.7rem] px-2.5 py-1 rounded-full transition-all hover:opacity-90 font-semibold"
                  style={{ fontFamily: 'var(--font-geist-mono)', background: '#ef4444', color: 'white' }}
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="text-[0.7rem] px-2.5 py-1 rounded-full transition-all hover:opacity-80 font-semibold"
                  style={{ fontFamily: 'var(--font-geist-mono)', background: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}
                >
                  No
                </button>
              </div>
            )}
          </div>

          {playlists.length >= MAX && (
            <div className="rounded-xl p-3 mb-4 text-[0.78rem] text-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
              {MAX}/{MAX} moments saved — delete some to save new ones
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            {playlists.map((playlist, i) => (
              <MomentThumbnail
                key={playlist.id}
                playlist={playlist}
                onDelete={handleDelete}
                onReexplore={handleReexplore}
                index={i}
                compact
              />
            ))}
          </div>
        </section>
      )}

      <style>{`
        @media (max-width: 640px) {
          .moments-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
