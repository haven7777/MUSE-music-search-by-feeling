'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from './AuthContext'
import { AuthModal } from './AuthModal'

export function UserMenu() {
  const { user, signOut } = useAuth()
  const [showAuth, setShowAuth] = useState(false)

  if (user) {
    return (
      <button
        onClick={() => void signOut()}
        className="text-[0.75rem] font-mono uppercase tracking-widest transition-all hover:opacity-100 rounded-full"
        style={{
          color: 'rgba(255,255,255,0.7)',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          padding: '0.35rem 0.85rem',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Sign out
      </button>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowAuth(true)}
        className="text-[0.75rem] font-mono uppercase tracking-widest transition-all hover:opacity-100 rounded-full"
        style={{
          color: 'rgba(255,255,255,0.85)',
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.18)',
          padding: '0.35rem 0.85rem',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Sign in
      </button>
      <AnimatePresence>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </AnimatePresence>
    </>
  )
}
