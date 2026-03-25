import { NextRequest, NextResponse } from 'next/server'
import { decodeVibeFromImage } from '@/lib/groq'
import { rateLimitByIp } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  const { ok } = rateLimitByIp(request, 'vibe-image', { windowMs: 60_000, max: 5 })
  if (!ok) {
    return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 })
  }

  try {
    const body = (await request.json()) as { image?: string; mimeType?: string; hint?: string }

    if (!body.image || !body.mimeType) {
      return NextResponse.json({ error: 'Image data and mimeType are required.' }, { status: 400 })
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(body.mimeType)) {
      return NextResponse.json({ error: 'Unsupported image format. Use JPEG, PNG, WebP, or GIF.' }, { status: 400 })
    }

    // Max ~5MB base64 (roughly 6.7MB encoded)
    if (body.image.length > 7_000_000) {
      return NextResponse.json({ error: 'Image is too large. Please use an image under 5MB.' }, { status: 400 })
    }

    const vibeProfile = await decodeVibeFromImage(body.image, body.mimeType, body.hint?.trim())
    console.log('[/api/vibe-image] colorPalette:', JSON.stringify(vibeProfile.colorPalette))
    return NextResponse.json(vibeProfile)
  } catch (error) {
    console.error('[/api/vibe-image]', error)
    return NextResponse.json(
      { error: 'Could not read the mood from your image. Try another photo.' },
      { status: 500 },
    )
  }
}
