export interface ColorPalette {
  primary: string
  secondary: string
  background: string
  text: string
  surface: string
}

export interface VibeProfile {
  emotionalCore: string
  energyLevel: number
  tempoRange: { min: number; max: number }
  valenceTarget: number
  danceability: number
  acousticness: number
  instrumentalness: number
  spotifyGenres: string[]
  sonicTexture: string[]
  era: string
  searchQueries: {
    mainstream: string[]
    underground: string[]
  }
  colorPalette: ColorPalette
  moodLabel: string
}

export interface AudioFeatures {
  energy: number
  valence: number
  danceability: number
  tempo: number
  acousticness: number
  key: number
  mode: number
  keyLabel: string
}

export interface SpotifyTrackData {
  id: string
  title: string
  artist: string
  album: string
  releaseYear: string
  coverArt: string
  spotifyUrl: string
  audioFeatures: AudioFeatures | null
  itunesPreviewUrl: string | null
}

export interface AudiusTrack {
  id: string
  title: string
  artist: string
  coverArt: string
  streamUrl: string
  playCount: number
  favoriteCount: number
  durationMs: number
  tags: string[]
}

export interface RankedTrack {
  source: 'spotify' | 'audius'
  rank: number
  explanation: string
  track: SpotifyTrackData | AudiusTrack
}

export interface MusePlaylist {
  id: string
  originalInput: string
  vibeProfile: VibeProfile
  tracks: RankedTrack[]
  createdAt: number
}

export type AppPhase = 'input' | 'processing' | 'results' | 'error'
