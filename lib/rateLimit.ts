const MAX_ENTRIES = 10_000
const hits = new Map<string, { count: number; resetAt: number }>()

// Prune expired entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    hits.forEach((entry, key) => {
      if (now > entry.resetAt) hits.delete(key)
    })
  }, 5 * 60_000)
}

interface RateLimitOptions {
  windowMs?: number
  max?: number
}

export function rateLimit(
  key: string,
  { windowMs = 60_000, max = 10 }: RateLimitOptions = {},
): { ok: boolean; remaining: number } {
  const now = Date.now()
  const entry = hits.get(key)

  if (!entry || now > entry.resetAt) {
    // Evict oldest entries if map grows too large
    if (hits.size >= MAX_ENTRIES) {
      const firstKey = hits.keys().next().value
      if (firstKey) hits.delete(firstKey)
    }
    hits.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: max - 1 }
  }

  entry.count++
  if (entry.count > max) {
    return { ok: false, remaining: 0 }
  }
  return { ok: true, remaining: max - entry.count }
}

export function rateLimitByIp(
  request: Request,
  route: string,
  opts?: RateLimitOptions,
) {
  const ip =
    request.headers.get('x-real-ip') ??
    request.headers.get('x-forwarded-for')?.split(',').pop()?.trim() ??
    'unknown'
  return rateLimit(`${route}:${ip}`, opts)
}
