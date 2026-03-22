import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center">
      <p
        className="text-8xl font-extrabold gradient-text"
        style={{ fontFamily: 'var(--font-syne)' }}
      >
        MUSE
      </p>
      <div>
        <p className="text-xl font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
          We couldn&apos;t find that feeling
        </p>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          The page you&apos;re looking for doesn&apos;t exist — but the right song for this moment does.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105 focus-visible:ring-2 focus-visible:ring-cyan-400"
          style={{ background: 'var(--muse-primary)', color: 'white' }}
        >
          Find my soundtrack →
        </Link>
      </div>
    </main>
  )
}
