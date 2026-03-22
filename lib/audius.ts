import { AudiusTrack } from '@/types'
import { formatCount, sanitizeTitle } from './utils'

const AUDIUS_BASE = 'https://api.audius.co/v1'
const MIN_PLAY_COUNT = 10 // lowered to get more results for niche moods

interface AudiusRawTrack {
  id: string
  title: string
  user: { name: string }
  artwork: { '480x480'?: string; '150x150'?: string } | null
  play_count: number
  favorite_count: number
  duration: number
  tags: string | null
}

function mapAudiusTrack(raw: AudiusRawTrack): AudiusTrack {
  const coverArt = raw.artwork?.['480x480'] ?? raw.artwork?.['150x150'] ?? ''
  const tags = raw.tags
    ? raw.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : []

  return {
    id: raw.id,
    title: sanitizeTitle(raw.title),
    artist: raw.user.name,
    coverArt,
    streamUrl: `${AUDIUS_BASE}/tracks/${raw.id}/stream`,
    playCount: raw.play_count,
    favoriteCount: raw.favorite_count,
    durationMs: raw.duration * 1000,
    tags,
  }
}

export async function searchAudiusTracks(query: string, limit = 10): Promise<AudiusTrack[]> {
  try {
    const url = `${AUDIUS_BASE}/tracks/search?query=${encodeURIComponent(query)}&limit=${limit}`
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []

    const data = (await res.json()) as { data: AudiusRawTrack[] }
    const tracks = data.data ?? []

    return tracks
      .filter((t) => t.play_count >= MIN_PLAY_COUNT && t.duration > 60)
      .map(mapAudiusTrack)
  } catch {
    return []
  }
}

// Fallback genre queries used when mood-specific searches return nothing
function buildFallbackQueries(queries: string[]): string[] {
  const genres = ['lo-fi', 'indie', 'ambient', 'bedroom pop', 'alternative', 'chill']
  // Extract any single keyword from original queries
  const words = queries
    .flatMap((q) => q.split(' '))
    .filter((w) => w.length > 3)
    .slice(0, 2)

  return [...words.map((w) => `${w} indie`), ...genres.slice(0, 3)]
}

export async function fetchAudiusTracks(queries: string[]): Promise<AudiusTrack[]> {
  const results = await Promise.all(queries.map((q) => searchAudiusTracks(q, 12)))

  const seen = new Set<string>()
  const all: AudiusTrack[] = []

  for (const tracks of results) {
    for (const track of tracks) {
      if (!seen.has(track.id)) {
        seen.add(track.id)
        all.push(track)
      }
    }
  }

  // If specific queries returned nothing, try broader fallback queries
  if (all.length === 0) {
    const fallbackQueries = buildFallbackQueries(queries)
    const fallbackResults = await Promise.all(
      fallbackQueries.map((q) => searchAudiusTracks(q, 8)),
    )
    for (const tracks of fallbackResults) {
      for (const track of tracks) {
        if (!seen.has(track.id)) {
          seen.add(track.id)
          all.push(track)
        }
      }
    }
  }

  // Artist diversity: max 1 track per artist
  const seenArtists = new Set<string>()
  const diverse: AudiusTrack[] = []
  all.sort((a, b) => b.playCount - a.playCount)
  for (const track of all) {
    const artistKey = track.artist.toLowerCase()
    if (!seenArtists.has(artistKey)) {
      seenArtists.add(artistKey)
      diverse.push(track)
    }
    if (diverse.length >= 5) break
  }

  return diverse
}

export { formatCount as formatPlayCount }
