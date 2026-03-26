import { describe, it, expect } from 'vitest'
import { rateLimit } from '@/lib/rateLimit'

describe('rateLimit', () => {
  it('allows requests under the limit', () => {
    const key = `test-${Date.now()}-allow`
    const result = rateLimit(key, { max: 3, windowMs: 60_000 })
    expect(result.ok).toBe(true)
    expect(result.remaining).toBe(2)
  })

  it('blocks requests over the limit', () => {
    const key = `test-${Date.now()}-block`
    rateLimit(key, { max: 2, windowMs: 60_000 })
    rateLimit(key, { max: 2, windowMs: 60_000 })
    const result = rateLimit(key, { max: 2, windowMs: 60_000 })
    expect(result.ok).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('resets after window expires', async () => {
    const key = `test-${Date.now()}-reset`
    rateLimit(key, { max: 1, windowMs: 50 })

    // Wait for the window to expire
    await new Promise((r) => setTimeout(r, 60))

    const result = rateLimit(key, { max: 1, windowMs: 50 })
    expect(result.ok).toBe(true)
  })
})
