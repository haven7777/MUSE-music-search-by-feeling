'use client'

import { useEffect, useState } from 'react'
import { Bookmark, Share2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { MusePlaylist, RankedTrack } from '@/types'
import { applyColorPalette } from '@/lib/colorSystem'
import { generateId } from '@/lib/storage'
import { savePlaylistCloud, deletePlaylistCloud, getPlaylistByIdCloud } from '@/lib/cloudStorage'
import { useToast } from '@/components/shared/Toast'
import { useAuth } from '@/components/auth/AuthContext'
import { AuthModal } from '@/components/auth/AuthModal'
import { PlaylistColumn } from './PlaylistColumn'
import { TrackModal } from './TrackModal'

interface ResultsPageProps {
  playlist: MusePlaylist
}

type Tab = 'mainstream' | 'underground'

export function ResultsPage({ playlist }: ResultsPageProps) {
  const { originalInput, vibeProfile, tracks } = playlist
  const { moodLabel, emotionalCore, sonicTexture, colorPalette } = vibeProfile
  const [isSaved, setIsSaved] = useState(!!playlist.id)
  const [savedId, setSavedId] = useState(playlist.id || '')
  const [activeTab, setActiveTab] = useState<Tab>('mainstream')
  const [selectedTrack, setSelectedTrack] = useState<RankedTrack | null>(null)
  const [showSpotifyCTA, setShowSpotifyCTA] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { showToast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    applyColorPalette(colorPalette)
  }, [colorPalette])

  // Check if this playlist is already saved in cloud
  useEffect(() => {
    if (!playlist.id) return
    getPlaylistByIdCloud(playlist.id).then((found) => {
      if (found) {
        setIsSaved(true)
        setSavedId(playlist.id)
      }
    })
  }, [playlist.id])

  async function ensureSaved(): Promise<string> {
    const id = savedId || generateId()
    const toSave: MusePlaylist = { ...playlist, id, createdAt: playlist.createdAt || Date.now() }
    await savePlaylistCloud(toSave)
    setSavedId(id)
    setIsSaved(true)
    return id
  }

  async function handleSave() {
    if (!user) {
      setShowAuthModal(true)
      return
    }
    if (isSaved && savedId) {
      await deletePlaylistCloud(savedId)
      setSavedId('')
      setIsSaved(false)
      showToast('Moment removed', 'info')
    } else {
      await ensureSaved()
      setIsSaved(true)
      showToast('Moment saved ✓', 'success')
    }
  }

  function handleShare() {
    void navigator.clipboard.writeText(window.location.href).then(() => {
      showToast('Link copied to clipboard ✓', 'success')
    })
  }

  // Dedup + split
  const seenIds = new Set<string>()
  const deduped = (list: RankedTrack[]) =>
    list.filter((t) => {
      if (seenIds.has(t.track.id)) return false
      seenIds.add(t.track.id)
      return true
    })
  const spotifyDeduped = deduped(tracks.filter((t) => t.source === 'spotify'))
  const audiusDeduped = deduped(tracks.filter((t) => t.source === 'audius'))

  const keywords = [emotionalCore, ...sonicTexture]
    .slice(0, 5)
    .map((k) => k.charAt(0).toUpperCase() + k.slice(1).toLowerCase())
    .filter(Boolean)

  return (
    <>
    <div className="min-h-screen pb-20">
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 1.5rem' }}>

        {/* ── Compact hero header ──────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          style={{ paddingTop: '2rem', paddingBottom: '1.5rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
            {/* Left: identity */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontFamily: 'var(--font-geist-mono)',
                  fontSize: '1rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  color: 'rgba(255,255,255,0.55)',
                  marginBottom: '0.4rem',
                }}
              >
                Your vibe
              </p>
              <h2
                style={{
                  fontFamily: 'var(--font-syne)',
                  fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.3,
                  paddingBottom: '0.1em',
                  marginBottom: '0.5rem',
                  color: '#ffffff',
                  textShadow: '0 2px 20px rgba(0,0,0,0.4)',
                }}
              >
                {moodLabel}
              </h2>
              <p
                style={{
                  fontSize: '1rem',
                  fontStyle: 'italic',
                  color: 'rgba(255,255,255,0.75)',
                  lineHeight: 1.55,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                &ldquo;{originalInput}&rdquo;
              </p>
            </div>

            {/* Right: actions */}
            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, paddingTop: '0.25rem' }}>
              <button
                onClick={handleShare}
                aria-label="Copy share link"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.9rem',
                  borderRadius: '50px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.22)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  fontFamily: 'var(--font-geist-sans)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.16)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'
                }}
              >
                <Share2 size={13} />
                Share
              </button>
              <button
                onClick={() => void handleSave()}
                aria-label={isSaved ? 'Remove saved moment' : 'Save this moment'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.9rem',
                  borderRadius: '50px',
                  background: isSaved ? 'var(--muse-primary)' : 'rgba(255,255,255,0.1)',
                  border: `1px solid ${isSaved ? 'var(--muse-primary)' : 'rgba(255,255,255,0.22)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  fontFamily: 'var(--font-geist-sans)',
                }}
                onMouseEnter={(e) => {
                  if (!isSaved) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.16)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSaved) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'
                  }
                }}
              >
                <Bookmark size={13} fill={isSaved ? 'currentColor' : 'none'} />
                {isSaved ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>

          {/* Keyword pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '1rem' }}>
            {keywords.map((kw, i) => (
              <motion.span
                key={kw}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.06, duration: 0.25 }}
                style={{
                  fontFamily: 'var(--font-geist-mono)',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '0.35rem 0.9rem',
                  borderRadius: '50px',
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  color: 'rgba(255,255,255,0.9)',
                }}
              >
                {kw}
              </motion.span>
            ))}
          </div>
        </motion.section>

        {/* ── Tab switcher ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--glass-border)',
            marginBottom: '1.25rem',
            gap: 0,
          }}
        >
          {(
            [
              { key: 'mainstream', label: 'Mainstream', count: spotifyDeduped.length, color: '#1DB954' },
              { key: 'underground', label: 'Underground', count: audiusDeduped.length, color: '#CC0FE0' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                padding: '0.75rem 0',
                background: 'none',
                border: 'none',
                borderBottom: `2px solid ${activeTab === tab.key ? tab.color : 'transparent'}`,
                marginBottom: '-1px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease',
                color: activeTab === tab.key ? '#ffffff' : 'rgba(255,255,255,0.55)',
                fontFamily: 'var(--font-geist-sans)',
                fontSize: '0.95rem',
                fontWeight: activeTab === tab.key ? 600 : 400,
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: tab.color,
                  opacity: activeTab === tab.key ? 1 : 0.4,
                  flexShrink: 0,
                  transition: 'opacity 0.2s ease',
                }}
              />
              {tab.label}
              {tab.count > 0 && (
                <span
                  style={{
                    fontFamily: 'var(--font-geist-mono)',
                    fontSize: '0.6rem',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '50px',
                    background: activeTab === tab.key
                      ? `${tab.color}22`
                      : 'var(--glass-1)',
                    border: `1px solid ${activeTab === tab.key ? `${tab.color}44` : 'var(--glass-border)'}`,
                    color: activeTab === tab.key ? tab.color : 'rgba(255,255,255,0.55)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </motion.div>

        {/* ── Track list — animated tab switch ─────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          >
            {activeTab === 'mainstream' ? (
              <PlaylistColumn
                title="Mainstream"
                dotColor="#1DB954"
                tracks={spotifyDeduped}
                vibeProfile={vibeProfile}
                showHeader={false}
                onOpenTrack={setSelectedTrack}
              />
            ) : (
              <PlaylistColumn
                title="Underground"
                dotColor="#CC0FE0"
                tracks={audiusDeduped}
                vibeProfile={vibeProfile}
                isUnderground
                showHeader={false}
                onOpenTrack={setSelectedTrack}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── Spotify Playlist CTA ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.35 }}
          style={{ marginTop: '2rem' }}
        >
          <button
            onClick={() => setShowSpotifyCTA(true)}
            style={{
              width: '100%',
              padding: '0.9rem',
              background: '#1db954',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '0.95rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88' }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden="true">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            + Create Spotify Playlist
          </button>
        </motion.div>

      </div>
    </div>

    {/* Auth modal */}
    <AnimatePresence>
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </AnimatePresence>

    {/* Track modal */}
    <AnimatePresence>
      {selectedTrack && (
        <TrackModal
          rankedTrack={selectedTrack}
          vibeProfile={vibeProfile}
          onClose={() => setSelectedTrack(null)}
        />
      )}
    </AnimatePresence>

    {/* Spotify coming-soon modal */}
    <AnimatePresence>
      {showSpotifyCTA && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => setShowSpotifyCTA(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 300,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <motion.div
            initial={{ scale: 0.92, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 16 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#08080f',
              border: '1px solid rgba(29,185,84,0.3)',
              borderRadius: '20px',
              padding: '2rem',
              maxWidth: '400px',
              width: '100%',
              textAlign: 'center',
            }}
          >
            <button
              onClick={() => setShowSpotifyCTA(false)}
              aria-label="Close"
              style={{
                position: 'absolute', top: '1rem', right: '1rem',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', display: 'flex',
              }}
            >
              <X size={18} />
            </button>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎵</div>
            <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: '1.25rem', fontWeight: 700, color: '#1db954', marginBottom: '0.75rem' }}>
              Coming Soon
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
              Connect your Spotify account to save this playlist directly — coming soon.
            </p>
            <button
              onClick={() => setShowSpotifyCTA(false)}
              style={{
                marginTop: '1.5rem',
                padding: '0.6rem 1.5rem',
                background: '#1db954',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Got it
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  )
}
