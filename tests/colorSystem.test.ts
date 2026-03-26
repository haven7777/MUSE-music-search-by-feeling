import { describe, it, expect } from 'vitest'
import { computeContrastText, hexWithOpacity, generateGradient } from '@/lib/colorSystem'

describe('computeContrastText', () => {
  it('returns light text for dark backgrounds', () => {
    expect(computeContrastText('#000000')).toBe('#fafafa')
    expect(computeContrastText('#0a0a1a')).toBe('#fafafa')
  })

  it('returns dark text for light backgrounds', () => {
    expect(computeContrastText('#ffffff')).toBe('#0a0a0a')
    expect(computeContrastText('#f0f0f0')).toBe('#0a0a0a')
  })

  it('returns fallback for invalid hex', () => {
    expect(computeContrastText('not-a-hex')).toBe('#fafafa')
  })
})

describe('hexWithOpacity', () => {
  it('converts hex to rgba', () => {
    expect(hexWithOpacity('#ff0000', 0.5)).toBe('rgba(255, 0, 0, 0.5)')
  })

  it('returns original hex for invalid input', () => {
    expect(hexWithOpacity('invalid', 0.5)).toBe('invalid')
  })
})

describe('generateGradient', () => {
  it('returns gradient string containing palette colors', () => {
    const palette = {
      primary: '#8b5cf6',
      secondary: '#06b6d4',
      background: '#080810',
      text: '#fafafa',
      surface: '#0d0d1a',
    }
    const gradient = generateGradient(palette)
    expect(gradient).toContain('#8b5cf6')
    expect(gradient).toContain('#06b6d4')
    expect(gradient).toContain('radial-gradient')
  })
})
