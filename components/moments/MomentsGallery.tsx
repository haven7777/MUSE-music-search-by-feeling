'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trash2, ExternalLink } from 'lucide-react'
import { FavoriteTrack, MusePlaylist } from '@/types'
import { clearAllPlaylists, deletePlaylist, getPlaylists, getFavoriteTracks, removeFavoriteTrack } from '@/lib/storage'
import { useToast } from '@/components/shared/Toast'
import { MomentThumbnail } from './MomentThumbnail'

export function MomentsGallery() {
  const [playlists, setPlaylists] = useState<MusePlaylist[]>([])
  const [savedSongs, setSavedSongs] = useState<FavoriteTrack[]>([])
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const { showToast } = useToast()
  const router = useRouter()
  const MAX = 50

  useEffect(() => {
    setPlaylists(getPlaylists())
    setSavedSongs(getFavoriteTracks())
  }, [])

  function handleDelete(id: string) {
    deletePlaylist(id)
    setPlaylists((prev) => prev.filter((p) => p.id !== id))
    showToast('Moment deleted', 'info')
  }

  function handleClearAll() {
    clearAllPlaylists()
    setPlaylists([])
    setShowClearConfirm(false)
    showToast('All moments cleared', 'info')
  }

  function handleReexplore(input: string) {
    router.push(`/?q=${encodeURIComponent(input)}`)
  }

  function handleRemoveSong(id: string) {
    removeFavoriteTrack(id)
    setSavedSongs((prev) => prev.filter((s) => s.id !== id))
    showToast('Removed from saved songs', 'info')
  }

  const hasPlaylists = playlists.length > 0
  const hasSongs = savedSongs.length > 0

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
    <div>
      {/* ── Saved Moments ── */}
      {hasPlaylists && (
        <section style={{ marginBottom: hasSongs ? '3rem' : 0 }}>
          <div className="flex items-center justify-between mb-6">
            <p className="text-[0.95rem] font-semibold" style={{ fontFamily: 'var(--font-geist-mono)', color: 'var(--text-secondary)' }}>
              {playlists.length}/{MAX} moments saved
            </p>
            {!showClearConfirm ? (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-1.5 transition-all hover:opacity-100 focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-full"
                style={{
                  fontFamily: 'var(--font-geist-mono)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#fca5a5',
                  background: 'rgba(239,68,68,0.12)',
                  border: '1px solid rgba(239,68,68,0.35)',
                  padding: '0.35rem 0.85rem',
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear all
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[0.8rem]" style={{ fontFamily: 'var(--font-geist-mono)', color: 'var(--text-muted)' }}>
                  Delete all {playlists.length} moments?
                </span>
                <button
                  onClick={handleClearAll}
                  className="text-[0.8rem] px-3 py-1.5 rounded-full transition-all hover:opacity-90 font-semibold"
                  style={{ fontFamily: 'var(--font-geist-mono)', background: '#ef4444', color: 'white' }}
                >
                  Yes, clear
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="text-[0.8rem] px-3 py-1.5 rounded-full transition-all hover:opacity-80 font-semibold"
                  style={{ fontFamily: 'var(--font-geist-mono)', background: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {playlists.length >= MAX && (
            <div className="rounded-xl p-3 mb-4 text-[0.78rem] text-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
              {MAX}/{MAX} moments saved — delete some to save new ones
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {playlists.map((playlist, i) => (
              <MomentThumbnail
                key={playlist.id}
                playlist={playlist}
                onDelete={handleDelete}
                onReexplore={handleReexplore}
                index={i}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Saved Songs ── */}
      {hasSongs && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ width: '3px', height: '22px', background: 'var(--muse-primary)', borderRadius: '2px' }} />
            <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: '1.1rem', letterSpacing: '0.05em', color: 'var(--text-secondary)', fontWeight: 700 }}>
              Saved Songs
            </h2>
            <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              ({savedSongs.length})
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {savedSongs.map((song) => (
              <div
                key={song.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.875rem',
                  background: 'var(--depth-2)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '12px',
                  padding: '0.75rem 1rem',
                }}
              >
                {/* Artwork */}
                <div style={{ width: '44px', height: '44px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: 'var(--muse-surface)' }}>
                  {song.coverArt ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={song.coverArt} alt={song.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🎵</div>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--muse-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {song.title}
                  </p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {song.artist}
                  </p>
                  {song.moodLabel && (
                    <p style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {song.moodLabel}
                    </p>
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
                      style={{ padding: '6px', borderRadius: '6px', color: '#1DB954', display: 'flex' }}
                      className="hover:bg-white/10 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => handleRemoveSong(song.id)}
                    aria-label="Remove from saved songs"
                    title="Remove"
                    style={{ padding: '6px', borderRadius: '6px', color: 'var(--text-muted)', display: 'flex', background: 'none', border: 'none', cursor: 'pointer' }}
                    className="hover:bg-white/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
