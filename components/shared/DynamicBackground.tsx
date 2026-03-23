'use client'

export function DynamicBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 overflow-hidden"
      style={{ background: 'var(--muse-bg, #06040f)' }}
    >
      {/* Primary blob — top-left, dominant */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '-15%',
          width: '80vw',
          height: '80vw',
          maxWidth: '900px',
          maxHeight: '900px',
          borderRadius: '50%',
          background: 'var(--muse-primary, #8b5cf6)',
          opacity: 0.28,
          filter: 'blur(160px)',
          animation: 'breathe 9s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />

      {/* Secondary blob — top-right */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          right: '-15%',
          width: '65vw',
          height: '65vw',
          maxWidth: '750px',
          maxHeight: '750px',
          borderRadius: '50%',
          background: 'var(--muse-secondary, #06b6d4)',
          opacity: 0.22,
          filter: 'blur(140px)',
          animation: 'breathe 11s ease-in-out infinite',
          animationDelay: '1.5s',
          pointerEvents: 'none',
        }}
      />

      {/* Primary blob — bottom center, anchors bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: '-20%',
          left: '20%',
          width: '60vw',
          height: '60vw',
          maxWidth: '700px',
          maxHeight: '700px',
          borderRadius: '50%',
          background: 'var(--muse-primary, #8b5cf6)',
          opacity: 0.18,
          filter: 'blur(130px)',
          animation: 'breathe 13s ease-in-out infinite',
          animationDelay: '3s',
          pointerEvents: 'none',
        }}
      />

      {/* Secondary accent — bottom-right */}
      <div
        style={{
          position: 'absolute',
          bottom: '-5%',
          right: '-10%',
          width: '45vw',
          height: '45vw',
          maxWidth: '550px',
          maxHeight: '550px',
          borderRadius: '50%',
          background: 'var(--muse-secondary, #06b6d4)',
          opacity: 0.14,
          filter: 'blur(110px)',
          animation: 'breathe 8s ease-in-out infinite',
          animationDelay: '5s',
          pointerEvents: 'none',
        }}
      />

      {/* Center mix — where primary and secondary overlap */}
      <div
        style={{
          position: 'absolute',
          top: '25%',
          left: '25%',
          width: '50vw',
          height: '50vw',
          maxWidth: '600px',
          maxHeight: '600px',
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(var(--muse-primary-rgb, 139,92,246), 0.15) 0%, rgba(var(--muse-secondary-rgb, 6,182,212), 0.10) 50%, transparent 70%)`,
          filter: 'blur(80px)',
          animation: 'breathe 15s ease-in-out infinite',
          animationDelay: '2s',
          pointerEvents: 'none',
        }}
      />

      {/* Dark vignette overlay — keeps edges deep so content is legible */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,0.45) 100%)
          `,
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
