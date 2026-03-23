import { AudioFeatures, SpotifyTrackData, VibeProfile } from '@/types'
import { getSpotifyToken } from './spotifyAuth'
import { clamp, sanitizeTitle } from './utils'

const KEY_LABELS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const KIDS_KEYWORDS = [
  'kids', 'children', "children's", 'lullaby', 'lullabies', 'nursery',
  'toddler', 'baby songs', 'sesame street', 'disney junior', 'cocomelon',
  'kidz bop', 'kidzbop', 'nursery rhyme',
]

interface SpotifyRawTrack {
  id: string
  name: string
  artists: Array<{ name: string }>
  album: {
    name: string
    release_date: string
    images: Array<{ url: string; width: number; height: number }>
  }
  external_urls: { spotify: string }
}

interface SpotifyRawFeatures {
  id: string
  energy: number
  valence: number
  danceability: number
  tempo: number
  acousticness: number
  key: number
  mode: number
}

function isKidsContent(track: SpotifyRawTrack): boolean {
  const albumLower = track.album.name.toLowerCase()
  const nameLower = track.name.toLowerCase()
  return KIDS_KEYWORDS.some((kw) => albumLower.includes(kw) || nameLower.includes(kw))
}

function isLatinScript(text: string): boolean {
  const letters = text.replace(/[\s\d.,!?'"()\-&_]/g, '')
  if (letters.length === 0) return true
  const nonLatinCount = letters.replace(/[\u0000-\u024F\u1E00-\u1EFF]/g, '').length
  return nonLatinCount / letters.length < 0.3
}

export async function searchTracks(query: string, token: string): Promise<SpotifyRawTrack[]> {
  const params = new URLSearchParams({ q: query, type: 'track', limit: '10' })
  const url = `https://api.spotify.com/v1/search?${params.toString()}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!res.ok) return []
  const data = (await res.json()) as { tracks: { items: SpotifyRawTrack[] } }
  return data.tracks?.items ?? []
}

export async function getAudioFeatures(
  trackIds: string[],
  token: string,
): Promise<Map<string, AudioFeatures>> {
  if (trackIds.length === 0) return new Map()

  const ids = trackIds.slice(0, 100).join(',')
  const res = await fetch(`https://api.spotify.com/v1/audio-features?ids=${ids}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })

  if (!res.ok) return new Map()

  const data = (await res.json()) as { audio_features: Array<SpotifyRawFeatures | null> }
  const map = new Map<string, AudioFeatures>()

  for (const f of data.audio_features) {
    if (!f) continue
    map.set(f.id, {
      energy: f.energy,
      valence: f.valence,
      danceability: f.danceability,
      tempo: f.tempo,
      acousticness: f.acousticness,
      key: f.key,
      mode: f.mode,
      keyLabel: f.key >= 0 ? KEY_LABELS[f.key] ?? 'C' : 'C',
    })
  }

  return map
}

export function filterByVibe(
  tracks: SpotifyTrackData[],
  vibeProfile: VibeProfile,
): SpotifyTrackData[] {
  const targetEnergy = vibeProfile.energyLevel / 100
  const targetValence = vibeProfile.valenceTarget

  return tracks.filter((t) => {
    if (!t.audioFeatures) return true
    const energyMatch = Math.abs(t.audioFeatures.energy - targetEnergy) <= 0.2
    const valenceMatch = Math.abs(t.audioFeatures.valence - targetValence) <= 0.25
    return energyMatch && valenceMatch
  })
}

export function mapToSpotifyTrackData(
  raw: SpotifyRawTrack,
  features: AudioFeatures | null,
): SpotifyTrackData {
  const images = raw.album.images
  const coverArt = images.find((i) => i.width >= 300)?.url ?? images[0]?.url ?? ''
  const releaseYear = raw.album.release_date?.slice(0, 4) ?? ''

  return {
    id: raw.id,
    title: sanitizeTitle(raw.name),
    artist: raw.artists.map((a) => a.name).join(', '),
    album: raw.album.name,
    releaseYear,
    coverArt,
    spotifyUrl: raw.external_urls.spotify,
    audioFeatures: features,
    itunesPreviewUrl: null,
  }
}

function dedupeAndSort(
  rawTracks: SpotifyRawTrack[],
  featuresMap: Map<string, AudioFeatures>,
  vibeProfile: VibeProfile,
): SpotifyTrackData[] {
  const seen = new Set<string>()
  const tracks: SpotifyTrackData[] = []

  for (const raw of rawTracks) {
    if (!seen.has(raw.id)) {
      seen.add(raw.id)
      tracks.push(mapToSpotifyTrackData(raw, featuresMap.get(raw.id) ?? null))
    }
  }

  const energyTarget = clamp(vibeProfile.energyLevel / 100, 0, 1)
  const valenceTarget = clamp(vibeProfile.valenceTarget, 0, 1)
  const danceTarget = clamp((vibeProfile.danceability ?? 50) / 100, 0, 1)
  const acousticTarget = clamp((vibeProfile.acousticness ?? 50) / 100, 0, 1)

  tracks.sort((a, b) => {
    const score = (t: SpotifyTrackData) => {
      if (!t.audioFeatures) return 2
      return (
        Math.abs(t.audioFeatures.energy - energyTarget) * 1.2 +
        Math.abs(t.audioFeatures.valence - valenceTarget) * 1.2 +
        Math.abs(t.audioFeatures.danceability - danceTarget) * 0.8 +
        Math.abs(t.audioFeatures.acousticness - acousticTarget) * 0.8
      )
    }
    return score(a) - score(b)
  })

  return tracks
}

function applyArtistDiversity(pool: SpotifyTrackData[]): SpotifyTrackData[] {
  const seenArtists = new Set<string>()
  const diverse: SpotifyTrackData[] = []

  for (const track of pool) {
    const primaryArtist = track.artist.split(',')[0].trim().toLowerCase()
    if (!seenArtists.has(primaryArtist)) {
      seenArtists.add(primaryArtist)
      diverse.push(track)
    }
    if (diverse.length >= 14) break
  }

  if (diverse.length < 14) {
    for (const track of pool) {
      if (!diverse.find((d) => d.id === track.id)) {
        diverse.push(track)
      }
      if (diverse.length >= 14) break
    }
  }

  return diverse.slice(0, 14)
}

// Genre-based fallback queries when mood-specific searches return too few results
function buildSpotifyFallback(vibeProfile: VibeProfile): string[] {
  const genres = vibeProfile.spotifyGenres ?? ['indie', 'sad']
  const core = vibeProfile.emotionalCore ?? ''
  return [
    ...genres.map((g) => `${g} ${core}`.trim()),
    ...genres.map((g) => `${g} playlist`),
    `${vibeProfile.moodLabel ?? ''} music`.trim(),
  ].filter(Boolean).slice(0, 4)
}

export async function fetchSpotifyTracks(
  queries: string[],
  vibeProfile: VibeProfile,
  inputIsLatin = true,
): Promise<SpotifyTrackData[]> {
  const token = await getSpotifyToken()

  const rawResults = await Promise.all(queries.map((q) => searchTracks(q, token)))
  const seen = new Set<string>()
  let allRaw: SpotifyRawTrack[] = []

  for (const results of rawResults) {
    for (const track of results) {
      if (!seen.has(track.id)) {
        seen.add(track.id)
        allRaw.push(track)
      }
    }
  }

  if (allRaw.length < 16) {
    const fallbackQueries = buildSpotifyFallback(vibeProfile)
    const fallbackResults = await Promise.all(fallbackQueries.map((q) => searchTracks(q, token)))
    for (const results of fallbackResults) {
      for (const track of results) {
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
    allRaw = allRaw.filter((t) => isLatinScript(t.name))
  }

  const allIds = allRaw.map((t) => t.id)
  const featuresMap = await getAudioFeatures(allIds, token)
  const sorted = dedupeAndSort(allRaw, featuresMap, vibeProfile)
  const filtered = filterByVibe(sorted, vibeProfile)
  const pool = filtered.length >= 4 ? filtered : sorted
  return applyArtistDiversity(pool)
}
