import { NextRequest, NextResponse } from 'next/server'
import { rankTracks } from '@/lib/groq'
import { AudiusTrack, RankedTrack, SpotifyTrackData, VibeProfile } from '@/types'

interface RankRequestBody {
  originalInput?: string
  vibeProfile?: VibeProfile
  tracks?: Array<{
    source: 'spotify' | 'audius'
    track: SpotifyTrackData | AudiusTrack
  }>
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RankRequestBody
    const { originalInput, vibeProfile, tracks } = body

    if (!originalInput || !vibeProfile || !Array.isArray(tracks)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const ranked: RankedTrack[] = await rankTracks(originalInput, vibeProfile, tracks)
    return NextResponse.json(ranked)
  } catch (error) {
    console.error('[/api/rank]', error)
    return NextResponse.json({ error: 'Ranking failed. Showing unranked results.' }, { status: 500 })
  }
}
