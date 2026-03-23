'use client'

import { motion } from 'framer-motion'
import { Bookmark, Share2 } from 'lucide-react'
import { VibeProfile } from '@/types'
import { MoodKeywords } from './MoodKeywords'
import { useToast } from '@/components/shared/Toast'

interface MomentCardProps {
  originalInput: string
  vibeProfile: VibeProfile
  onSave: () => void
  isSaved: boolean
}

function formatDateTime(ts: number): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(ts))
}

export function MomentCard({ originalInput, vibeProfile, onSave, isSaved }: MomentCardProps) {
  const { emotionalCore, energyLevel, valenceTarget, sonicTexture, moodLabel } = vibeProfile
  const { showToast } = useToast()

  const radius = 20
  const circumference = 2 * Math.PI * radius
  const energyDash = (energyLevel / 100) * circumference

  const keywords = [emotionalCore, ...sonicTexture]
    .slice(0, 6)
    .map((k) => k.charAt(0).toUpperCase() + k.slice(1).toLowerCase())

  function handleShare() {
    const slug = moodLabel.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const url = `${window.location.origin}/vibe/${slug}`
    void navigator.clipboard.writeText(url).then(() => {
      showToast('Link copied!', 'success')
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      style={{
        position: 'relative',
        padding: '2rem 0',
        paddingBottom: '1rem',
      }}
    >
      {/* Large decorative opening quote */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: '-0.5rem',
          fontSize: '7rem',
          fontFamily: 'Georgia, serif',
          color: 'rgba(var(--muse-primary-rgb), 0.18)',
          lineHeight: 1,
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        &ldquo;
      </span>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-8">
        {/* Left: date + moodLabel (hero) + rule + quote + mono label + keywords */}
        <div className="flex-1">
          {/* Date/time — moved above moodLabel */}
          <p
            style={{
              fontFamily: 'var(--font-geist-mono)',
              fontSize: '0.62rem',
              color: 'var(--text-muted)',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            {formatDateTime(Date.now())}
          </p>

          {/* moodLabel — hero */}
          <p
            style={{
              fontFamily: 'var(--font-syne)',
              fontSize: 'clamp(1.8rem, 4vw, 3rem)',
              fontWeight: 800,
              background: 'linear-gradient(135deg, var(--muse-primary), var(--muse-secondary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              marginBottom: '0.75rem',
            }}
          >
            {moodLabel}
          </p>

          {/* Thin horizontal rule */}
          <div
            style={{
              height: '1px',
              background: 'linear-gradient(90deg, var(--muse-primary), transparent)',
              width: '100%',
              marginBottom: '1.25rem',
              opacity: 0.3,
            }}
          />

          {/* Original input quote */}
          <blockquote
            style={{
              fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
              fontStyle: 'italic',
              fontWeight: 300,
              fontFamily: 'var(--font-geist-sans)',
              color: 'rgba(255,255,255,0.75)',
              lineHeight: 1.5,
              margin: '0 0 0.75rem',
            }}
          >
            &ldquo;{originalInput}&rdquo;
          </blockquote>

          {/* moodLabel in mono small caps */}
          <p
            style={{
              fontFamily: 'var(--font-geist-mono)',
              fontSize: '0.68rem',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: 'var(--muse-primary)',
              marginBottom: '1rem',
            }}
          >
            {moodLabel}
          </p>

          <MoodKeywords keywords={keywords} />
        </div>

        {/* Right: energy dial + actions */}
        <div className="flex items-center gap-4">
          {/* Energy dial with tooltip */}
          <div className="flex flex-col items-center gap-1.5 group/dial">
            <div className="relative">
              <svg
                width="60"
                height="60"
                viewBox="0 0 60 60"
                aria-label={`Energy score: ${energyLevel}% — how intense and driving this vibe is`}
              >
                <circle cx="30" cy="30" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                <circle
                  cx="30"
                  cy="30"
                  r={radius}
                  fill="none"
                  stroke="var(--muse-primary)"
                  strokeWidth="3"
                  strokeDasharray={`${energyDash} ${circumference}`}
                  strokeLinecap="round"
                  transform="rotate(-90 30 30)"
                  strokeOpacity={0.9}
                />
                <circle
                  cx="30"
                  cy="30"
                  r="12"
                  fill="var(--muse-primary)"
                  fillOpacity={valenceTarget * 0.4 + 0.1}
                />
                <text x="30" y="34" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.7)" fontFamily="monospace" fontWeight="bold">
                  {energyLevel}
                </text>
              </svg>
              {/* Tooltip */}
              <div
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg text-[0.65rem] text-center whitespace-nowrap opacity-0 group-hover/dial:opacity-100 pointer-events-none transition-opacity duration-200"
                style={{ background: 'rgba(20,20,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}
              >
                How intense and driving this vibe is
              </div>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-geist-mono)',
                fontSize: '0.6rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--text-muted)',
              }}
            >
              Energy
            </span>
          </div>

          {/* Share */}
          <button
            onClick={handleShare}
            aria-label="Copy share link"
            className="flex flex-col items-center gap-1.5 transition-all hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent rounded-full"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: 'color-mix(in srgb, var(--muse-secondary) 15%, transparent)',
                border: `1px solid color-mix(in srgb, var(--muse-secondary) 40%, transparent)`,
              }}
            >
              <Share2 className="w-4 h-4" style={{ color: 'var(--muse-secondary)' }} />
            </div>
            <span
              style={{
                fontFamily: 'var(--font-geist-mono)',
                fontSize: '0.6rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--text-muted)',
              }}
            >
              Share
            </span>
          </button>

          {/* Save */}
          <button
            onClick={onSave}
            disabled={isSaved}
            aria-label={isSaved ? 'Moment saved' : 'Save this moment'}
            className="flex flex-col items-center gap-1.5 transition-all hover:scale-105 active:scale-95 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent rounded-full"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: isSaved
                  ? 'var(--muse-primary)'
                  : 'color-mix(in srgb, var(--muse-primary) 15%, transparent)',
                border: `1px solid color-mix(in srgb, var(--muse-primary) 40%, transparent)`,
              }}
            >
              <Bookmark className="w-4 h-4" fill={isSaved ? 'white' : 'none'} color={isSaved ? 'white' : 'var(--muse-primary)'} />
            </div>
            <span
              style={{
                fontFamily: 'var(--font-geist-mono)',
                fontSize: '0.6rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--text-muted)',
              }}
            >
              {isSaved ? 'Saved' : 'Save'}
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}
