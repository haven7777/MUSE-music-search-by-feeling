'use client'

export function TrackCardSkeleton() {
  return (
    <div className="track-card flex gap-3 animate-pulse">
      <div className="w-[72px] h-[72px] rounded-xl bg-white/10 flex-shrink-0" />
      <div className="flex-1 flex flex-col gap-2 justify-center">
        <div className="h-3 bg-white/10 rounded-full w-3/4" />
        <div className="h-2.5 bg-white/10 rounded-full w-1/2" />
        <div className="h-2 bg-white/10 rounded-full w-full mt-1" />
        <div className="h-2 bg-white/10 rounded-full w-2/3" />
      </div>
    </div>
  )
}
