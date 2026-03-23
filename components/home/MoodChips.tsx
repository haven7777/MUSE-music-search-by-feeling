'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

const CHIPS = [
  { label: 'Late night drive', emoji: '🌙' },
  { label: 'Sunday morning', emoji: '☀️' },
  { label: 'Heartbroken', emoji: '💔' },
  { label: 'Pure euphoria', emoji: '✨' },
  { label: 'Quiet anger', emoji: '🔥' },
  { label: 'Bittersweet', emoji: '🌫️' },
]

const SURPRISE_PROMPTS = [
  'The feeling of almost remembering a dream',
  'Watching your city from a plane window at night',
  'The day after a big life change',
  'Finding an old voicemail from someone you miss',
  'The last hour of a road trip when everyone goes quiet',
  "Realizing you've outgrown something you used to love",
  'The specific calm of being the only one awake at 4am',
  'First day of spring after a long winter',
  'Reading old texts from a past version of yourself',
  "Standing in a place you know you're leaving forever",
  "That feeling when a song perfectly describes something you couldn't",
  'Saturday afternoon before everyone arrives at a party',
  'Watching someone you love doing something they love',
  'The silence after a difficult conversation',
  'Being somewhere beautiful but feeling hollow inside',
]

interface MoodChipsProps {
  onSelect: (label: string) => void
}

export function MoodChips({ onSelect }: MoodChipsProps) {
  function handleSurprise() {
    const prompt = SURPRISE_PROMPTS[Math.floor(Math.random() * SURPRISE_PROMPTS.length)]
    onSelect(prompt)
  }

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center"
      style={{ scrollbarWidth: 'none' }}
    >
      {CHIPS.map((chip, i) => (
        <motion.button
          key={chip.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + i * 0.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect(chip.label)}
          aria-label={`Explore music for: ${chip.label}`}
          className="focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent"
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.5)',
            borderRadius: '50px',
            padding: '0.5rem 1.1rem',
            fontSize: '0.88rem',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.borderColor = 'color-mix(in srgb, var(--muse-primary) 50%, transparent)'
            el.style.color = 'var(--muse-primary)'
            el.style.background = 'rgba(var(--muse-primary-rgb), 0.08)'
            el.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.borderColor = 'rgba(255,255,255,0.12)'
            el.style.color = 'rgba(255,255,255,0.5)'
            el.style.background = 'transparent'
            el.style.transform = 'translateY(0)'
          }}
        >
          {chip.emoji} {chip.label}
        </motion.button>
      ))}

      {/* Surprise Me */}
      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 + CHIPS.length * 0.05 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleSurprise}
        aria-label="Surprise me with a random feeling"
        className="flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-1"
        style={{
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.12)',
          color: 'rgba(255,255,255,0.5)',
          borderRadius: '50px',
          padding: '0.4rem 1rem',
          fontSize: '0.78rem',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLButtonElement
          el.style.borderColor = 'color-mix(in srgb, var(--muse-primary) 50%, transparent)'
          el.style.color = 'var(--muse-primary)'
          el.style.background = 'rgba(var(--muse-primary-rgb), 0.08)'
          el.style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLButtonElement
          el.style.borderColor = 'rgba(255,255,255,0.12)'
          el.style.color = 'rgba(255,255,255,0.5)'
          el.style.background = 'transparent'
          el.style.transform = 'translateY(0)'
        }}
      >
        <Sparkles className="w-3 h-3" />
        Surprise me
      </motion.button>
    </div>
  )
}
