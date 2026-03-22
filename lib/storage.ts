import { MusePlaylist } from '@/types'

const STORAGE_KEY = 'muse_moments'
const MAX_PLAYLISTS = 50

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function getPlaylists(): MusePlaylist[] {
  try {
    if (typeof window === 'undefined') return []
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as MusePlaylist[]
    // Sort newest first
    return parsed.sort((a, b) => b.createdAt - a.createdAt)
  } catch {
    return []
  }
}

export function savePlaylist(playlist: MusePlaylist): void {
  try {
    if (typeof window === 'undefined') return
    const existing = getPlaylists()
    const withTimestamp = { ...playlist, updatedAt: Date.now() }
    const updated = [withTimestamp, ...existing.filter((p) => p.id !== playlist.id)].slice(
      0,
      MAX_PLAYLISTS,
    )
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // Silent fail
  }
}

export function deletePlaylist(id: string): void {
  try {
    if (typeof window === 'undefined') return
    const existing = getPlaylists()
    const updated = existing.filter((p) => p.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // Silent fail
  }
}

export function clearAllPlaylists(): void {
  try {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Silent fail
  }
}

export function getPlaylistById(id: string): MusePlaylist | null {
  const all = getPlaylists()
  return all.find((p) => p.id === id) ?? null
}
