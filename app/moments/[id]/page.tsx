'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { MusePlaylist } from '@/types'
import { getPlaylistById } from '@/lib/storage'
import { ResultsPage } from '@/components/results/ResultsPage'

export default function MomentDetailPage() {
  const params = useParams()
  const [playlist, setPlaylist] = useState<MusePlaylist | null | undefined>(undefined)

  useEffect(() => {
    const id = typeof params.id === 'string' ? params.id : ''
    const found = getPlaylistById(id)
    setPlaylist(found)
  }, [params.id])

  if (playlist === undefined) return null // loading

  if (!playlist) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <p className="text-5xl">🎵</p>
        <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>
          This moment wasn&apos;t found
        </p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          It may have been deleted or the link is incorrect.
        </p>
        <Link
          href="/moments"
          className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105"
          style={{ background: 'var(--muse-primary)', color: 'white' }}
        >
          Back to Moments
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col" style={{ fontFamily: 'var(--font-geist-sans)' }}>
      {/* Nav */}
      <div
        className="sticky top-0 z-20 flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 border-b"
        style={{ background: 'rgba(8,8,16,0.8)', backdropFilter: 'blur(12px)', borderColor: 'var(--border)' }}
      >
        <Link
          href="/moments"
          className="text-[0.7rem] sm:text-[0.75rem] font-mono uppercase tracking-widest transition-opacity hover:opacity-70 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-1 rounded-lg"
          style={{
            color: 'rgba(255,255,255,0.85)',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            padding: '0.4rem 0.6rem',
            fontWeight: 600,
          }}
        >
          <span className="hidden sm:inline">← Back to </span>
          <span className="sm:hidden">← </span>Moments
        </Link>
        <span
          className="text-sm font-bold gradient-text"
          style={{ fontFamily: 'var(--font-syne)' }}
        >
          MUSE
        </span>
        <Link
          href="/"
          className="text-[0.7rem] sm:text-[0.75rem] font-mono uppercase tracking-widest transition-opacity hover:opacity-70 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-1 rounded-lg"
          style={{
            color: 'rgba(255,255,255,0.85)',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            padding: '0.4rem 0.6rem',
            fontWeight: 600,
          }}
        >
          New <span className="hidden sm:inline">Feeling</span>
        </Link>
      </div>

      <ResultsPage playlist={playlist} />
    </main>
  )
}
