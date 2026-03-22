'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

const CHIPS = [
  { label: 'Late night drive', bg: '#0d1b3e', border: '#1e3a6e', color: '#93c5fd' },
  { label: 'Sunday morning', bg: '#2d1a00', border: '#78350f', color: '#fbbf24' },
  { label: 'Heartbroken', bg: '#2a0d1a', border: '#831843', color: '#f9a8d4' },
  { label: 'Pure euphoria', bg: '#1a2800', border: '#3d6b00', color: '#d4f000' },
  { label: 'Quiet anger', bg: '#1f0808', border: '#7f1d1d', color: '#fca5a5' },
  { label: 'Bittersweet', bg: '#1a0d2e', border: '#5b21b6', color: '#c084fc' },
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
    <div className="flex flex-wrap gap-2 justify-center">
      {CHIPS.map((chip, i) => (
        <motion.button
          key={chip.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + i * 0.07 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect(chip.label)}
          aria-label={`Explore music for: ${chip.label}`}
          className="px-4 py-1.5 rounded-full text-[0.78rem] font-medium transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent"
          style={{
            background: chip.bg,
            border: `1px solid ${chip.border}`,
            color: chip.color,
          }}
        >
          {chip.label}
        </motion.button>
      ))}

      {/* Surprise Me */}
      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 + CHIPS.length * 0.07 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleSurprise}
        aria-label="Surprise me with a random feeling"
        className="px-4 py-1.5 rounded-full text-[0.78rem] font-medium transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-1 flex items-center gap-1.5"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: 'rgba(255,255,255,0.6)',
        }}
      >
        <Sparkles className="w-3 h-3" />
        Surprise me
      </motion.button>
    </div>
  )
}
