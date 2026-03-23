'use client'

export function DynamicBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 overflow-hidden"
      style={{ background: 'var(--muse-bg, #06040f)' }}
    >
      {/* Full-page diagonal gradient — mirrors the VibeSignature linearGradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            135deg,
            rgba(var(--muse-primary-rgb, 139,92,246), 0.38) 0%,
            rgba(var(--muse-secondary-rgb, 6,182,212), 0.22) 100%
          )`,
        }}
      />

      {/* Top-left bloom — intensifies the primary corner */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 0% 0%, rgba(var(--muse-primary-rgb, 139,92,246), 0.30) 0%, transparent 55%)`,
        }}
      />

      {/* Bottom-right bloom — intensifies the secondary corner */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 100% 100%, rgba(var(--muse-secondary-rgb, 6,182,212), 0.25) 0%, transparent 55%)`,
        }}
      />

      {/* Breathing animation on primary — makes it feel alive */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '-10%',
          width: '70vw',
          height: '70vw',
          maxWidth: '800px',
          maxHeight: '800px',
          borderRadius: '50%',
          background: 'var(--muse-primary, #8b5cf6)',
          opacity: 0.15,
          filter: 'blur(150px)',
          animation: 'breathe 9s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />

      {/* Breathing animation on secondary */}
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '-10%',
          width: '60vw',
          height: '60vw',
          maxWidth: '700px',
          maxHeight: '700px',
          borderRadius: '50%',
          background: 'var(--muse-secondary, #06b6d4)',
          opacity: 0.12,
          filter: 'blur(130px)',
          animation: 'breathe 11s ease-in-out infinite',
          animationDelay: '2s',
          pointerEvents: 'none',
        }}
      />

      {/* Center vignette — keeps text readable */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 40%, transparent 20%, rgba(0,0,0,0.40) 100%)`,
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
