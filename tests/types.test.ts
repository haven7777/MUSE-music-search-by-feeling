import { describe, it, expect } from 'vitest'
import { isSpotifyTrack, isAudiusTrack, SpotifyTrackData, AudiusTrack } from '@/types'

const mockSpotify: SpotifyTrackData = {
  id: 'sp1',
  title: 'Test Song',
  artist: 'Test Artist',
  album: 'Test Album',
  releaseYear: '2024',
  coverArt: 'https://example.com/cover.jpg',
  spotifyUrl: 'https://open.spotify.com/track/sp1',
  audioFeatures: null,
  itunesPreviewUrl: null,
}

const mockAudius: AudiusTrack = {
  id: 'au1',
  title: 'Underground Song',
  artist: 'Indie Artist',
  coverArt: 'https://example.com/cover.jpg',
  streamUrl: 'https://api.audius.co/v1/tracks/au1/stream',
  playCount: 500,
  favoriteCount: 50,
  durationMs: 180000,
  tags: ['lo-fi', 'chill'],
}

describe('isSpotifyTrack', () => {
  it('returns true for Spotify tracks', () => {
    expect(isSpotifyTrack(mockSpotify)).toBe(true)
  })
  it('returns false for Audius tracks', () => {
    expect(isSpotifyTrack(mockAudius)).toBe(false)
  })
})

describe('isAudiusTrack', () => {
  it('returns true for Audius tracks', () => {
    expect(isAudiusTrack(mockAudius)).toBe(true)
  })
  it('returns false for Spotify tracks', () => {
    expect(isAudiusTrack(mockSpotify)).toBe(false)
  })
})
