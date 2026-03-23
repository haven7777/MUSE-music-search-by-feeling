'use client'

export function DynamicBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10"
      style={{
        background: `
          radial-gradient(ellipse at 100% 100%, rgba(var(--muse-secondary-rgb, 6,182,212), 0.25) 0%, transparent 55%),
          radial-gradient(ellipse at 0% 0%,   rgba(var(--muse-primary-rgb,   139,92,246),  0.30) 0%, transparent 55%),
          linear-gradient(135deg,             rgba(var(--muse-primary-rgb,   139,92,246),  0.38) 0%, rgba(var(--muse-secondary-rgb, 6,182,212), 0.22) 100%),
          var(--muse-bg, #06040f)
        `,
      }}
    />
  )
}
