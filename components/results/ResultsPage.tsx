'use client'

import { useEffect, useState } from 'react'
import { MusePlaylist, RankedTrack } from '@/types'
import { applyColorPalette } from '@/lib/colorSystem'
import { savePlaylist, generateId } from '@/lib/storage'
import { useToast } from '@/components/shared/Toast'
import { MomentCard } from './MomentCard'
import { PlaylistColumn } from './PlaylistColumn'
import { VibeSignature } from './VibeSignature'

interface ResultsPageProps {
  playlist: MusePlaylist
}

export function ResultsPage({ playlist }: ResultsPageProps) {
  const { originalInput, vibeProfile, tracks } = playlist
  const [isSaved, setIsSaved] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    applyColorPalette(vibeProfile.colorPalette)
  }, [vibeProfile.colorPalette])

  function handleSave() {
    const toSave: MusePlaylist = { ...playlist, id: generateId(), createdAt: Date.now() }
    savePlaylist(toSave)
    setIsSaved(true)
    showToast('Moment saved ✓', 'success')
  }

  const spotifyTracks = tracks.filter((t) => t.source === 'spotify') as RankedTrack[]
  const audiusTracks = tracks.filter((t) => t.source === 'audius') as RankedTrack[]

  // Deduplicate by track ID within each column
  const seenIds = new Set<string>()
  const deduped = (list: RankedTrack[]) =>
    list.filter((t) => {
      if (seenIds.has(t.track.id)) return false
      seenIds.add(t.track.id)
      return true
    })

  const spotifyDeduped = deduped(spotifyTracks)
  const audiusDeduped = deduped(audiusTracks)

  const spotifyWithFeatures = spotifyDeduped.find(
    (t) => t.source === 'spotify' && 'audioFeatures' in t.track && t.track.audioFeatures,
  )
  const features =
    spotifyWithFeatures && 'audioFeatures' in spotifyWithFeatures.track
      ? (spotifyWithFeatures.track.audioFeatures ?? {})
      : {}

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto flex flex-col gap-10">
        {/* Moment Card */}
        <MomentCard
          originalInput={originalInput}
          vibeProfile={vibeProfile}
          onSave={handleSave}
          isSaved={isSaved}
        />

        {/* Playlist columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PlaylistColumn
            title="From the World"
            dotColor="#1DB954"
            tracks={spotifyDeduped}
            vibeProfile={vibeProfile}
          />
          <PlaylistColumn
            title="From the Underground"
            dotColor="#CC0FE0"
            tracks={audiusDeduped}
            vibeProfile={vibeProfile}
            isUnderground
          />
        </div>

        {/* Vibe Signature */}
        <div
          className="rounded-2xl p-8 flex justify-center border"
          style={{
            background: 'var(--muse-surface)',
            borderColor: 'rgba(255,255,255,0.07)',
          }}
        >
          <VibeSignature
            features={features}
            energyLevel={vibeProfile.energyLevel}
            moodLabel={vibeProfile.moodLabel}
          />
        </div>
      </div>
    </div>
  )
}
