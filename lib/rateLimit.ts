const hits = new Map<string, { count: number; resetAt: number }>()

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
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() ?? 'unknown'
  return rateLimit(`${route}:${ip}`, opts)
}
