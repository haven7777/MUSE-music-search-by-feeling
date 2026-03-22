'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { AudioController } from '@/lib/audioSync'

interface AudioState {
  currentTrackId: string | null
  isPlaying: boolean
  progress: number
  duration: number
  currentTime: number
}

interface AudioContextValue extends AudioState {
  play: (trackId: string, src: string) => void
  pause: () => void
  seek: (ratio: number) => void
}

const AudioCtx = createContext<AudioContextValue | null>(null)

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const controllerRef = useRef<AudioController | null>(null)
  const [state, setState] = useState<AudioState>({
    currentTrackId: null,
    isPlaying: false,
    progress: 0,
    duration: 0,
    currentTime: 0,
  })

  useEffect(() => {
    const controller = new AudioController()
    controllerRef.current = controller

    controller.setStateChangeCallback(() => {
      setState({
        currentTrackId: controller.getCurrentId(),
        isPlaying: !controller.isPaused(),
        progress: controller.getProgress(),
        duration: controller.getDuration(),
        currentTime: controller.getCurrentTime(),
      })
    })

    return () => {
      controller.destroy()
    }
  }, [])

  const play = useCallback((trackId: string, src: string) => {
    controllerRef.current?.play(trackId, src)
  }, [])

  const pause = useCallback(() => {
    controllerRef.current?.pause()
  }, [])

  const seek = useCallback((ratio: number) => {
    controllerRef.current?.seek(ratio)
  }, [])

  return (
    <AudioCtx.Provider value={{ ...state, play, pause, seek }}>
      {children}
    </AudioCtx.Provider>
  )
}

export function useAudio(): AudioContextValue {
  const ctx = useContext(AudioCtx)
  if (!ctx) throw new Error('useAudio must be used within AudioProvider')
  return ctx
}
