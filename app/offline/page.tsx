'use client'

export default function OfflinePage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center gap-6"
      style={{ fontFamily: 'var(--font-geist-sans)' }}
    >
      <div style={{ fontSize: '3.5rem' }}>~</div>
      <div>
        <h1
          style={{
            fontFamily: 'var(--font-syne)',
            fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            marginBottom: '0.75rem',
          }}
        >
          You&apos;re Offline
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, maxWidth: '380px' }}>
          MUSE needs an internet connection to discover new music. Your saved moments will be available when you reconnect.
        </p>
      </div>
      <button
        onClick={() => window.location.reload()}
        style={{
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '50px',
          padding: '0.7rem 2rem',
          color: 'white',
          fontSize: '0.9rem',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Try Again
      </button>
    </main>
  )
}
