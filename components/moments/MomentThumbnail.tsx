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
    router.push(`/moments/${id}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="group relative rounded-2xl overflow-hidden border cursor-pointer transition-transform duration-200 hover:scale-[1.01] focus-visible:ring-2 focus-visible:ring-cyan-400"
      style={{ borderColor: 'rgba(255,255,255,0.07)' }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`View ${moodLabel} playlist`}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      {/* Color gradient strip */}
      <div
        className="h-1.5 w-full"
        style={{
          background: `linear-gradient(90deg, ${colorPalette.primary}, ${colorPalette.secondary})`,
        }}
      />

      <div className="p-4" style={{ background: 'var(--muse-surface)' }}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm mb-1 truncate" style={{ color: colorPalette.primary }}>
              {moodLabel}
            </p>
            <p
              className="text-[0.78rem] leading-relaxed line-clamp-2 italic"
              style={{ color: 'var(--text-secondary)' }}
            >
              &ldquo;{originalInput}&rdquo;
            </p>
          </div>

          {/* Actions — show on hover */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
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

        <div className="flex items-center justify-between mt-3">
          <span className="text-[0.65rem] font-mono" style={{ color: 'var(--text-muted)' }}>
            {tracks.length} track{tracks.length !== 1 ? 's' : ''}
          </span>
          <span className="text-[0.65rem] font-mono" style={{ color: 'var(--text-muted)' }}>
            {timeAgo(createdAt)}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
