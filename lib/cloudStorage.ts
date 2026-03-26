import { createClient } from './supabase/client'
import type { MusePlaylist, FavoriteTrack } from '@/types'

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

// ── Moments ──────────────────────────────────────────────────────────────────

export async function savePlaylistCloud(playlist: MusePlaylist): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('moments').upsert({
    id: playlist.id,
    user_id: user.id,
    original_input: playlist.originalInput,
    vibe_profile: playlist.vibeProfile,
    tracks: playlist.tracks,
    created_at: new Date(playlist.createdAt).toISOString(),
  })
}

export async function getPlaylistsCloud(): Promise<MusePlaylist[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('moments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (!data) return []

  return data.map((row) => ({
    id: row.id as string,
    originalInput: row.original_input as string,
    vibeProfile: row.vibe_profile as MusePlaylist['vibeProfile'],
    tracks: row.tracks as MusePlaylist['tracks'],
    createdAt: new Date(row.created_at as string).getTime(),
  }))
}

export async function getPlaylistByIdCloud(id: string): Promise<MusePlaylist | null> {
  const supabase = createClient()
  const { data } = await supabase.from('moments').select('*').eq('id', id).single()
  if (!data) return null

  return {
    id: data.id as string,
    originalInput: data.original_input as string,
    vibeProfile: data.vibe_profile as MusePlaylist['vibeProfile'],
    tracks: data.tracks as MusePlaylist['tracks'],
    createdAt: new Date(data.created_at as string).getTime(),
  }
}

export async function deletePlaylistCloud(id: string): Promise<void> {
  const supabase = createClient()
  await supabase.from('moments').delete().eq('id', id)
}

export async function clearAllPlaylistsCloud(): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('moments').delete().eq('user_id', user.id)
}

// ── Saved songs ───────────────────────────────────────────────────────────────

export async function addFavoriteTrackCloud(track: FavoriteTrack): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { console.error('[cloudStorage] addFavoriteTrack: no user'); return }

  const { error } = await supabase.from('saved_songs').upsert({
    id: track.id,
    user_id: user.id,
    title: track.title,
    artist: track.artist,
    cover_art: track.coverArt,
    spotify_url: track.spotifyUrl,
    audius_url: track.streamUrl,
    mood_label: track.moodLabel,
    source: track.source,
    preview_url: track.previewUrl,
  })
  if (error) console.error('[cloudStorage] addFavoriteTrack error:', error)
}

export async function getFavoriteTracksCloud(): Promise<FavoriteTrack[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('saved_songs')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) console.error('[cloudStorage] getFavoriteTracks error:', error)
  if (!data) return []

  return data.map((row) => ({
    id: row.id as string,
    source: row.source as 'spotify' | 'audius',
    title: row.title as string,
    artist: row.artist as string,
    coverArt: row.cover_art as string,
    savedAt: new Date(row.created_at as string).getTime(),
    moodLabel: row.mood_label as string | undefined,
    spotifyUrl: row.spotify_url as string | undefined,
    streamUrl: row.audius_url as string | undefined,
    previewUrl: row.preview_url as string | undefined,
  }))
}

export async function removeFavoriteTrackCloud(id: string): Promise<void> {
  const supabase = createClient()
  await supabase.from('saved_songs').delete().eq('id', id)
}

export async function clearAllFavoriteTracksCloud(): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('saved_songs').delete().eq('user_id', user.id)
}

export async function isFavoriteTrackCloud(id: string): Promise<boolean> {
  const supabase = createClient()
  const { data } = await supabase.from('saved_songs').select('id').eq('id', id).single()
  return !!data
}
