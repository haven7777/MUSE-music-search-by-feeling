import { NextRequest, NextResponse } from 'next/server'
import { fetchSpotifyTracks } from '@/lib/spotify'
import { fetchAudiusTracks } from '@/lib/audius'
import { VibeProfile } from '@/types'
import { rateLimitByIp } from '@/lib/rateLimit'

function isLatinInput(text: string): boolean {
  const letters = text.replace(/[\s\d.,!?'"()\-&_]/g, '')
  if (letters.length === 0) return true
  const nonLatinCount = letters.replace(/[\u0000-\u024F\u1E00-\u1EFF]/g, '').length
  return nonLatinCount / letters.length < 0.3
}

export async function POST(request: NextRequest) {
  const { ok } = rateLimitByIp(request, 'search', { windowMs: 60_000, max: 10 })
  if (!ok) {
    return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 })
  }

  try {
    const body = (await request.json()) as { vibeProfile?: VibeProfile; originalInput?: string; offset?: number; excludeIds?: string[] }
    const { vibeProfile, originalInput, offset, excludeIds } = body

    if (!vibeProfile?.searchQueries) {
      return NextResponse.json({ error: 'Invalid vibe profile' }, { status: 400 })
    }

    const inputIsLatin = isLatinInput(originalInput ?? '')
    const excludeSet = new Set(excludeIds ?? [])

    const [spotify, audius] = await Promise.all([
      fetchSpotifyTracks(vibeProfile.searchQueries.mainstream, vibeProfile, inputIsLatin, offset ?? 0, excludeSet).catch(() => []),
      fetchAudiusTracks(vibeProfile.searchQueries.underground, inputIsLatin, offset ?? 0, excludeSet).catch(() => []),
    ])

    return NextResponse.json({ spotify, audius })
  } catch (error) {
    console.error('[/api/search]', error)
    return NextResponse.json({ error: 'Music search failed. Try again.' }, { status: 500 })
  }
}
