import { NextRequest, NextResponse } from 'next/server'
import { decodeVibe } from '@/lib/groq'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { input?: unknown }
    const input = body.input

    if (typeof input !== 'string' || input.trim().length < 3 || input.trim().length > 500) {
      return NextResponse.json(
        { error: 'Please describe your feeling in 3–500 characters.' },
        { status: 400 },
      )
    }

    const vibeProfile = await decodeVibe(input.trim())
    return NextResponse.json(vibeProfile)
  } catch (error) {
    console.error('[/api/vibe]', error)
    return NextResponse.json(
      { error: 'Could not decode your feeling. Try again.' },
      { status: 500 },
    )
  }
}
