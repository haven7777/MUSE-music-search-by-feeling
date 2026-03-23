'use client'

import { useEffect, useState } from 'react'

export function DynamicBackground() {
  const [vibeActive, setVibeActive] = useState(false)

  useEffect(() => {
    const check = () => {
      const val = document.documentElement.style.getPropertyValue('--muse-primary-rgb')
      setVibeActive(val.trim().length > 0)
    }

    check()

    const observer = new MutationObserver(check)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] })
    return () => observer.disconnect()
  }, [])

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10"
      style={{
        background: vibeActive
          ? `
              radial-gradient(ellipse at 100% 100%, rgba(var(--muse-secondary-rgb), 0.25) 0%, transparent 55%),
              radial-gradient(ellipse at 0%   0%,   rgba(var(--muse-primary-rgb),   0.30) 0%, transparent 55%),
              linear-gradient(135deg,             rgba(var(--muse-primary-rgb),   0.38) 0%, rgba(var(--muse-secondary-rgb), 0.22) 100%),
              var(--muse-bg, #06040f)
            `
          : 'var(--muse-bg, #06040f)',
      }}
    />
  )
}
