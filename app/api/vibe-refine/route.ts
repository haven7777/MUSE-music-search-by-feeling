import { NextRequest, NextResponse } from 'next/server'
import { refineVibe } from '@/lib/groq'
import { VibeProfile } from '@/types'
import { rateLimitByIp } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  const { ok } = rateLimitByIp(request, 'vibe-refine', { windowMs: 60_000, max: 10 })
  if (!ok) {
    return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 })
  }

  try {
    const body = (await request.json()) as {
      currentVibe?: VibeProfile
      originalInput?: string
      refinement?: string
    }

    const { currentVibe, originalInput, refinement } = body

    if (!currentVibe || !originalInput || typeof refinement !== 'string' || refinement.trim().length < 2) {
      return NextResponse.json({ error: 'Invalid refinement request.' }, { status: 400 })
    }

    const refined = await refineVibe(currentVibe, originalInput, refinement.trim())
    return NextResponse.json(refined)
  } catch (error) {
    console.error('[/api/vibe-refine]', error)
    return NextResponse.json(
      { error: 'Could not refine your vibe. Try again.' },
      { status: 500 },
    )
  }
}
