import { NextRequest, NextResponse } from 'next/server'
import { fetchSpotifyTracks } from '@/lib/spotify'
import { fetchAudiusTracks } from '@/lib/audius'
import { VibeProfile } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { vibeProfile?: VibeProfile }
    const { vibeProfile } = body

    if (!vibeProfile?.searchQueries) {
      return NextResponse.json({ error: 'Invalid vibe profile' }, { status: 400 })
    }

    const [spotify, audius] = await Promise.all([
      fetchSpotifyTracks(vibeProfile.searchQueries.mainstream, vibeProfile).catch(() => []),
      fetchAudiusTracks(vibeProfile.searchQueries.underground).catch(() => []),
    ])

    return NextResponse.json({ spotify, audius })
  } catch (error) {
    console.error('[/api/search]', error)
    return NextResponse.json({ error: 'Music search failed. Try again.' }, { status: 500 })
  }
}
