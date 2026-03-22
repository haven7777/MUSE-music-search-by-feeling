'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Send } from 'lucide-react'
import { motion, useAnimation } from 'framer-motion'
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
    <form onSubmit={handleSubmit} className="w-full">
      <motion.div
        animate={controls}
        className="relative rounded-3xl transition-all duration-300"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: `1px solid ${focused ? 'var(--muse-primary)' : 'rgba(255,255,255,0.1)'}`,
          boxShadow: focused
            ? `0 0 0 3px color-mix(in srgb, var(--muse-primary) 18%, transparent),
               0 0 40px color-mix(in srgb, var(--muse-primary) 8%, transparent)`
            : 'none',
        }}
      >
        <div className="relative">
          {!value && !focused && (
            <div className="absolute inset-0 px-6 py-5 pointer-events-none text-[1.05rem] leading-relaxed">
              <TypewriterPlaceholder visible={!value && !focused} />
            </div>
          )}
          {!value && focused && (
            <div
              className="absolute inset-0 px-6 py-5 pointer-events-none text-[1.05rem] leading-relaxed"
              style={{ color: 'var(--text-muted)' }}
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
            className="w-full px-6 py-5 bg-transparent resize-none outline-none text-[1.05rem] leading-relaxed min-h-[80px] focus-visible:outline-none"
            style={{ color: 'var(--muse-text)', caretColor: 'var(--muse-primary)' }}
          />
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between px-4 pb-3 gap-3">
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
                <span className="text-[0.68rem] font-mono tabular-nums" style={{ color: 'var(--text-muted)' }}>
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
                className="text-[0.68rem] font-mono hidden sm:block"
                style={{ color: 'var(--text-muted)' }}
              >
                Press Enter to discover
              </motion.span>
            )}
          </div>

          {/* Submit button — icon on mobile, full on desktop */}
          <button
            type="submit"
            disabled={!canSubmit}
            aria-label="Find my soundtrack"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[0.78rem] font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            style={{
              background: canSubmit ? 'var(--muse-primary)' : 'rgba(255,255,255,0.1)',
              color: 'white',
            }}
          >
            <span className="hidden sm:inline">{isLoading ? 'Finding…' : 'Find my soundtrack'}</span>
            {!isLoading && <ArrowRight className="w-3.5 h-3.5 hidden sm:block" />}
            <Send className="w-4 h-4 sm:hidden" />
          </button>
        </div>
      </motion.div>
    </form>
  )
}
