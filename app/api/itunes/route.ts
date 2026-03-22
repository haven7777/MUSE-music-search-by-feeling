import { NextRequest, NextResponse } from 'next/server'
import { findPreview } from '@/lib/itunes'

interface TrackInput {
  id: string
  title: string
  artist: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { tracks?: TrackInput[] }
    const { tracks } = body

    if (!Array.isArray(tracks)) {
      return NextResponse.json({ error: 'Invalid tracks array' }, { status: 400 })
    }

    const previews = await Promise.all(
      tracks.map(async (t) => ({
        id: t.id,
        previewUrl: await findPreview(t.title, t.artist),
      })),
    )

    const result: Record<string, string | null> = {}
    for (const { id, previewUrl } of previews) {
      result[id] = previewUrl
    }

    return NextResponse.json({ previews: result })
  } catch (error) {
    console.error('[/api/itunes]', error)
    return NextResponse.json({ previews: {} })
  }
}
