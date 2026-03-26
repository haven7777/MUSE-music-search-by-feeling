'use client'

import Link from 'next/link'
import { MomentsGallery } from '@/components/moments/MomentsGallery'
import { UserMenu } from '@/components/auth/UserMenu'

export default function MomentsPage() {
  return (
    <main className="min-h-screen px-3 sm:px-4 py-8 sm:py-12" style={{ fontFamily: 'var(--font-geist-sans)' }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8 sm:mb-10 gap-4">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
            <Link
              href="/"
              className="text-[0.8rem] sm:text-[0.88rem] font-mono uppercase tracking-widest transition-all hover:opacity-100 inline-flex items-center gap-1"
              style={{
                color: 'rgba(255,255,255,0.9)',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '0.5rem 1rem',
                borderRadius: '50px',
                fontWeight: 700,
              }}
            >
              ← MUSE
            </Link>
            <UserMenu />
          </div>
          <div>
            <h1
              className="text-3xl sm:text-4xl font-extrabold gradient-text"
              style={{ fontFamily: 'var(--font-syne)' }}
            >
              Your Collection
            </h1>
            <p className="text-[0.9rem] sm:text-[1rem] mt-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Every feeling you translated into music.
            </p>
          </div>
        </div>

        <MomentsGallery />
      </div>
    </main>
  )
}
