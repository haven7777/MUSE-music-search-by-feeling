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
      <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
        {/* SVG waveform illustration */}
        <svg width="80" height="40" viewBox="0 0 80 40" aria-hidden="true">
          {[4, 10, 18, 8, 22, 14, 6, 20, 12, 16].map((h, i) => (
            <rect
              key={i}
              x={i * 8 + 2}
              y={(40 - h) / 2}
              width="4"
              height={h}
              rx="2"
              fill="rgba(139,92,246,0.3)"
            />
          ))}
        </svg>
        <div>
          <p className="text-xl font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
            No moments yet
          </p>
          <p className="text-[0.85rem] max-w-xs mx-auto mb-6" style={{ color: 'var(--text-muted)' }}>
            Every feeling you explore becomes a moment. Start by describing how you feel.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-cyan-400"
            style={{ background: 'var(--muse-primary)', color: 'white' }}
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
        <p className="text-[0.75rem] font-mono" style={{ color: 'var(--text-muted)' }}>
          {playlists.length}/{MAX} moments saved
        </p>
        {!showClearConfirm ? (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-1.5 text-[0.72rem] font-mono transition-opacity hover:opacity-70 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-1 rounded"
            style={{ color: 'var(--text-muted)' }}
          >
            <Trash2 className="w-3 h-3" />
            Clear all
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-[0.72rem] font-mono" style={{ color: 'var(--text-muted)' }}>
              Delete all {playlists.length} moments?
            </span>
            <button
              onClick={handleClearAll}
              className="text-[0.72rem] font-mono px-2.5 py-1 rounded-full transition-all hover:opacity-90 focus-visible:ring-2 focus-visible:ring-cyan-400"
              style={{ background: '#ef4444', color: 'white' }}
            >
              Yes, clear
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="text-[0.72rem] font-mono px-2.5 py-1 rounded-full transition-all hover:opacity-80 focus-visible:ring-2 focus-visible:ring-cyan-400"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}
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
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}
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
