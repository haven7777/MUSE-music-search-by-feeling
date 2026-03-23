'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { MusePlaylist } from '@/types'
import { clearAllPlaylists, deletePlaylist, getPlaylists } from '@/lib/storage'
import { useToast } from '@/components/shared/Toast'
import { MomentThumbnail } from './MomentThumbnail'

export function MomentsGallery() {
  const [playlists, setPlaylists] = useState<MusePlaylist[]>([])
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const { showToast } = useToast()
  const router = useRouter()
  const MAX = 50

  useEffect(() => {
    setPlaylists(getPlaylists())
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

  if (playlists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-6">
        {/* Vinyl record */}
        <div style={{ position: 'relative', animation: 'spin 8s linear infinite' }}>
          <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
            {/* Outer record body */}
            <circle cx="60" cy="60" r="58" fill="#1a1a1a" />
            {/* Grooves — concentric circles */}
            {[48, 42, 36, 30, 24, 18].map((r) => (
              <circle
                key={r}
                cx="60"
                cy="60"
                r={r}
                fill="none"
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="1.5"
              />
            ))}
            {/* Center label */}
            <circle cx="60" cy="60" r="14" fill="var(--muse-primary)" opacity="0.9" />
            {/* Center hole */}
            <circle cx="60" cy="60" r="3" fill="#0a0a0a" />
            {/* MUSE text on center label */}
            <text
              x="60"
              y="63"
              textAnchor="middle"
              fontSize="6"
              fontWeight="bold"
              fill="rgba(255,255,255,0.8)"
              fontFamily="var(--font-syne)"
            >
              MUSE
            </text>
          </svg>
        </div>

        <div>
          <p
            style={{
              fontFamily: 'var(--font-syne)',
              fontWeight: 600,
              fontSize: '1.2rem',
              color: 'var(--text-secondary)',
              marginBottom: '0.5rem',
            }}
          >
            Your moments will live here
          </p>
          <p
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              fontStyle: 'italic',
              maxWidth: '280px',
              margin: '0 auto 1.5rem',
              lineHeight: 1.6,
            }}
          >
            Every feeling you translate becomes part of your musical memory.
          </p>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'var(--muse-primary)',
              color: 'white',
              borderRadius: '50px',
              padding: '0.65rem 1.5rem',
              fontSize: '0.85rem',
              fontWeight: 600,
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
      {/* Header actions */}
      <div className="flex items-center justify-between mb-6">
        <p
          className="text-[0.75rem]"
          style={{ fontFamily: 'var(--font-geist-mono)', color: 'var(--text-muted)' }}
        >
          {playlists.length}/{MAX} moments saved
        </p>
        {!showClearConfirm ? (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-1.5 text-[0.72rem] transition-opacity hover:opacity-70 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-1 rounded"
            style={{ fontFamily: 'var(--font-geist-mono)', color: 'var(--text-muted)' }}
          >
            <Trash2 className="w-3 h-3" />
            Clear all
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span
              className="text-[0.72rem]"
              style={{ fontFamily: 'var(--font-geist-mono)', color: 'var(--text-muted)' }}
            >
              Delete all {playlists.length} moments?
            </span>
            <button
              onClick={handleClearAll}
              className="text-[0.72rem] px-2.5 py-1 rounded-full transition-all hover:opacity-90 focus-visible:ring-2 focus-visible:ring-cyan-400"
              style={{ fontFamily: 'var(--font-geist-mono)', background: '#ef4444', color: 'white' }}
            >
              Yes, clear
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="text-[0.72rem] px-2.5 py-1 rounded-full transition-all hover:opacity-80 focus-visible:ring-2 focus-visible:ring-cyan-400"
              style={{
                fontFamily: 'var(--font-geist-mono)',
                background: 'rgba(255,255,255,0.1)',
                color: 'var(--text-secondary)',
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Capacity warning */}
      {playlists.length >= MAX && (
        <div
          className="rounded-xl p-3 mb-4 text-[0.78rem] text-center"
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#fca5a5',
          }}
        >
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
    </div>
  )
}
