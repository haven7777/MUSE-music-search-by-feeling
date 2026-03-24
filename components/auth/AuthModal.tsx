'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Loader2 } from 'lucide-react'
import { useAuth } from './AuthContext'

interface AuthModalProps {
  onClose: () => void
}

export function AuthModal({ onClose }: AuthModalProps) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn } = useAuth()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')

    const { error } = await signIn(email.trim())
    setLoading(false)

    if (error) {
      setError(error)
    } else {
      setSent(true)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 400,
        background: 'rgba(0,0,0,0.75)',
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
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '20px',
          padding: '2rem',
          maxWidth: '380px',
          width: '100%',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute', top: '1rem', right: '1rem',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', display: 'flex',
          }}
        >
          <X size={18} />
        </button>

        <AnimatePresence mode="wait">
          {!sent ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem', textAlign: 'center' }}>🎵</div>
              <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: '1.3rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem', textAlign: 'center' }}>
                Sign in to save
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Enter your email and we&apos;ll send you a magic link — no password needed.
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    autoFocus
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '10px',
                      padding: '0.75rem 0.875rem 0.75rem 2.5rem',
                      fontSize: '0.9rem',
                      color: 'white',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {error && (
                  <p style={{ fontSize: '0.78rem', color: '#f87171' }}>{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  style={{
                    background: 'var(--muse-primary, #8b5cf6)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50px',
                    padding: '0.75rem',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: loading || !email.trim() ? 'not-allowed' : 'pointer',
                    opacity: loading || !email.trim() ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'opacity 0.2s ease',
                  }}
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                  {loading ? 'Sending…' : 'Send magic link'}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div key="sent" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📬</div>
              <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: '1.2rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>
                Check your email
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                We sent a magic link to <strong style={{ color: 'white' }}>{email}</strong>. Click it to sign in — then come back and save your moment.
              </p>
              <button
                onClick={onClose}
                style={{
                  marginTop: '1.5rem',
                  padding: '0.6rem 1.5rem',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'var(--text-secondary)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '50px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Got it
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
