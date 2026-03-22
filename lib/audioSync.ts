export class AudioController {
  private audio: HTMLAudioElement | null = null
  private currentId: string | null = null
  private rafId: number | null = null
  private onStateChange: (() => void) | null = null

  setStateChangeCallback(cb: () => void): void {
    this.onStateChange = cb
  }

  private notify(): void {
    this.onStateChange?.()
  }

  private ensureAudio(): HTMLAudioElement {
    if (!this.audio) {
      this.audio = new Audio()
      this.audio.addEventListener('ended', () => {
        this.stopRaf()
        this.notify()
      })
      this.audio.addEventListener('pause', () => this.notify())
      this.audio.addEventListener('play', () => this.notify())
    }
    return this.audio
  }

  play(trackId: string, src: string): void {
    const audio = this.ensureAudio()

    if (this.currentId !== trackId) {
      audio.pause()
      audio.src = src
      audio.load()
      this.currentId = trackId
    }

    audio.play().catch(() => {
      // Autoplay blocked — user must interact first
    })
    this.startRaf()
    this.notify()
  }

  pause(): void {
    this.audio?.pause()
    this.stopRaf()
    this.notify()
  }

  seek(ratio: number): void {
    const audio = this.audio
    if (!audio || !audio.duration) return
    audio.currentTime = ratio * audio.duration
    this.notify()
  }

  getProgress(): number {
    const audio = this.audio
    if (!audio || !audio.duration) return 0
    return audio.currentTime / audio.duration
  }

  getDuration(): number {
    return this.audio?.duration ?? 0
  }

  getCurrentTime(): number {
    return this.audio?.currentTime ?? 0
  }

  isPlayingId(trackId: string): boolean {
    return this.currentId === trackId && !this.audio?.paused
  }

  getCurrentId(): string | null {
    return this.currentId
  }

  isPaused(): boolean {
    return this.audio?.paused ?? true
  }

  private startRaf(): void {
    this.stopRaf()
    const tick = () => {
      this.notify()
      if (!this.audio?.paused) {
        this.rafId = requestAnimationFrame(tick)
      }
    }
    this.rafId = requestAnimationFrame(tick)
  }

  private stopRaf(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  destroy(): void {
    this.stopRaf()
    this.audio?.pause()
    this.audio = null
  }
}
