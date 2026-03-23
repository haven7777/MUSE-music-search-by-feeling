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
  const recognitionRef = useRef<ISpeechRecognition | null>(null)

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
    }
  }, [])

  function start() {
    if (!isSupported) {
      onError?.('not-supported')
      return
    }

    const w = window as typeof window & {
      SpeechRecognition?: SpeechRecognitionConstructor
      webkitSpeechRecognition?: SpeechRecognitionConstructor
    }
    const SpeechRecognitionAPI = w.SpeechRecognition ?? w.webkitSpeechRecognition

    if (!SpeechRecognitionAPI) return

    const recognition = new SpeechRecognitionAPI()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => setIsListening(true)

    recognition.onresult = (event) => {
      let transcript = ''
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      onTranscript(transcript)
    }

    recognition.onend = () => {
      setIsListening(false)
      recognitionRef.current = null
    }

    recognition.onerror = (event) => {
      setIsListening(false)
      recognitionRef.current = null
      if (event.error === 'not-allowed') {
        onError?.('permission-denied')
      }
      // 'no-speech' and others: silently reset
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  function stop() {
    recognitionRef.current?.stop()
  }

  return { start, stop, isListening, isSupported }
}
