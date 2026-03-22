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
              className="text-[0.75rem] font-mono uppercase tracking-widest transition-opacity hover:opacity-70 block mb-3"
              style={{ color: 'var(--text-muted)' }}
            >
              ← Back to MUSE
            </Link>
            <h1
              className="text-3xl font-extrabold gradient-text"
              style={{ fontFamily: 'var(--font-syne)' }}
            >
              Saved Moments
            </h1>
            <p className="text-[0.85rem] mt-1" style={{ color: 'var(--text-muted)' }}>
              Every feeling you translated into music.
            </p>
          </div>
        </div>

        <MomentsGallery />
      </div>
    </main>
  )
}
