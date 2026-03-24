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
        className="text-[0.88rem] font-mono uppercase tracking-widest transition-all hover:opacity-100 inline-flex items-center gap-1 rounded-full"
        style={{
          color: 'rgba(255,255,255,0.9)',
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          padding: '0.5rem 1.1rem',
          fontWeight: 700,
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
        className="text-[0.88rem] font-mono uppercase tracking-widest transition-all hover:opacity-100 inline-flex items-center gap-1 rounded-full"
        style={{
          color: 'rgba(255,255,255,0.9)',
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          padding: '0.5rem 1.1rem',
          fontWeight: 700,
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
