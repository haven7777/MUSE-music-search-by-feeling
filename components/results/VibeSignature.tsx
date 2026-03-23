'use client'

import { motion } from 'framer-motion'
import { AudioFeatures } from '@/types'

interface VibeSignatureProps {
  features: Partial<AudioFeatures>
  energyLevel: number
  moodLabel: string
}

const AXES = ['Energy', 'Danceability', 'Valence', 'Acousticness', 'Tempo']
const SIZE = 280
const CENTER = SIZE / 2
const RADIUS = 95

function polarToXY(angle: number, r: number): { x: number; y: number } {
  const rad = (angle - 90) * (Math.PI / 180)
  return {
    x: CENTER + r * Math.cos(rad),
    y: CENTER + r * Math.sin(rad),
  }
}

function buildPath(values: number[]): string {
  const points = values.map((v, i) => {
    const angle = (360 / values.length) * i
    const r = v * RADIUS
    return polarToXY(angle, r)
  })
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'
}

export function VibeSignature({ features, energyLevel, moodLabel }: VibeSignatureProps) {
  const normalizedTempo = features.tempo ? Math.min(features.tempo / 200, 1) : 0.5

  const values = [
    energyLevel / 100,
    features.danceability ?? 0.5,
    features.valence ?? 0.5,
    features.acousticness ?? 0.5,
    normalizedTempo,
  ]

  const dataPath = buildPath(values)
  const gridLevels = [0.25, 0.5, 0.75, 1.0]

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Container with circular glow */}
      <div
        style={{
          position: 'relative',
          maxWidth: '320px',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {/* Circular glow behind the SVG */}
        <div
          style={{
            position: 'absolute',
            inset: '-20px',
            background: 'radial-gradient(circle, rgba(var(--muse-primary-rgb), 0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
            borderRadius: '50%',
          }}
        />

        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          role="img"
          aria-label={`Vibe signature radar chart for ${moodLabel} showing Energy: ${Math.round(energyLevel)}%, Danceability: ${Math.round((features.danceability ?? 0.5) * 100)}%, Valence: ${Math.round((features.valence ?? 0.5) * 100)}%`}
        >
          <defs>
            <linearGradient id="vibeGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--muse-primary)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="var(--muse-secondary)" stopOpacity={0.2} />
            </linearGradient>
            <filter id="vibeGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid rings */}
          {gridLevels.map((level) => {
            const gridPath = buildPath(AXES.map(() => level))
            return (
              <path
                key={level}
                d={gridPath}
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
              />
            )
          })}

          {/* Axis lines */}
          {AXES.map((_, i) => {
            const angle = (360 / AXES.length) * i
            const tip = polarToXY(angle, RADIUS)
            return (
              <line
                key={i}
                x1={CENTER}
                y1={CENTER}
                x2={tip.x}
                y2={tip.y}
                stroke="rgba(255,255,255,0.07)"
                strokeWidth="1"
              />
            )
          })}

          {/* Small dot at each axis tip */}
          {AXES.map((_, i) => {
            const angle = (360 / AXES.length) * i
            const tip = polarToXY(angle, RADIUS)
            return (
              <circle
                key={`dot-${i}`}
                cx={tip.x}
                cy={tip.y}
                r={2}
                fill="rgba(255,255,255,0.2)"
              />
            )
          })}

          {/* Data polygon — animated, gradient fill */}
          <motion.path
            d={dataPath}
            fill="url(#vibeGradient)"
            stroke="var(--muse-primary)"
            strokeWidth="2"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />

          {/* Data points with glow */}
          {values.map((v, i) => {
            const angle = (360 / values.length) * i
            const pt = polarToXY(angle, v * RADIUS)
            return (
              <motion.circle
                key={i}
                cx={pt.x}
                cy={pt.y}
                r={4}
                fill="var(--muse-primary)"
                filter="url(#vibeGlow)"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.8 + i * 0.08 }}
              />
            )
          })}

          {/* Axis labels */}
          {AXES.map((label, i) => {
            const angle = (360 / AXES.length) * i
            const pt = polarToXY(angle, RADIUS + 20)
            return (
              <text
                key={label}
                x={pt.x}
                y={pt.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="9"
                fontFamily="var(--font-geist-mono)"
                fill="rgba(255,255,255,0.35)"
                style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
              >
                {label}
              </text>
            )
          })}
        </svg>
      </div>

      {/* Labels below SVG */}
      <p
        style={{
          fontFamily: 'var(--font-geist-mono)',
          fontSize: '0.62rem',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          color: 'var(--text-muted)',
          textAlign: 'center',
        }}
      >
        YOUR VIBE SIGNATURE
      </p>
      <p
        style={{
          fontFamily: 'var(--font-syne)',
          fontWeight: 700,
          fontSize: '1.05rem',
          color: 'var(--muse-primary)',
          textAlign: 'center',
        }}
      >
        {moodLabel}
      </p>

      <p className="text-[0.68rem] text-center max-w-xs" style={{ color: 'var(--text-muted)' }}>
        The audio DNA of your recommended playlist
      </p>
    </div>
  )
}
