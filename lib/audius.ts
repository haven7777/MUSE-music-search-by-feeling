import { AudiusTrack } from '@/types'
import { sanitizeTitle } from './utils'

const AUDIUS_BASE = 'https://api.audius.co/v1'
const MIN_PLAY_COUNT = 10

const KIDS_KEYWORDS = [
  'kids', 'children', "children's", 'lullaby', 'lullabies', 'nursery',
  'toddler', 'baby songs', 'cocomelon', 'kidz bop',
]

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

function isKidsContent(raw: AudiusRawTrack): boolean {
  const titleLower = raw.title.toLowerCase()
  const tagsLower = (raw.tags ?? '').toLowerCase()
  return KIDS_KEYWORDS.some((kw) => titleLower.includes(kw) || tagsLower.includes(kw))
}

function isLatinScript(text: string): boolean {
  const letters = text.replace(/[\s\d.,!?'"()\-&_]/g, '')
  if (letters.length === 0) return true
  const nonLatinCount = letters.replace(/[\u0000-\u024F\u1E00-\u1EFF]/g, '').length
  return nonLatinCount / letters.length < 0.3
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

export async function searchAudiusTracks(query: string, limit = 10, offset = 0): Promise<AudiusRawTrack[]> {
  try {
    const url = `${AUDIUS_BASE}/tracks/search?query=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []

    const data = (await res.json()) as { data: AudiusRawTrack[] }
    return (data.data ?? []).filter((t) => t.play_count >= MIN_PLAY_COUNT && t.duration > 60)
  } catch {
    return []
  }
}

function buildFallbackQueries(queries: string[]): string[] {
  const genres = ['lo-fi', 'indie', 'ambient', 'bedroom pop', 'alternative', 'chill']
  const words = queries
    .flatMap((q) => q.split(' '))
    .filter((w) => w.length > 3)
    .slice(0, 2)

  return [...words.map((w) => `${w} indie`), ...genres.slice(0, 3)]
}

export async function fetchAudiusTracks(
  queries: string[],
  inputIsLatin = true,
  offset = 0,
  excludeIds: Set<string> = new Set(),
): Promise<AudiusTrack[]> {
  const rawResults = await Promise.all(queries.map((q) => searchAudiusTracks(q, 20, offset)))

  const seen = new Set<string>(excludeIds)
  let allRaw: AudiusRawTrack[] = []

  for (const tracks of rawResults) {
    for (const track of tracks) {
      if (!seen.has(track.id)) {
        seen.add(track.id)
        allRaw.push(track)
      }
    }
  }

  if (allRaw.length < 8) {
    const fallbackQueries = buildFallbackQueries(queries)
    const fallbackResults = await Promise.all(
      fallbackQueries.map((q) => searchAudiusTracks(q, 15, offset)),
    )
    for (const tracks of fallbackResults) {
      for (const track of tracks) {
        if (!seen.has(track.id)) {
          seen.add(track.id)
          allRaw.push(track)
        }
      }
    }
  }

  // Filter kids content
  allRaw = allRaw.filter((t) => !isKidsContent(t))

  // Filter non-Latin titles when user typed in English
  if (inputIsLatin) {
    allRaw = allRaw.filter((t) => isLatinScript(t.title))
  }

  const all = allRaw.map(mapAudiusTrack)

  const seenArtists = new Set<string>()
  const diverse: AudiusTrack[] = []
  all.sort((a, b) => b.playCount - a.playCount)
  for (const track of all) {
    const artistKey = track.artist.toLowerCase()
    if (!seenArtists.has(artistKey)) {
      seenArtists.add(artistKey)
      diverse.push(track)
    }
    if (diverse.length >= 8) break
  }

  if (diverse.length < 8) {
    for (const track of all) {
      if (!diverse.find((d) => d.id === track.id)) {
        diverse.push(track)
      }
      if (diverse.length >= 8) break
    }
  }

  return diverse
}

