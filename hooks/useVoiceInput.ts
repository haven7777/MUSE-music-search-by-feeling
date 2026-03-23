'use client'

import { useEffect, useRef, useState } from 'react'

// Web Speech API types (not in default TS lib)
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string
}
interface ISpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  onstart: (() => void) | null
  onend: (() => void) | null
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  start(): void
  stop(): void
}
type SpeechRecognitionConstructor = new () => ISpeechRecognition

interface UseVoiceInputOptions {
  onTranscript: (text: string) => void
  onError?: (error: 'permission-denied' | 'not-supported') => void
}

interface UseVoiceInputReturn {
  start: () => void
  stop: () => void
  isListening: boolean
  isSupported: boolean
}

export function useVoiceInput({ onTranscript, onError }: UseVoiceInputOptions): UseVoiceInputReturn {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  const recognitionRef = useRef<ISpeechRecognition | null>(null)
  const stoppedByUserRef = useRef(false)
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep callbacks in refs so closures never go stale
  const onTranscriptRef = useRef(onTranscript)
  const onErrorRef = useRef(onError)
  useEffect(() => { onTranscriptRef.current = onTranscript }, [onTranscript])
  useEffect(() => { onErrorRef.current = onError }, [onError])

  useEffect(() => {
    setIsSupported('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    return () => {
      stoppedByUserRef.current = true
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current)
      recognitionRef.current?.stop()
    }
  }, [])

  function getAPI(): SpeechRecognitionConstructor | null {
    const w = window as typeof window & {
      SpeechRecognition?: SpeechRecognitionConstructor
      webkitSpeechRecognition?: SpeechRecognitionConstructor
    }
    return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
  }

  function createAndStart() {
    const API = getAPI()
    if (!API) return

    const recognition = new API()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => setIsListening(true)

    recognition.onresult = (event) => {
      let transcript = ''
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      onTranscriptRef.current(transcript)
    }

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        stoppedByUserRef.current = true
        setIsListening(false)
        recognitionRef.current = null
        onErrorRef.current?.('permission-denied')
      }
      // aborted / no-speech: let onend handle it
    }

    recognition.onend = () => {
      recognitionRef.current = null
      if (stoppedByUserRef.current) {
        setIsListening(false)
        return
      }
      // Browser cut the session (common in Chrome) — restart after brief delay
      restartTimerRef.current = setTimeout(() => {
        if (!stoppedByUserRef.current) createAndStart()
      }, 150)
    }

    recognitionRef.current = recognition
    try {
      recognition.start()
    } catch {
      // start() can throw if called too soon after stop — retry once
      restartTimerRef.current = setTimeout(() => {
        if (!stoppedByUserRef.current) createAndStart()
      }, 300)
    }
  }

  function start() {
    if (!isSupported) {
      onErrorRef.current?.('not-supported')
      return
    }
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current)
    stoppedByUserRef.current = false
    createAndStart()
  }

  function stop() {
    stoppedByUserRef.current = true
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current)
    recognitionRef.current?.stop()
  }

  return { start, stop, isListening, isSupported }
}
