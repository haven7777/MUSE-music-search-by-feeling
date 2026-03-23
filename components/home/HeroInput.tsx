'use client'

import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { motion, useAnimation } from 'framer-motion'
import Link from 'next/link'
import { TypewriterPlaceholder } from './TypewriterPlaceholder'

interface HeroInputProps {
  onSubmit: (value: string) => void
  isLoading: boolean
}

export function HeroInput({ onSubmit, isLoading }: HeroInputProps) {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [showValidationMsg, setShowValidationMsg] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const controls = useAnimation()

  // Show "Press Enter" hint after 1.5s of no typing activity
  useEffect(() => {
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current)
    setShowHint(false)
    if (value.length === 0) return
    hintTimerRef.current = setTimeout(() => setShowHint(true), 1500)
    return () => {
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current)
    }
  }, [value])

  async function shakeInvalid() {
    setShowValidationMsg(true)
    await controls.start({
      x: [0, -8, 8, -6, 6, -3, 3, 0],
      transition: { duration: 0.4 },
    })
    setTimeout(() => setShowValidationMsg(false), 2500)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = value.trim()
    if (trimmed.length < 3) {
      void shakeInvalid()
      return
    }
    if (!isLoading) {
      onSubmit(trimmed)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value)
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }
  }

  const canSubmit = value.trim().length >= 3 && !isLoading
  const charPercent = Math.min((value.length / 500) * 100, 100)

  return (
    <form onSubmit={handleSubmit} style={{ width: 'min(680px, 90vw)', margin: '0 auto' }}>
      {/* Textarea container */}
      <motion.div
        animate={controls}
        style={{
          background: focused ? 'var(--glass-2)' : 'var(--glass-1)',
          border: focused
            ? '1px solid color-mix(in srgb, var(--muse-primary) 60%, transparent)'
            : '1px solid var(--glass-border)',
          borderRadius: '20px',
          boxShadow: focused
            ? `0 0 0 1px rgba(var(--muse-primary-rgb), 0.3),
               0 0 20px rgba(var(--muse-primary-rgb), 0.15),
               0 0 60px rgba(var(--muse-primary-rgb), 0.08),
               0 8px 32px rgba(0,0,0,0.4)`
            : 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div className="relative">
          {!value && !focused && (
            <div className="absolute inset-0 pointer-events-none" style={{ padding: '1.25rem 1.5rem', fontSize: '1rem', lineHeight: '1.7' }}>
              <TypewriterPlaceholder visible={!value && !focused} />
            </div>
          )}
          {!value && focused && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ padding: '1.25rem 1.5rem', fontSize: '1rem', lineHeight: '1.7', color: 'var(--text-muted)' }}
            >
              Describe your feeling or moment...
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            rows={2}
            maxLength={500}
            aria-label="Describe what you're feeling right now"
            className="w-full bg-transparent resize-none outline-none focus-visible:outline-none"
            style={{
              padding: '1.25rem 1.5rem',
              fontSize: '1rem',
              minHeight: '80px',
              maxHeight: '160px',
              color: 'var(--muse-text)',
              caretColor: 'var(--muse-primary)',
              lineHeight: '1.7',
            }}
          />
        </div>

        {/* Footer row inside textarea container */}
        <div className="flex items-center justify-between gap-3" style={{ padding: '0 1rem 0.75rem' }}>
          <div className="flex items-center gap-3 flex-1">
            {/* Char progress bar */}
            {value.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-16 h-[2px] rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-200"
                    style={{
                      width: `${charPercent}%`,
                      background: charPercent > 90 ? '#ef4444' : 'var(--muse-primary)',
                    }}
                  />
                </div>
                <span
                  className="text-[0.68rem] tabular-nums"
                  style={{ fontFamily: 'var(--font-geist-mono)', color: 'var(--text-muted)' }}
                >
                  {value.length}/500
                </span>
              </div>
            )}

            {/* Delayed hint / validation message */}
            {showValidationMsg ? (
              <span className="text-[0.7rem]" style={{ color: '#f87171' }}>
                Describe how you&apos;re feeling to find your soundtrack
              </span>
            ) : (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: showHint && value.length > 0 ? 0.5 : 0 }}
                className="text-[0.68rem] hidden sm:block"
                style={{ fontFamily: 'var(--font-geist-mono)', color: 'var(--text-muted)' }}
              >
                Press Enter to discover
              </motion.span>
            )}
          </div>

          {/* Icon-only submit for mobile */}
          <button
            type="submit"
            disabled={!canSubmit}
            aria-hidden="true"
            tabIndex={-1}
            aria-label="Find my soundtrack"
            className="flex items-center justify-center w-8 h-8 rounded-full transition-all hover:scale-105 active:scale-95 sm:hidden"
            style={{
              background: canSubmit ? 'var(--muse-primary)' : 'rgba(255,255,255,0.1)',
              color: canSubmit ? 'white' : 'rgba(255,255,255,0.3)',
              opacity: canSubmit ? 1 : 0.5,
            }}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>

      {/* Pill submit button — always visible below the textarea */}
      <div className="flex justify-center items-center gap-3" style={{ marginTop: '1rem' }}>
        <button
          type="submit"
          disabled={!canSubmit}
          className="transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          style={{
            background: 'var(--muse-primary)',
            borderRadius: '50px',
            padding: '0.65rem 1.75rem',
            fontWeight: 600,
            fontSize: '0.9rem',
            letterSpacing: '0.02em',
            color: 'white',
            boxShadow: canSubmit ? '0 4px 24px var(--glow-primary-soft)' : 'none',
            border: 'none',
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            opacity: canSubmit ? 1 : 0.4,
            transition: 'opacity 0.2s ease, box-shadow 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (!canSubmit) return
            ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'
            ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 32px var(--glow-primary-soft)'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'
            ;(e.currentTarget as HTMLButtonElement).style.boxShadow = canSubmit ? '0 4px 24px var(--glow-primary-soft)' : 'none'
          }}
          onMouseDown={(e) => {
            if (!canSubmit) return
            ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'
          }}
        >
          {isLoading ? 'Finding…' : 'Feel the music →'}
        </button>
        <Link
          href="/moments"
          className="transition-all hover:opacity-100 focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-full"
          style={{
            fontFamily: 'var(--font-geist-mono)',
            fontSize: '0.82rem',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.85)',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.18)',
            padding: '0.65rem 1.1rem',
            whiteSpace: 'nowrap',
          }}
        >
          Saved Music &amp; Moments
        </Link>
      </div>
    </form>
  )
}
