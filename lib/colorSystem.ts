import { ColorPalette } from '@/types'

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '')
  if (clean.length !== 6) return null
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  }
}

function relativeLuminance(r: number, g: number, b: number): number {
  const toLinear = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

export function computeContrastText(background: string): string {
  const rgb = hexToRgb(background)
  if (!rgb) return '#fafafa'
  const lum = relativeLuminance(rgb.r, rgb.g, rgb.b)
  return lum > 0.179 ? '#0a0a0a' : '#fafafa'
}

export function applyColorPalette(palette: ColorPalette): void {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  root.style.setProperty('--muse-primary', palette.primary)
  root.style.setProperty('--muse-secondary', palette.secondary)
  root.style.setProperty('--muse-text', palette.text)
  root.style.setProperty('--muse-surface', palette.surface)

  // Blend the mood primary color into the page background
  const primaryRgb = hexToRgb(palette.primary)
  if (primaryRgb) {
    root.style.setProperty('--muse-primary-rgb', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`)
    // Build a tinted dark background using the primary color
    const { r, g, b } = primaryRgb
    const bg = `rgb(${Math.round(r * 0.07)}, ${Math.round(g * 0.07)}, ${Math.round(b * 0.12 + 6)})`
    root.style.setProperty('--muse-bg', bg)
  } else {
    root.style.setProperty('--muse-bg', palette.background)
  }
}

export function generateGradient(palette: ColorPalette): string {
  return `radial-gradient(ellipse at 20% 50%, ${palette.primary}22 0%, transparent 60%),
          radial-gradient(ellipse at 80% 20%, ${palette.secondary}18 0%, transparent 50%),
          radial-gradient(ellipse at 50% 80%, ${palette.primary}10 0%, transparent 50%),
          linear-gradient(135deg, ${palette.background} 0%, ${palette.surface} 100%)`
}

export function hexWithOpacity(hex: string, opacity: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`
}
