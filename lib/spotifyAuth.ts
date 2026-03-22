interface TokenCache {
  token: string
  expiresAt: number
}

let cache: TokenCache | null = null

export async function getSpotifyToken(): Promise<string> {
  const now = Date.now()
  if (cache && cache.expiresAt > now + 60_000) {
    return cache.token
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Missing Spotify credentials')
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    throw new Error(`Spotify auth failed: ${response.status}`)
  }

  const data = (await response.json()) as { access_token: string; expires_in: number }

  cache = {
    token: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  }

  return cache.token
}
