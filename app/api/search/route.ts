import { NextRequest, NextResponse } from 'next/server'
import { fetchSpotifyTracks } from '@/lib/spotify'
import { fetchAudiusTracks } from '@/lib/audius'
import { VibeProfile } from '@/types'

function isLatinInput(text: string): boolean {
  const letters = text.replace(/[\s\d.,!?'"()\-&_]/g, '')
  if (letters.length === 0) return true
  const nonLatinCount = letters.replace(/[\u0000-\u024F\u1E00-\u1EFF]/g, '').length
  return nonLatinCount / letters.length < 0.3
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { vibeProfile?: VibeProfile; originalInput?: string }
    const { vibeProfile, originalInput } = body

    if (!vibeProfile?.searchQueries) {
      return NextResponse.json({ error: 'Invalid vibe profile' }, { status: 400 })
    }

    const inputIsLatin = isLatinInput(originalInput ?? '')

    const [spotify, audius] = await Promise.all([
      fetchSpotifyTracks(vibeProfile.searchQueries.mainstream, vibeProfile, inputIsLatin).catch(() => []),
      fetchAudiusTracks(vibeProfile.searchQueries.underground, inputIsLatin).catch(() => []),
    ])

    return NextResponse.json({ spotify, audius })
  } catch (error) {
    console.error('[/api/search]', error)
    return NextResponse.json({ error: 'Music search failed. Try again.' }, { status: 500 })
  }
}
