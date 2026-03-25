'use client'

export function TrackCardSkeleton() {
  return (
    <div
      className="track-card"
      style={{ padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}
    >
      {/* Artwork placeholder */}
      <div
        className="skeleton-block flex-shrink-0"
        style={{ width: '64px', height: '64px', borderRadius: '10px' }}
      />
      {/* Text lines */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.1rem' }}>
        <div className="skeleton-block" style={{ height: '13px', width: '70%' }} />
        <div className="skeleton-block" style={{ height: '11px', width: '45%' }} />
        <div className="skeleton-block" style={{ height: '8px', width: '100%', marginTop: '4px' }} />
        <div className="skeleton-block" style={{ height: '8px', width: '60%' }} />
      </div>
    </div>
  )
}

export function MomentCardSkeleton() {
  return (
    <div
      style={{
        borderRadius: '16px',
        background: 'var(--depth-2)',
        border: '1px solid var(--glass-border)',
        padding: '1rem 1rem 1rem 1.25rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Left gradient strip placeholder */}
      <div
        className="skeleton-block"
        style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', borderRadius: 0 }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <div className="skeleton-block" style={{ height: '14px', width: '40%' }} />
        <div className="skeleton-block" style={{ height: '11px', width: '85%' }} />
        <div className="skeleton-block" style={{ height: '11px', width: '60%' }} />
        <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.25rem' }}>
          <div className="skeleton-block" style={{ height: '18px', width: '50px', borderRadius: '3px' }} />
          <div className="skeleton-block" style={{ height: '18px', width: '60px', borderRadius: '3px' }} />
          <div className="skeleton-block" style={{ height: '18px', width: '45px', borderRadius: '3px' }} />
        </div>
      </div>
    </div>
  )
}

export function SavedSongSkeleton() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.875rem',
        background: 'var(--depth-2)',
        border: '1px solid var(--glass-border)',
        borderRadius: '12px',
        padding: '0.75rem 1rem',
      }}
    >
      <div className="skeleton-block" style={{ width: '44px', height: '44px', borderRadius: '8px', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div className="skeleton-block" style={{ height: '13px', width: '65%' }} />
        <div className="skeleton-block" style={{ height: '11px', width: '40%' }} />
      </div>
    </div>
  )
}
