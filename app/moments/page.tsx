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
        <div className="flex flex-col items-center text-center mb-10 gap-4">
          <Link
            href="/"
            className="text-[0.88rem] font-mono uppercase tracking-widest transition-all hover:opacity-100 inline-flex items-center gap-1"
            style={{
              color: 'rgba(255,255,255,0.9)',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '0.5rem 1.1rem',
              borderRadius: '50px',
              fontWeight: 700,
            }}
          >
            ← Back to MUSE
          </Link>
          <div>
            <h1
              className="text-4xl font-extrabold gradient-text"
              style={{ fontFamily: 'var(--font-syne)' }}
            >
              Saved Moments
            </h1>
            <p className="text-[1rem] mt-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Every feeling you translated into music.
            </p>
          </div>
        </div>

        <MomentsGallery />
      </div>
    </main>
  )
}
