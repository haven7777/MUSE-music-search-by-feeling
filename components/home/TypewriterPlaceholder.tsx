'use client'

import { useEffect, useRef, useState } from 'react'

const PHRASES = [
  'Driving alone at 3am feeling nostalgic but weirdly hopeful',
  'Sunday morning, coffee, half asleep, no plans, content',
  'That feeling right before something big changes in your life',
  'Angry but trying to stay calm in a meeting',
  'First day of summer, windows down, nowhere to be',
  'Missing someone you haven\'t talked to in years',
]

const TYPING_SPEED = 40
const DELETE_SPEED = 20
const PAUSE_AFTER_TYPE = 2200
const PAUSE_AFTER_DELETE = 400

export function TypewriterPlaceholder({ visible }: { visible: boolean }) {
  const [displayed, setDisplayed] = useState('')
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!visible) return

    const currentPhrase = PHRASES[phraseIndex]

    function tick() {
      if (!isDeleting) {
        if (displayed.length < currentPhrase.length) {
          setDisplayed(currentPhrase.slice(0, displayed.length + 1))
          timeoutRef.current = setTimeout(tick, TYPING_SPEED)
        } else {
          timeoutRef.current = setTimeout(() => {
            setIsDeleting(true)
          }, PAUSE_AFTER_TYPE)
        }
      } else {
        if (displayed.length > 0) {
          setDisplayed(displayed.slice(0, -1))
          timeoutRef.current = setTimeout(tick, DELETE_SPEED)
        } else {
          setIsDeleting(false)
          setPhraseIndex((i) => (i + 1) % PHRASES.length)
          timeoutRef.current = setTimeout(tick, PAUSE_AFTER_DELETE)
        }
      }
    }

    timeoutRef.current = setTimeout(tick, TYPING_SPEED)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [displayed, isDeleting, phraseIndex, visible])

  return (
    <span style={{ color: 'var(--text-muted)' }} aria-hidden="true">
      {displayed}
      <span className="animate-pulse">|</span>
    </span>
  )
}
