import { describe, it, expect } from 'vitest'
import {
  formatCount,
  formatDuration,
  clamp,
  timeAgo,
  sanitizeTitle,
  truncateTitle,
  withRetry,
} from '@/lib/utils'

describe('formatCount', () => {
  it('returns raw number under 1K', () => {
    expect(formatCount(500)).toBe('500')
  })
  it('formats thousands', () => {
    expect(formatCount(1500)).toBe('1.5K')
  })
  it('formats millions', () => {
    expect(formatCount(2_500_000)).toBe('2.5M')
  })
})

describe('formatDuration', () => {
  it('formats seconds correctly', () => {
    expect(formatDuration(0)).toBe('0:00')
    expect(formatDuration(5000)).toBe('0:05')
    expect(formatDuration(65000)).toBe('1:05')
    expect(formatDuration(3600000)).toBe('60:00')
  })
})

describe('clamp', () => {
  it('clamps below min', () => {
    expect(clamp(-5, 0, 100)).toBe(0)
  })
  it('clamps above max', () => {
    expect(clamp(150, 0, 100)).toBe(100)
  })
  it('returns value in range', () => {
    expect(clamp(50, 0, 100)).toBe(50)
  })
})

describe('timeAgo', () => {
  it('returns "just now" for recent timestamps', () => {
    expect(timeAgo(Date.now() - 10_000)).toBe('just now')
  })
  it('returns minutes', () => {
    expect(timeAgo(Date.now() - 5 * 60_000)).toBe('5 minutes ago')
  })
  it('returns hours', () => {
    expect(timeAgo(Date.now() - 3 * 3_600_000)).toBe('3 hours ago')
  })
  it('returns days', () => {
    expect(timeAgo(Date.now() - 2 * 86_400_000)).toBe('2 days ago')
  })
  it('handles singular', () => {
    expect(timeAgo(Date.now() - 86_400_000)).toBe('1 day ago')
  })
})

describe('sanitizeTitle', () => {
  it('removes official audio tags', () => {
    expect(sanitizeTitle('Song Name (Official Audio)')).toBe('Song Name')
  })
  it('removes lyrics tags', () => {
    expect(sanitizeTitle('Song Name (Lyrics)')).toBe('Song Name')
  })
  it('removes HD/HQ tags', () => {
    expect(sanitizeTitle('Song Name [HD]')).toBe('Song Name')
  })
  it('preserves short titles', () => {
    expect(sanitizeTitle('OK')).toBe('OK')
  })
})

describe('truncateTitle', () => {
  it('does not truncate short titles', () => {
    expect(truncateTitle('Short')).toBe('Short')
  })
  it('truncates long titles with ellipsis', () => {
    const long = 'A'.repeat(60)
    const result = truncateTitle(long, 45)
    expect(result.length).toBe(45)
    expect(result.endsWith('…')).toBe(true)
  })
})

describe('withRetry', () => {
  it('returns on first success', async () => {
    const fn = vi.fn().mockResolvedValue('ok')
    const result = await withRetry(fn, 1, 10)
    expect(result).toBe('ok')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('retries on failure then succeeds', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('ok')
    const result = await withRetry(fn, 1, 10)
    expect(result).toBe('ok')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('throws after exhausting retries', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'))
    await expect(withRetry(fn, 1, 10)).rejects.toThrow('fail')
    expect(fn).toHaveBeenCalledTimes(2)
  })
})
