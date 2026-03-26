'use client'

import { RotateCcw, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { MusePlaylist } from '@/types'
import { timeAgo } from '@/lib/utils'

interface MomentThumbnailProps {
  playlist: MusePlaylist
  onDelete: (id: string) => void
  onReexplore: (input: string) => void
  index: number
  compact?: boolean
}

export function MomentThumbnail({ playlist, onDelete, onReexplore, index, compact }: MomentThumbnailProps) {
  const { id, originalInput, vibeProfile, tracks, createdAt } = playlist
  const { colorPalette, moodLabel } = vibeProfile
  const router = useRouter()

  function handleClick() {
    router.push(`/?moment=${id}`)
  }

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 }}
        className="group relative overflow-hidden cursor-pointer transition-[transform,border-color,box-shadow] duration-200"
        style={{
          background: 'var(--depth-2)',
          border: '1px solid var(--glass-border)',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.9rem',
          padding: '0.65rem 0.9rem',
        }}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label={`View ${moodLabel} playlist`}
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        whileHover={{ y: -1, transition: { duration: 0.15 } }}
      >
        {/* Color dot */}
        <div style={{ width: '52px', height: '52px', borderRadius: '10px', flexShrink: 0, background: `linear-gradient(135deg, ${colorPalette.primary}, ${colorPalette.secondary})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'white', fontFamily: 'var(--font-syne)' }}>
            {tracks.length}
          </span>
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: '0.95rem', color: colorPalette.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-syne)' }}>
            {moodLabel}
          </p>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontStyle: 'italic' }}>
            &ldquo;{originalInput}&rdquo;
          </p>
        </div>

        {/* Actions — always visible */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onReexplore(originalInput) }}
            aria-label="Re-explore this feeling"
            title="Re-explore"
            style={{ padding: '8px', borderRadius: '8px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            className="hover:bg-white/10 active:bg-white/15 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(id) }}
            aria-label="Delete this moment"
            title="Delete"
            style={{ padding: '8px', borderRadius: '8px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            className="hover:bg-white/10 active:bg-white/15 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    )
  }

  const keywords = vibeProfile.sonicTexture?.slice(0, 3) ?? []
  const extraCount = (vibeProfile.sonicTexture?.length ?? 0) - 3

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="group moment-card relative rounded-2xl overflow-hidden cursor-pointer transition-[transform,border-color,box-shadow] duration-200"
      style={{
        background: 'var(--depth-2)',
        border: '1px solid var(--glass-border)',
      }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`View ${moodLabel} playlist`}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      {/* Left vertical gradient strip */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ background: `linear-gradient(180deg, ${colorPalette.primary}, ${colorPalette.secondary})` }}
      />

      {/* Content area */}
      <div className="p-4 pl-5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p
              className="font-bold text-[0.95rem] mb-1 truncate"
              style={{ fontFamily: 'var(--font-syne)', color: colorPalette.primary }}
            >
              {moodLabel}
            </p>
            <p
              className="text-[0.78rem] italic line-clamp-2"
              style={{ color: 'var(--text-secondary)', lineHeight: 1.55 }}
            >
              &ldquo;{originalInput}&rdquo;
            </p>
          </div>

          {/* Actions — always visible on mobile, hover on desktop */}
          <div className="flex items-center gap-1 flex-shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); onReexplore(originalInput) }}
              aria-label="Re-explore this feeling"
              title="Re-explore"
              className="p-2.5 sm:p-1.5 rounded-lg hover:bg-white/10 active:bg-white/15 transition-colors"
            >
              <RotateCcw className="w-4 h-4 sm:w-3.5 sm:h-3.5" style={{ color: 'var(--text-muted)' }} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(id) }}
              aria-label="Delete this moment"
              title="Delete"
              className="p-2.5 sm:p-1.5 rounded-lg hover:bg-white/10 active:bg-white/15 transition-colors"
            >
              <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between mt-3">
          {/* Keyword pills */}
          <div className="flex items-center gap-1 flex-wrap">
            {keywords.map((kw) => (
              <span
                key={kw}
                className="text-[0.6rem] uppercase tracking-wide px-1.5 py-0.5 rounded-sm"
                style={{
                  fontFamily: 'var(--font-geist-mono)',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.5)',
                }}
              >
                {kw}
              </span>
            ))}
            {extraCount > 0 && (
              <span
                className="text-[0.6rem] uppercase tracking-wide px-1.5 py-0.5 rounded-sm"
                style={{
                  fontFamily: 'var(--font-geist-mono)',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.5)',
                }}
              >
                +{extraCount}
              </span>
            )}
          </div>

          {/* Track count + timestamp */}
          <div className="flex items-center gap-2 flex-shrink-0 text-[0.62rem]" style={{ fontFamily: 'var(--font-geist-mono)', color: 'var(--text-muted)' }}>
            <span>{tracks.length} track{tracks.length !== 1 ? 's' : ''}</span>
            <span>{timeAgo(createdAt)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
