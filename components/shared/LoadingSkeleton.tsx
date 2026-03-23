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
