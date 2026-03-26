'use client'

import { useRef, useState } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface RefinementInputProps {
  onRefine: (refinement: string) => void
  isRefining: boolean
}

export function RefinementInput({ onRefine, isRefining }: RefinementInputProps) {
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (text.trim() && !isRefining) {
      onRefine(text.trim())
      setText('')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.3 }}
      style={{ marginBottom: '1.25rem' }}
    >
      <form
        onSubmit={handleSubmit}
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
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
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
          disabled={!text.trim() || isRefining}
          aria-label="Refine vibe"
          className="active:scale-95 transition-all"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: text.trim() ? 'var(--muse-primary)' : 'rgba(255,255,255,0.08)',
            border: 'none',
            cursor: text.trim() && !isRefining ? 'pointer' : 'default',
            transition: 'background 0.2s ease, opacity 0.2s ease',
            opacity: text.trim() ? 1 : 0.4,
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
  )
}
