export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max)
}

export function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)

  if (days > 0) return `${days} day${days !== 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  if (minutes > 0) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
  return 'just now'
}

const ARTIFACT_PATTERNS: RegExp[] = [
  /\[No Copyright Music\]/gi,
  /\[REMIX CONTEST\]/gi,
  /\[MASTERED\]/gi,
  /\[.*?official.*?\]/gi,
  /\(official (audio|video|music video|lyric video|visualizer)\)/gi,
  /\(lyrics?\)/gi,
  /\s*[\[(]hd[\])]|[\[(]hq[\])]/gi,
  /- radio edit$/gi,
  /\(audio\)$/gi,
  /\(video\)$/gi,
  /\(feat\. [^)]*\)/gi,
]

export function sanitizeTitle(title: string): string {
  let clean = title
  for (const pattern of ARTIFACT_PATTERNS) {
    clean = clean.replace(pattern, '')
  }
  // Remove non-ASCII oddities like trailing ¿
  clean = clean.replace(/[^\x20-\x7E\u00C0-\u024F\u1E00-\u1EFF]/g, '')
  // Collapse multiple spaces, strip trailing dashes/hyphens
  clean = clean.replace(/\s+/g, ' ').replace(/[-–—\s]+$/, '').trim()
  return clean.length >= 2 ? clean : title.trim()
}

/** Retry an async function once after a delay on failure */
export async function withRetry<T>(fn: () => Promise<T>, retries = 1, delayMs = 1000): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    if (retries <= 0) throw err
    await new Promise((r) => setTimeout(r, delayMs))
    return withRetry(fn, retries - 1, delayMs * 2)
  }
}

export function truncateTitle(title: string, maxLen = 45): string {
  const clean = sanitizeTitle(title)
  if (clean.length <= maxLen) return clean
  return clean.slice(0, maxLen - 1) + '…'
}
