'use client'

import { useEffect, useRef, useState } from 'react'
import { Bookmark, Share2, RefreshCw, Send, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { MusePlaylist, RankedTrack } from '@/types'
import { applyColorPalette } from '@/lib/colorSystem'
import { generateId } from '@/lib/cloudStorage'
import { savePlaylistCloud, deletePlaylistCloud, getPlaylistByIdCloud } from '@/lib/cloudStorage'
import { useToast } from '@/components/shared/Toast'
import { useAuth } from '@/components/auth/AuthContext'
import { AuthModal } from '@/components/auth/AuthModal'
import { PlaylistColumn } from './PlaylistColumn'
import { TrackModal } from './TrackModal'
import { MoodBackground } from './MoodBackground'

interface ResultsPageProps {
  playlist: MusePlaylist
  onRefresh?: () => void
  isRefreshing?: boolean
  onRefine?: (refinement: string) => void
  isRefining?: boolean
}

type Tab = 'mainstream' | 'underground'

export function ResultsPage({ playlist, onRefresh, isRefreshing, onRefine, isRefining }: ResultsPageProps) {
  const { originalInput, vibeProfile, tracks } = playlist
  const { moodLabel, emotionalCore, sonicTexture, colorPalette } = vibeProfile
  const [isSaved, setIsSaved] = useState(!!playlist.id)
  const [savedId, setSavedId] = useState(playlist.id || '')
  const [activeTab, setActiveTab] = useState<Tab>('mainstream')
  const [selectedTrack, setSelectedTrack] = useState<RankedTrack | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [refinementText, setRefinementText] = useState('')
  const refinementInputRef = useRef<HTMLInputElement>(null)
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

  async function handleShare() {
    const url = window.location.href
    const shareData = {
      title: `MUSE — ${vibeProfile.moodLabel}`,
      text: `Check out this vibe: "${originalInput}"`,
      url,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    await navigator.clipboard.writeText(url)
    showToast('Link copied to clipboard ✓', 'success')
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
    <MoodBackground primary={colorPalette.primary} secondary={colorPalette.secondary} />
    <div className="min-h-screen relative" style={{ zIndex: 1, paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 1rem' }} className="sm:!px-6">

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
            <div className="results-actions" style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
              <button
                onClick={handleShare}
                aria-label="Copy share link"
                className="active:scale-95 transition-all"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.65rem 1rem',
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
                  minHeight: '44px',
                }}
              >
                <Share2 size={13} />
                Share
              </button>
              <button
                onClick={() => void handleSave()}
                aria-label={isSaved ? 'Remove saved moment' : 'Save this moment'}
                className="active:scale-95 transition-all"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.65rem 1rem',
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
                  minHeight: '44px',
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
                className="text-[0.78rem] sm:text-[0.95rem]"
                style={{
                  fontFamily: 'var(--font-geist-mono)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '0.3rem 0.7rem',
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

        {/* ── Refinement input ────────────────────────────────── */}
        {onRefine && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            style={{ marginBottom: '1.25rem' }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (refinementText.trim() && !isRefining) {
                  onRefine(refinementText.trim())
                  setRefinementText('')
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '50px',
                padding: '0.35rem 0.5rem 0.35rem 1rem',
                transition: 'border-color 0.2s ease',
              }}
            >
              <input
                ref={refinementInputRef}
                type="text"
                value={refinementText}
                onChange={(e) => setRefinementText(e.target.value)}
                placeholder="Refine... &quot;more acoustic&quot;, &quot;darker&quot;, &quot;less energy&quot;"
                disabled={isRefining}
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-geist-sans)',
                  letterSpacing: '0.01em',
                  minHeight: '36px',
                }}
              />
              <button
                type="submit"
                disabled={!refinementText.trim() || isRefining}
                aria-label="Refine vibe"
                className="active:scale-95 transition-all"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: refinementText.trim() ? 'var(--muse-primary)' : 'rgba(255,255,255,0.08)',
                  border: 'none',
                  cursor: refinementText.trim() && !isRefining ? 'pointer' : 'default',
                  transition: 'background 0.2s ease, opacity 0.2s ease',
                  opacity: refinementText.trim() ? 1 : 0.4,
                  flexShrink: 0,
                }}
              >
                {isRefining ? (
                  <Loader2 size={14} color="white" style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Send size={14} color="white" />
                )}
              </button>
            </form>
          </motion.div>
        )}

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
                padding: '0.85rem 0',
                minHeight: '48px',
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

        {/* ── Refresh button ──────────────────────────────── */}
        {onRefresh && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.35 }}
            style={{ marginTop: '2rem' }}
          >
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="active:scale-[0.98] transition-transform"
              style={{
                width: '100%',
                padding: '0.9rem',
                minHeight: '48px',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.22)',
                borderRadius: '12px',
                fontSize: '0.95rem',
                fontWeight: 700,
                letterSpacing: '0.02em',
                cursor: isRefreshing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'opacity 0.15s ease, transform 0.1s ease',
                opacity: isRefreshing ? 0.6 : 1,
              }}
            >
              <RefreshCw
                size={16}
                style={{
                  animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                }}
              />
              {isRefreshing ? 'Finding new songs...' : 'Refresh Songs'}
            </button>
          </motion.div>
        )}

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

    </>
  )
}
