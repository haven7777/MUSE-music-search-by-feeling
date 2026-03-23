'use client'

import { useEffect, useState } from 'react'
import { Bookmark, Share2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { MusePlaylist, RankedTrack } from '@/types'
import { applyColorPalette } from '@/lib/colorSystem'
import { savePlaylist, generateId } from '@/lib/storage'
import { useToast } from '@/components/shared/Toast'
import { PlaylistColumn } from './PlaylistColumn'
import { TrackModal } from './TrackModal'

interface ResultsPageProps {
  playlist: MusePlaylist
}

type Tab = 'mainstream' | 'underground'

export function ResultsPage({ playlist }: ResultsPageProps) {
  const { originalInput, vibeProfile, tracks } = playlist
  const { moodLabel, emotionalCore, sonicTexture, colorPalette } = vibeProfile
  const [isSaved, setIsSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('mainstream')
  const [selectedTrack, setSelectedTrack] = useState<RankedTrack | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    applyColorPalette(colorPalette)
  }, [colorPalette])

  function handleSave() {
    const toSave: MusePlaylist = { ...playlist, id: generateId(), createdAt: Date.now() }
    savePlaylist(toSave)
    setIsSaved(true)
    showToast('Moment saved ✓', 'success')
  }

  function handleShare() {
    const slug = moodLabel.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const url = `${window.location.origin}/vibe/${slug}`
    void navigator.clipboard.writeText(url).then(() => {
      showToast('Link copied!', 'success')
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
                  fontSize: '0.72rem',
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
                  lineHeight: 1.15,
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
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--glass-1)',
                  border: '1px solid var(--glass-border)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  color: 'var(--text-secondary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--glass-border-bright)'
                  e.currentTarget.style.color = 'var(--muse-text)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--glass-border)'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }}
              >
                <Share2 size={14} />
              </button>
              <button
                onClick={handleSave}
                disabled={isSaved}
                aria-label={isSaved ? 'Moment saved' : 'Save this moment'}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isSaved ? 'var(--muse-primary)' : 'var(--glass-1)',
                  border: `1px solid ${isSaved ? 'var(--muse-primary)' : 'var(--glass-border)'}`,
                  cursor: isSaved ? 'default' : 'pointer',
                  transition: 'all 0.15s ease',
                  opacity: isSaved ? 0.7 : 1,
                  color: isSaved ? 'white' : 'var(--text-secondary)',
                }}
              >
                <Bookmark size={14} fill={isSaved ? 'currentColor' : 'none'} />
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
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '0.25rem 0.65rem',
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


      </div>
    </div>

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
