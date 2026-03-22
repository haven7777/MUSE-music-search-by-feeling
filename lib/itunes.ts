interface ItunesResult {
  artistName: string
  trackName: string
  previewUrl?: string
}

interface ItunesResponse {
  resultCount: number
  results: ItunesResult[]
}

const previewCache = new Map<string, string | null>()

export async function findPreview(title: string, artist: string): Promise<string | null> {
  const cacheKey = `${title.toLowerCase()}::${artist.toLowerCase()}`
  if (previewCache.has(cacheKey)) {
    return previewCache.get(cacheKey) ?? null
  }

  try {
    const term = encodeURIComponent(`${title} ${artist}`)
    const url = `https://itunes.apple.com/search?term=${term}&entity=song&limit=5`
    const res = await fetch(url)
    if (!res.ok) {
      previewCache.set(cacheKey, null)
      return null
    }

    const data = (await res.json()) as ItunesResponse
    const artistLower = artist.toLowerCase()

    const match = data.results.find(
      (r) =>
        r.artistName.toLowerCase().includes(artistLower) ||
        artistLower.includes(r.artistName.toLowerCase()),
    )

    const preview = match?.previewUrl ?? null
    previewCache.set(cacheKey, preview)
    return preview
  } catch {
    previewCache.set(cacheKey, null)
    return null
  }
}
