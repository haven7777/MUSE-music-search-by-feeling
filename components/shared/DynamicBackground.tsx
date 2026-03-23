'use client'

export function DynamicBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 overflow-hidden"
      style={{ background: 'var(--muse-bg, #080810)' }}
    >
      {/* Base gradient — primary color washes the whole page */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 15% 0%, color-mix(in srgb, var(--muse-primary, #8b5cf6) 22%, transparent) 0%, transparent 55%),
            radial-gradient(ellipse at 85% 5%, color-mix(in srgb, var(--muse-secondary, #06b6d4) 14%, transparent) 0%, transparent 45%),
            radial-gradient(ellipse at 50% 100%, color-mix(in srgb, var(--muse-primary, #8b5cf6) 12%, transparent) 0%, transparent 50%)
          `,
        }}
      />

      {/* Animated layer — shifts slowly */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 20% 50%, color-mix(in srgb, var(--muse-primary, #8b5cf6) 10%, transparent) 0%, transparent 60%)',
          backgroundSize: '200% 200%',
          animation: 'gradientShift 15s ease-in-out infinite',
        }}
      />

      {/* Animated layer 2 — reverse */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 80% 20%, color-mix(in srgb, var(--muse-secondary, #06b6d4) 8%, transparent) 0%, transparent 60%)',
          backgroundSize: '200% 200%',
          animation: 'gradientShift 20s ease-in-out infinite reverse',
        }}
      />

      {/* Orb 1: primary — top-left, large, strong */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '-10%',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: 'var(--muse-primary, #8b5cf6)',
          opacity: 0.18,
          filter: 'blur(140px)',
          animation: 'breathe 8s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />

      {/* Orb 2: secondary — bottom-right */}
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '-5%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'var(--muse-secondary, #06b6d4)',
          opacity: 0.13,
          filter: 'blur(120px)',
          animation: 'breathe 12s ease-in-out infinite',
          animationDelay: '2s',
          pointerEvents: 'none',
        }}
      />

      {/* Orb 3: primary — center, subtle pulse */}
      <div
        style={{
          position: 'absolute',
          top: '40%',
          left: '30%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'var(--muse-primary, #8b5cf6)',
          opacity: 0.08,
          filter: 'blur(100px)',
          animation: 'breathe 10s ease-in-out infinite',
          animationDelay: '4s',
          pointerEvents: 'none',
        }}
      />

      {/* Noise texture overlay for depth */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '256px 256px',
          opacity: 0.4,
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
