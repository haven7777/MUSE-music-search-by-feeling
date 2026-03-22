'use client'

export function DynamicBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 overflow-hidden"
      style={{ background: 'var(--muse-bg, #080810)' }}
    >
      <div
        className="absolute inset-0 animate-muse-breath"
        style={{
          background: `
            radial-gradient(ellipse at 20% 50%, color-mix(in srgb, var(--muse-primary, #8b5cf6) 15%, transparent) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, color-mix(in srgb, var(--muse-secondary, #06b6d4) 12%, transparent) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 90%, color-mix(in srgb, var(--muse-primary, #8b5cf6) 8%, transparent) 0%, transparent 50%)
          `,
          backgroundSize: '200% 200%',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 70% 60%, color-mix(in srgb, var(--muse-secondary, #06b6d4) 6%, transparent) 0%, transparent 40%)
          `,
          animation: 'museBreath 12s ease-in-out infinite reverse',
          backgroundSize: '200% 200%',
        }}
      />
    </div>
  )
}
