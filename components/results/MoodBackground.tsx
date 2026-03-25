'use client'

import { useEffect, useRef } from 'react'

interface MoodBackgroundProps {
  primary: string
  secondary: string
}

export function MoodBackground({ primary, secondary }: MoodBackgroundProps) {
  const prefersReduced = useRef(false)

  useEffect(() => {
    prefersReduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  return (
    <div
      className="mood-bg"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Large primary orb — top left */}
      <div
        className="mood-orb mood-orb-1"
        style={{
          position: 'absolute',
          width: '55vmax',
          height: '55vmax',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${primary}aa 0%, ${primary}55 50%, transparent 70%)`,
          top: '-15%',
          left: '-10%',
          filter: 'blur(60px)',
        }}
      />

      {/* Secondary orb — bottom right */}
      <div
        className="mood-orb mood-orb-2"
        style={{
          position: 'absolute',
          width: '50vmax',
          height: '50vmax',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${secondary}99 0%, ${secondary}50 50%, transparent 70%)`,
          bottom: '-20%',
          right: '-15%',
          filter: 'blur(60px)',
        }}
      />

      {/* Smaller accent orb — center */}
      <div
        className="mood-orb mood-orb-3"
        style={{
          position: 'absolute',
          width: '35vmax',
          height: '35vmax',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${primary}88 0%, ${secondary}44 50%, transparent 70%)`,
          top: '40%',
          left: '30%',
          filter: 'blur(80px)',
        }}
      />
    </div>
  )
}
