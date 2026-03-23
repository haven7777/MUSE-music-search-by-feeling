// ── MUSE Motion Design System ────────────────────────────────
// Centralized animation constants for consistent, intentional motion.
// All durations in seconds; all easings as cubic-bezier arrays.

export const ease = {
  out: [0.4, 0, 0.2, 1] as [number, number, number, number],
  in: [0.4, 0, 1, 1] as [number, number, number, number],
  inOut: [0.4, 0, 0.6, 1] as [number, number, number, number],
  spring: { type: 'spring' as const, stiffness: 300, damping: 30 },
  gentle: { type: 'spring' as const, stiffness: 150, damping: 20 },
  bounce: { type: 'spring' as const, stiffness: 400, damping: 25 },
}

export const dur = {
  instant: 0.1,
  fast: 0.15,
  base: 0.25,
  slow: 0.4,
  slower: 0.6,
  crawl: 1.0,
}

// ── Standard preset animations ───────────────────────────────
// Use with: <motion.div {...fadeUp} transition={{ duration: dur.slow, ease: ease.out }}>

export const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

export const fadeDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
}

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
}

export const slideUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

// ── Stagger container helpers ────────────────────────────────
// Apply to a motion.div wrapping a list of items

export const staggerContainer = (staggerChildren = 0.06, delayChildren = 0) => ({
  animate: { transition: { staggerChildren, delayChildren } },
})

export const staggerItem = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
}
