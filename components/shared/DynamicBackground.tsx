'use client'

export function DynamicBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 overflow-hidden"
      style={{ background: 'var(--muse-bg, #080810)' }}
    >
      {/* Layer 1: primary at 6% opacity, gradientShift 15s */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 20% 50%, color-mix(in srgb, var(--muse-primary, #8b5cf6) 6%, transparent) 0%, transparent 60%)',
          backgroundSize: '200% 200%',
          animation: 'gradientShift 15s ease-in-out infinite',
        }}
      />

      {/* Layer 2: secondary at 4% opacity, gradientShift 20s reverse */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 80% 20%, color-mix(in srgb, var(--muse-secondary, #06b6d4) 4%, transparent) 0%, transparent 60%)',
          backgroundSize: '200% 200%',
          animation: 'gradientShift 20s ease-in-out infinite reverse',
        }}
      />

      {/* Layer 3: white at 2% opacity, gradientShift 25s */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, color-mix(in srgb, white 2%, transparent) 0%, transparent 60%)',
          backgroundSize: '200% 200%',
          animation: 'gradientShift 25s ease-in-out infinite',
        }}
      />

      {/* Orb 1: primary, 600px, top-left, breathe 8s */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '-5%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'var(--muse-primary, #8b5cf6)',
          opacity: 0.07,
          filter: 'blur(120px)',
          animation: 'breathe 8s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />

      {/* Orb 2: secondary, 500px, bottom-right, breathe 12s delay 2s */}
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '-5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'var(--muse-secondary, #06b6d4)',
          opacity: 0.05,
          filter: 'blur(100px)',
          animation: 'breathe 12s ease-in-out infinite',
          animationDelay: '2s',
          pointerEvents: 'none',
        }}
      />

      {/* Orb 3: white, 400px, center, breathe 10s delay 4s */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'white',
          opacity: 0.03,
          filter: 'blur(80px)',
          animation: 'breathe 10s ease-in-out infinite',
          animationDelay: '4s',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
