'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { ImagePlus, Mic, Send, X } from 'lucide-react'
import { motion, useAnimation, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { TypewriterPlaceholder } from './TypewriterPlaceholder'

interface HeroInputProps {
  onSubmit: (value: string) => void
  onSubmitImage?: (imageBase64: string, mimeType: string, hint?: string) => void
  isLoading: boolean
}

export function HeroInput({ onSubmit, onSubmitImage, isLoading }: HeroInputProps) {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [showValidationMsg, setShowValidationMsg] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceError, setVoiceError] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageData, setImageData] = useState<{ base64: string; mimeType: string } | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
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
    if (isLoading) return

    // Image mode — send image with optional text hint
    if (imageData && onSubmitImage) {
      onSubmitImage(imageData.base64, imageData.mimeType, value.trim() || undefined)
      return
    }

    const trimmed = value.trim()
    if (trimmed.length < 3) {
      void shakeInvalid()
      return
    }
    onSubmit(trimmed)
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setVoiceError('Image must be under 5MB')
      setTimeout(() => setVoiceError(''), 3000)
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setImagePreview(dataUrl)
      // Extract base64 without the data:mime;base64, prefix
      const base64 = dataUrl.split(',')[1]
      setImageData({ base64, mimeType: file.type })
    }
    reader.readAsDataURL(file)
    // Reset file input so same file can be re-selected
    e.target.value = ''
  }

  function clearImage() {
    setImagePreview(null)
    setImageData(null)
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

  const SpeechRecognitionAPI = typeof window !== 'undefined'
    ? (window.SpeechRecognition || window.webkitSpeechRecognition)
    : null

  function toggleVoice() {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    if (!SpeechRecognitionAPI) return

    const recognition = new SpeechRecognitionAPI()
    recognition.lang = 'en-US'
    recognition.interimResults = true
    recognition.continuous = false

    const baseText = value

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = ''
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      const newValue = baseText ? `${baseText} ${transcript}` : transcript
      setValue(newValue)
      // Auto-resize textarea
      const el = textareaRef.current
      if (el) {
        el.style.height = 'auto'
        el.style.height = `${el.scrollHeight}px`
      }
    }

    recognition.onend = () => setIsListening(false)
    recognition.onerror = (event: Event & { error?: string }) => {
      setIsListening(false)
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setVoiceError('Voice input is blocked in this browser. Try Chrome or Safari.')
        setTimeout(() => setVoiceError(''), 4000)
      }
    }

    try {
      recognition.start()
      recognitionRef.current = recognition
      setIsListening(true)
    } catch {
      setVoiceError('Voice input not available in this browser.')
      setTimeout(() => setVoiceError(''), 4000)
    }
  }

  // Mobile hint cycling between image and voice tips
  const [mobileHintIndex, setMobileHintIndex] = useState(0)
  const mobileHints = useCallback(() => {
    const hints: string[] = []
    if (onSubmitImage) hints.push('Share a photo to set the mood')
    if (SpeechRecognitionAPI) hints.push('Speak your feeling out loud')
    return hints
  }, [onSubmitImage, SpeechRecognitionAPI])

  useEffect(() => {
    const hints = mobileHints()
    if (hints.length <= 1) return
    const interval = setInterval(() => {
      setMobileHintIndex((prev) => (prev + 1) % hints.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [mobileHints])

  const canSubmit = (value.trim().length >= 3 || !!imageData) && !isLoading
  const charPercent = Math.min((value.length / 500) * 100, 100)

  return (
    <form onSubmit={handleSubmit} style={{ width: 'min(540px, 90vw)', margin: '0 auto' }}>
      {/* Textarea container */}
      <motion.div
        animate={controls}
        style={{
          background: focused ? 'var(--glass-2)' : 'var(--glass-1)',
          border: focused
            ? '1px solid color-mix(in srgb, var(--muse-primary) 60%, transparent)'
            : '1px solid var(--glass-border)',
          borderRadius: '14px',
          boxShadow: focused
            ? `0 0 0 1px rgba(var(--muse-primary-rgb), 0.3),
               0 0 20px rgba(var(--muse-primary-rgb), 0.15),
               0 0 60px rgba(var(--muse-primary-rgb), 0.08),
               0 8px 32px rgba(0,0,0,0.4)`
            : 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Image preview */}
        {imagePreview && (
          <div className="relative inline-block m-3 mb-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt="Uploaded mood photo"
              className="rounded-xl object-cover"
              style={{ maxHeight: '120px', maxWidth: '160px' }}
            />
            <button
              type="button"
              onClick={clearImage}
              aria-label="Remove image"
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <X className="w-3 h-3" style={{ color: 'white' }} />
            </button>
          </div>
        )}

        <div className="relative">
          {!value && !focused && !imageData && (
            <div className="absolute inset-0 pointer-events-none" style={{ padding: '0.85rem 1.25rem', fontSize: '0.95rem', lineHeight: '1.6' }}>
              <TypewriterPlaceholder visible={!value && !focused} />
            </div>
          )}
          {!value && focused && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ padding: '0.85rem 1.25rem', fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-muted)' }}
            >
              {imageData ? 'Add a hint (optional)...' : 'Describe your feeling or moment...'}
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            rows={1}
            maxLength={500}
            aria-label="Describe what you're feeling right now"
            className="w-full bg-transparent resize-none outline-none focus-visible:outline-none"
            style={{
              padding: '0.85rem 1.25rem',
              fontSize: '0.95rem',
              minHeight: '52px',
              maxHeight: '120px',
              color: 'var(--muse-text)',
              caretColor: 'var(--muse-primary)',
              lineHeight: '1.6',
            }}
          />
        </div>

        {/* Footer row inside textarea container */}
        <div className="flex items-center justify-between gap-3" style={{ padding: '0 0.85rem 0.5rem' }}>
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

            {/* Delayed hint / validation / voice error message */}
            {voiceError ? (
              <span className="text-[0.7rem]" style={{ color: '#fbbf24' }}>
                {voiceError}
              </span>
            ) : showValidationMsg ? (
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

          <div className="flex items-center gap-2">
            {/* Image upload button */}
            {onSubmitImage && (
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Upload a photo to set the mood"
                  className="flex items-center justify-center w-11 h-11 rounded-full transition-all active:scale-95"
                  style={{
                    background: imageData ? 'var(--muse-primary)' : 'rgba(255,255,255,0.1)',
                    color: imageData ? 'white' : 'rgba(255,255,255,0.5)',
                    border: imageData ? '1px solid var(--muse-primary)' : '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  <ImagePlus className="w-4 h-4" />
                </button>
                <span className="input-tooltip">Share a photo to set the mood</span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageSelect}
              className="hidden"
              aria-hidden="true"
            />

            {/* Mic button */}
            {SpeechRecognitionAPI && (
              <div className="relative group">
                <button
                  type="button"
                  onClick={toggleVoice}
                  aria-label={isListening ? 'Stop listening' : 'Speak your feeling out loud'}
                  className={`flex items-center justify-center w-11 h-11 rounded-full transition-all active:scale-95 ${isListening ? 'voice-pulse' : ''}`}
                  style={{
                    background: isListening ? 'var(--muse-primary)' : 'rgba(255,255,255,0.1)',
                    color: isListening ? 'white' : 'rgba(255,255,255,0.5)',
                    border: isListening ? '1px solid var(--muse-primary)' : '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  <Mic className="w-4 h-4" />
                </button>
                <span className="input-tooltip">Speak your feeling out loud</span>
              </div>
            )}

            {/* Icon-only submit for mobile */}
            <button
              type="submit"
              disabled={!canSubmit}
              aria-hidden="true"
              tabIndex={-1}
              aria-label="Find my soundtrack"
              className="flex items-center justify-center w-11 h-11 rounded-full transition-all hover:scale-105 active:scale-95 sm:hidden"
              style={{
                background: canSubmit ? 'var(--muse-primary)' : 'rgba(255,255,255,0.1)',
                color: canSubmit ? 'white' : 'rgba(255,255,255,0.3)',
                opacity: canSubmit ? 1 : 0.5,
              }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Mobile-only cycling hint for image/voice features */}
      {mobileHints().length > 0 && !value && !imageData && (
        <div className="sm:hidden flex justify-center overflow-hidden" style={{ height: '1.4rem', marginTop: '0.5rem' }}>
          <AnimatePresence mode="wait">
            <motion.span
              key={mobileHintIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 0.45, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="text-[0.7rem]"
              style={{ fontFamily: 'var(--font-geist-mono)', color: 'var(--text-muted)' }}
            >
              {mobileHints()[mobileHintIndex]}
            </motion.span>
          </AnimatePresence>
        </div>
      )}

      {/* Pill submit button — always visible below the textarea */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-3" style={{ marginTop: '1rem' }}>
        <button
          type="submit"
          disabled={!canSubmit}
          className="transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent w-full sm:w-auto"
          style={{
            background: 'var(--muse-primary)',
            borderRadius: '50px',
            padding: '0.75rem 1.75rem',
            fontWeight: 600,
            fontSize: '0.95rem',
            letterSpacing: '0.02em',
            color: 'white',
            boxShadow: canSubmit ? '0 4px 24px var(--glow-primary-soft)' : 'none',
            border: 'none',
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            opacity: canSubmit ? 1 : 0.4,
            transition: 'opacity 0.2s ease, box-shadow 0.2s ease',
          }}
        >
          {isLoading ? 'Finding…' : 'Feel the music →'}
        </button>
        <Link
          href="/moments"
          className="transition-all hover:opacity-100 focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-full w-full sm:w-auto text-center"
          style={{
            fontFamily: 'var(--font-geist-mono)',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.85)',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.18)',
            padding: '0.75rem 1.1rem',
            whiteSpace: 'nowrap',
            display: 'block',
          }}
        >
          Saved Music &amp; Moments
        </Link>
      </div>
    </form>
  )
}
