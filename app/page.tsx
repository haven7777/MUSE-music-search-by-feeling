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

function HomePageInner() {
  const [phase, setPhase] = useState<AppPhase>('input')
  const [lastInput, setLastInput] = useState('')
  const [processingKeywords, setProcessingKeywords] = useState<string[]>([])
  const [playlist, setPlaylist] = useState<MusePlaylist | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const searchParams = useSearchParams()
  const didAutoSubmit = useRef(false)

  // Handle re-explore via ?q= param
  useEffect(() => {
    if (didAutoSubmit.current) return
    const q = searchParams.get('q')
    if (q) {
      didAutoSubmit.current = true
      void handleSubmit(decodeURIComponent(q))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
        body: JSON.stringify({ vibeProfile }),
      })

      if (!searchRes.ok) throw new Error('Music search failed')

      const { spotify, audius } = (await searchRes.json()) as {
        spotify: SpotifyTrackData[]
        audius: AudiusTrack[]
      }

      // Step 3: Fetch iTunes previews
      const itunesRes = await fetch('/api/itunes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tracks: spotify.map((t) => ({ id: t.id, title: t.title, artist: t.artist })),
        }),
      })

      let previewMap: Record<string, string | null> = {}
      if (itunesRes.ok) {
        const data = (await itunesRes.json()) as { previews: Record<string, string | null> }
        previewMap = data.previews
      }

      const spotifyWithPreviews = spotify.map((t) => ({
        ...t,
        itunesPreviewUrl: previewMap[t.id] ?? null,
      }))

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
        rankedTracks = (await rankRes.json()) as RankedTrack[]
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
    setPhase('input')
    setPlaylist(null)
    setProcessingKeywords([])
    if (typeof document !== 'undefined') {
      ;['--muse-primary', '--muse-secondary', '--muse-bg', '--muse-text', '--muse-surface'].forEach(
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
            {/* Nav */}
            <div className="absolute top-6 right-6">
              <Link
                href="/moments"
                className="text-[0.75rem] font-mono uppercase tracking-widest transition-opacity hover:opacity-70 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-1 rounded"
                style={{ color: 'var(--text-muted)' }}
              >
                Saved Moments
              </Link>
            </div>

            {/* Wordmark */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center gap-3 relative"
            >
              {/* Ambient glow behind wordmark */}
              <div
                className="absolute -inset-8 rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, color-mix(in srgb, var(--muse-primary) 12%, transparent) 0%, transparent 70%)',
                }}
                aria-hidden="true"
              />
              <h1
                className="relative text-7xl font-extrabold tracking-tight gradient-text"
                style={{ fontFamily: 'var(--font-syne)' }}
              >
                MUSE
              </h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: 0.5 }}
                className="text-lg tracking-[0.08em]"
                style={{ color: 'var(--text-secondary)' }}
              >
                Describe a feeling. Discover its soundtrack.
              </motion.p>
            </motion.div>

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
              style={{ background: 'rgba(8,8,16,0.8)', backdropFilter: 'blur(12px)', borderColor: 'var(--border)' }}
            >
              <button
                onClick={handleReset}
                className="text-[0.75rem] font-mono uppercase tracking-widest transition-opacity hover:opacity-70 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-1 rounded"
                style={{ color: 'var(--text-muted)' }}
              >
                ← New Feeling
              </button>
              <span className="text-sm font-bold gradient-text" style={{ fontFamily: 'var(--font-syne)' }}>
                MUSE
              </span>
              <Link
                href="/moments"
                className="text-[0.75rem] font-mono uppercase tracking-widest transition-opacity hover:opacity-70 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-1 rounded"
                style={{ color: 'var(--text-muted)' }}
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
                  className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105 focus-visible:ring-2 focus-visible:ring-cyan-400"
                  style={{ background: 'var(--muse-primary)', color: 'white' }}
                >
                  Try again
                </button>
              )}
              <button
                onClick={handleReset}
                className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105 focus-visible:ring-2 focus-visible:ring-cyan-400"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}
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
