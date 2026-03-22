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
      <p
        className="text-[0.75rem] uppercase tracking-widest font-mono"
        style={{ color: 'var(--text-muted)' }}
      >
        Vibe Signature — {moodLabel}
      </p>

      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label={`Vibe signature radar chart for ${moodLabel} showing Energy: ${Math.round(energyLevel)}%, Danceability: ${Math.round((features.danceability ?? 0.5) * 100)}%, Valence: ${Math.round((features.valence ?? 0.5) * 100)}%`}
      >
        {/* Grid rings — slightly more visible */}
        {gridLevels.map((level) => {
          const gridPath = buildPath(AXES.map(() => level))
          return (
            <path
              key={level}
              d={gridPath}
              fill="none"
              stroke="rgba(255,255,255,0.1)"
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
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
          )
        })}

        {/* Data polygon — animated */}
        <motion.path
          d={dataPath}
          fill="var(--muse-primary)"
          fillOpacity={0.2}
          stroke="var(--muse-primary)"
          strokeWidth="2"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />

        {/* Data points */}
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
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8 + i * 0.08 }}
            />
          )
        })}

        {/* Axis labels — full names, not truncated */}
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
              fontFamily="monospace"
              fill="rgba(255,255,255,0.5)"
              style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              {label}
            </text>
          )
        })}
      </svg>

      <p className="text-[0.68rem] text-center max-w-xs" style={{ color: 'var(--text-muted)' }}>
        The audio DNA of your recommended playlist
      </p>
    </div>
  )
}
