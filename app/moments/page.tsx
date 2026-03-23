import Link from 'next/link'
import { MomentsGallery } from '@/components/moments/MomentsGallery'

export const metadata = {
  title: 'Saved Moments — MUSE',
  description: 'Your musical memories, organized by feeling.',
}

export default function MomentsPage() {
  return (
    <main className="min-h-screen px-4 py-12" style={{ fontFamily: 'var(--font-geist-sans)' }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <Link
              href="/"
              className="text-[0.75rem] font-mono uppercase tracking-widest transition-all hover:opacity-100 inline-flex items-center gap-1 mb-3"
              style={{
                color: 'rgba(255,255,255,0.75)',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                padding: '0.3rem 0.75rem',
                borderRadius: '50px',
                fontWeight: 600,
              }}
            >
              ← Back to MUSE
            </Link>
            <h1
              className="text-3xl font-extrabold gradient-text"
              style={{ fontFamily: 'var(--font-syne)' }}
            >
              Saved Moments
            </h1>
            <p className="text-[0.9rem] mt-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Every feeling you translated into music.
            </p>
          </div>
        </div>

        <MomentsGallery />
      </div>
    </main>
  )
}
