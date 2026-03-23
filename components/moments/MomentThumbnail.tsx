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
}

export function MomentThumbnail({ playlist, onDelete, onReexplore, index }: MomentThumbnailProps) {
  const { id, originalInput, vibeProfile, tracks, createdAt } = playlist
  const { colorPalette, moodLabel } = vibeProfile
  const router = useRouter()

  function handleClick() {
    router.push(`/?moment=${id}`)
  }

  const keywords = vibeProfile.sonicTexture?.slice(0, 3) ?? []
  const extraCount = (vibeProfile.sonicTexture?.length ?? 0) - 3

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="group"
      style={{
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'var(--depth-2)',
        border: '1px solid var(--glass-border)',
        cursor: 'pointer',
        transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
      }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`View ${moodLabel} playlist`}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      whileHover={{
        y: -2,
        transition: { duration: 0.2 },
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = 'var(--glass-border-bright)'
        el.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3), 0 0 0 1px var(--glass-border-bright)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = 'var(--glass-border)'
        el.style.boxShadow = 'none'
      }}
    >
      {/* Left vertical gradient strip */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '4px',
          background: `linear-gradient(180deg, ${colorPalette.primary}, ${colorPalette.secondary})`,
        }}
      />

      {/* Content area — extra left padding to clear the strip */}
      <div style={{ padding: '1rem 1rem 1rem 1.25rem' }}>
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
          {/* Left side */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontFamily: 'var(--font-syne)',
                fontWeight: 700,
                fontSize: '0.95rem',
                color: colorPalette.primary,
                marginBottom: '0.35rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {moodLabel}
            </p>
            <p
              style={{
                fontSize: '0.78rem',
                fontStyle: 'italic',
                lineHeight: 1.55,
                color: 'var(--text-secondary)',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              &ldquo;{originalInput}&rdquo;
            </p>
          </div>

          {/* Actions — show on group-hover */}
          <div
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                onReexplore(originalInput)
              }}
              aria-label="Re-explore this feeling"
              title="Re-explore"
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(id)
              }}
              aria-label="Delete this moment"
              title="Delete"
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '0.75rem',
          }}
        >
          {/* Keyword pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap' }}>
            {keywords.map((kw) => (
              <span
                key={kw}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '0.6rem',
                  fontFamily: 'var(--font-geist-mono)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '3px',
                }}
              >
                {kw}
              </span>
            ))}
            {extraCount > 0 && (
              <span
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '0.6rem',
                  fontFamily: 'var(--font-geist-mono)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '3px',
                }}
              >
                +{extraCount}
              </span>
            )}
          </div>

          {/* Track count + timestamp */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <span
              style={{
                fontFamily: 'var(--font-geist-mono)',
                fontSize: '0.62rem',
                color: 'var(--text-muted)',
              }}
            >
              {tracks.length} track{tracks.length !== 1 ? 's' : ''}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-geist-mono)',
                fontSize: '0.62rem',
                color: 'var(--text-muted)',
              }}
            >
              {timeAgo(createdAt)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
