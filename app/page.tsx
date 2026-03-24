'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  AppPhase,
  AudiusTrack,
  MusePlaylist,
  RankedTrack,
  SpotifyTrackData,
  VibeProfile,
} from '@/types'
import { HeroInput } from '@/components/home/HeroInput'
import { MoodChips } from '@/components/home/MoodChips'
import { ProcessingState } from '@/components/home/ProcessingState'
import { ResultsPage } from '@/components/results/ResultsPage'
import { useAudio } from '@/components/shared/AudioContext'
import { getPlaylistByIdCloud } from '@/lib/cloudStorage'

function HomePageInner() {
  const [phase, setPhase] = useState<AppPhase>('input')
  const [lastInput, setLastInput] = useState('')
  const [processingKeywords, setProcessingKeywords] = useState<string[]>([])
  const [playlist, setPlaylist] = useState<MusePlaylist | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const searchParams = useSearchParams()
  const didAutoSubmit = useRef(false)
  const { pause } = useAudio()

  useEffect(() => {
    if (didAutoSubmit.current) return
    didAutoSubmit.current = true

    // Load a saved moment by ID
    const momentId = searchParams.get('moment')
    if (momentId) {
      getPlaylistByIdCloud(momentId).then((saved) => {
        if (saved) {
          setPlaylist(saved)
          setPhase('results')
        }
      })
      return
    }

    // Re-run a search from ?q= param
    const q = searchParams.get('q')
    if (q) {
      void handleSubmit(decodeURIComponent(q))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Clear vibe colors whenever home/input phase is active
  useEffect(() => {
    if (phase === 'input') {
      ;['--muse-primary', '--muse-secondary', '--muse-bg', '--muse-text', '--muse-surface', '--muse-primary-rgb', '--muse-secondary-rgb'].forEach(
        (v) => document.documentElement.style.removeProperty(v),
      )
    }
  }, [phase])

  async function handleSubmit(input: string) {
    setLastInput(input)
    setPhase('processing')
    setProcessingKeywords([])
    setErrorMessage('')

    try {
      // Step 1: Decode vibe
      const vibeRes = await fetch('/api/vibe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      })

      if (!vibeRes.ok) {
        const err = (await vibeRes.json()) as { error?: string }
        throw new Error(err.error ?? 'Vibe decoding failed')
      }

      const vibeProfile = (await vibeRes.json()) as VibeProfile

      const keywords = [vibeProfile.emotionalCore, ...vibeProfile.sonicTexture.slice(0, 4)]
      keywords.forEach((kw, i) => {
        setTimeout(() => {
          setProcessingKeywords((prev) => [...prev, kw])
        }, i * 200)
      })

      // Step 2: Search music in parallel
      const searchRes = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vibeProfile, originalInput: input }),
      })

      if (!searchRes.ok) throw new Error('Music search failed')

      const { spotify, audius } = (await searchRes.json()) as {
        spotify: SpotifyTrackData[]
        audius: AudiusTrack[]
      }

      // Step 3: Fetch Deezer previews for Spotify tracks
      const previewRes = await fetch('/api/itunes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tracks: spotify.map((t) => ({ id: t.id, title: t.title, artist: t.artist })),
        }),
      })

      let previewMap: Record<string, string | null> = {}
      if (previewRes.ok) {
        const data = (await previewRes.json()) as { previews: Record<string, string | null> }
        previewMap = data.previews
      }

      const spotifyWithPreviews = spotify
        .map((t) => ({ ...t, itunesPreviewUrl: previewMap[t.id] ?? null }))
        .sort((a, b) => (b.itunesPreviewUrl ? 1 : 0) - (a.itunesPreviewUrl ? 1 : 0))
        .slice(0, 8)

      // Step 4: Rank all tracks
      const allTracks = [
        ...spotifyWithPreviews.map((t) => ({ source: 'spotify' as const, track: t })),
        ...audius.map((t) => ({ source: 'audius' as const, track: t })),
      ]

      const rankRes = await fetch('/api/rank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalInput: input, vibeProfile, tracks: allTracks }),
      })

      let rankedTracks: RankedTrack[] = []
      if (rankRes.ok) {
        const all = (await rankRes.json()) as RankedTrack[]
        // Drop tracks with low confidence but keep at least 4 per source
        const spotifyRanked = all.filter((t) => t.source === 'spotify')
        const audiusRanked = all.filter((t) => t.source === 'audius')
        const filterWithFloor = (tracks: RankedTrack[], floor: number) => {
          const good = tracks.filter((t) => (t.confidence ?? 1) >= 0.6)
          return good.length >= floor ? good : tracks.slice(0, Math.max(floor, good.length))
        }
        rankedTracks = [
          ...filterWithFloor(spotifyRanked, 4),
          ...filterWithFloor(audiusRanked, 4),
        ].sort((a, b) => a.rank - b.rank)
      } else {
        rankedTracks = allTracks.map((t, i) => ({
          source: t.source,
          rank: i + 1,
          explanation: 'Selected for your mood',
          track: t.track,
        }))
      }

      setPlaylist({
        id: '',
        originalInput: input,
        vibeProfile,
        tracks: rankedTracks,
        createdAt: Date.now(),
      })
      setPhase('results')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setErrorMessage(message)
      setPhase('error')
    }
  }

  function handleReset() {
    pause()
    setPhase('input')
    setPlaylist(null)
    setProcessingKeywords([])
    if (typeof document !== 'undefined') {
      ;['--muse-primary', '--muse-secondary', '--muse-bg', '--muse-text', '--muse-surface', '--muse-primary-rgb', '--muse-secondary-rgb'].forEach(
        (v) => document.documentElement.style.removeProperty(v),
      )
    }
  }

  return (
    <main className="min-h-screen flex flex-col" style={{ fontFamily: 'var(--font-geist-sans)' }}>
      <AnimatePresence mode="wait">
        {/* ── HOME / INPUT ── */}
        {(phase === 'input' || phase === 'processing') && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
            className="flex-1 flex flex-col items-center justify-center px-4 gap-8 min-h-screen relative"
          >

            {/* Wordmark */}
            <div className="flex flex-col items-center relative" style={{ gap: '0.5rem' }}>
              <div
                className="absolute -inset-8 rounded-full pointer-events-none"
                style={{
                  background:
                    'radial-gradient(circle, color-mix(in srgb, var(--muse-primary) 12%, transparent) 0%, transparent 70%)',
                }}
                aria-hidden="true"
              />

              <h1
                className="relative gradient-text"
                style={{
                  fontFamily: 'var(--font-syne)',
                  fontSize: 'clamp(3.5rem, 8vw, 6rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                  animation: 'revealUp 0.6s cubic-bezier(0.4,0,0.2,1) both',
                }}
              >
                MUSE
              </h1>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
                style={{
                  height: '1px',
                  width: '120px',
                  background: 'linear-gradient(90deg, var(--muse-primary), transparent 50%, var(--muse-secondary))',
                  transformOrigin: 'center',
                  marginBottom: '0.5rem',
                }}
                aria-hidden="true"
              />

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8, ease: [0.4, 0, 0.2, 1] }}
                style={{
                  fontSize: '1.05rem',
                  letterSpacing: '0.01em',
                  lineHeight: 1.5,
                  textAlign: 'center',
                }}
              >
                <span style={{ opacity: 0.5, fontWeight: 300, color: 'var(--text-secondary)' }}>
                  Describe a feeling.
                </span>
                <span style={{ opacity: 0.85, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {' '}Discover its soundtrack.
                </span>
              </motion.p>
            </div>

            {/* Input or Processing */}
            <div className="w-full max-w-2xl">
              {phase === 'input' ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col gap-4"
                >
                  <HeroInput onSubmit={handleSubmit} isLoading={false} />
                  <MoodChips onSelect={(label) => void handleSubmit(label)} />
                </motion.div>
              ) : (
                <ProcessingState keywords={processingKeywords} />
              )}
            </div>
          </motion.div>
        )}

        {/* ── RESULTS ── */}
        {phase === 'results' && playlist && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex-1"
          >
            <div
              className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 border-b"
              style={{
                background: 'rgba(4,4,10,0.85)',
                backdropFilter: 'blur(20px)',
                borderColor: 'var(--border)',
              }}
            >
              <button
                onClick={handleReset}
                className="text-[0.75rem] uppercase tracking-widest transition-all hover:opacity-100 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-1 rounded-lg"
                style={{
                  fontFamily: 'var(--font-geist-mono)',
                  color: 'rgba(255,255,255,0.85)',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  padding: '0.35rem 0.75rem',
                  fontWeight: 600,
                }}
              >
                ← New Feeling
              </button>
              <span className="text-sm font-bold gradient-text" style={{ fontFamily: 'var(--font-syne)' }}>
                MUSE
              </span>
              <Link
                href="/moments"
                className="text-[0.75rem] uppercase tracking-widest transition-all hover:opacity-100 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-1 rounded-lg"
                style={{
                  fontFamily: 'var(--font-geist-mono)',
                  color: 'rgba(255,255,255,0.85)',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  padding: '0.35rem 0.75rem',
                  fontWeight: 600,
                }}
              >
                Moments
              </Link>
            </div>
            <ResultsPage playlist={playlist} />
          </motion.div>
        )}

        {/* ── ERROR ── */}
        {phase === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center gap-5 px-4 min-h-screen text-center"
          >
            <p className="text-5xl">⚡</p>
            <div>
              <p className="text-lg font-medium mb-1" style={{ color: 'var(--muse-text)' }}>
                We couldn&apos;t tune in to your feeling right now.
              </p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {errorMessage || 'Try again or rephrase your moment.'}
              </p>
            </div>
            <div className="flex gap-3">
              {lastInput && (
                <button
                  onClick={() => void handleSubmit(lastInput)}
                  className="transition-all focus-visible:ring-2 focus-visible:ring-cyan-400"
                  style={{
                    background: 'var(--muse-primary)',
                    color: 'white',
                    borderRadius: '50px',
                    padding: '0.65rem 1.75rem',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    letterSpacing: '0.02em',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 24px var(--glow-primary-soft)',
                  }}
                >
                  Try again
                </button>
              )}
              <button
                onClick={handleReset}
                className="transition-all focus-visible:ring-2 focus-visible:ring-cyan-400"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: 'var(--text-secondary)',
                  borderRadius: '50px',
                  padding: '0.65rem 1.75rem',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  letterSpacing: '0.02em',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Rephrase
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

export default function HomePage() {
  return (
    <Suspense>
      <HomePageInner />
    </Suspense>
  )
}
