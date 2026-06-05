interface DeezerTrack {
  id: number
  title: string
  preview: string
  artist: { name: string }
}

interface DeezerResponse {
  data: DeezerTrack[]
}

const previewCache = new Map<string, string | null>()

export async function findPreview(title: string, artist: string): Promise<string | null> {
  const cacheKey = `${title.toLowerCase()}::${artist.toLowerCase()}`
  if (previewCache.has(cacheKey)) {
    return previewCache.get(cacheKey) ?? null
  }

  try {
    const q = encodeURIComponent(`${title} ${artist}`)
    const url = `https://api.deezer.com/search?q=${q}&limit=5`
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) })
    if (!res.ok) {
      previewCache.set(cacheKey, null)
      return null
    }

    const data = (await res.json()) as DeezerResponse
    const artistLower = artist.toLowerCase()

    const match = data.data?.find(
      (r) =>
        r.artist.name.toLowerCase().includes(artistLower) ||
        artistLower.includes(r.artist.name.toLowerCase()),
    )

    const preview = match?.preview ?? null
    previewCache.set(cacheKey, preview)
    return preview
  } catch {
    previewCache.set(cacheKey, null)
    return null
  }
}
