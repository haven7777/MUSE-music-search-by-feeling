# Voice Input Feature — Design Spec

**Date:** 2026-03-23
**Project:** MUSE — AI Mood-to-Music Web App
**Status:** Approved

---

## Overview

Allow users to express their feeling via voice instead of typing. A mic icon inside the existing text input triggers browser-native speech recognition. The transcribed text lands in the input field for the user to review before submitting.

---

## Design Decisions

| Question | Decision | Reason |
|---|---|---|
| Trigger placement | Mic icon inside text input (right side) | Lowest friction, follows established patterns (iOS keyboard, Google Search), keeps voice optional |
| While listening | Floating pill above input with pulsing dot + "Listening..." + stop button | Clear feedback without obscuring input, glass aesthetic matches MUSE style |
| After speaking | Transcript lands in input, user submits manually | Preserves user control, consistent with typed flow |
| Permission handling | Always show mic icon, browser prompts on click | Discoverable; browser handles the permission UX natively |
| Language | Force `lang="en-US"` | MUSE's pipeline (Groq, Spotify, Audius) works best with English input |
| Implementation | Web Speech API, client-side only | Free, instant, no backend needed, covers ~90% of users (Chrome/Safari/Edge) |

---

## Architecture

No new API routes. All logic is client-side.

```
HeroInput
  ├── mic button (right side of input, always visible)
  ├── useVoiceInput (custom hook — SpeechRecognition lifecycle)
  └── ListeningPill (floating component, shown while isListening)
```

### New Files
- `components/home/ListeningPill.tsx` — floating pill UI component
- `hooks/useVoiceInput.ts` — custom hook encapsulating SpeechRecognition

### Modified Files
- `components/home/HeroInput.tsx` — adds mic button and integrates hook + pill

---

## Component Details

### `useVoiceInput` hook

```ts
interface UseVoiceInputOptions {
  onTranscript: (text: string) => void
  onError?: (error: string) => void
}

interface UseVoiceInputReturn {
  start: () => void
  stop: () => void
  isListening: boolean
  isSupported: boolean
}
```

- Creates `SpeechRecognition` with `continuous: false`, `interimResults: true`, `lang: 'en-US'`
- `onresult`: calls `onTranscript(text)` with latest interim/final transcript on every result event
- `onend`: sets `isListening = false` automatically
- `onerror`: handles `not-allowed` (permission denied) → calls `onError('permission-denied')`, `no-speech` → silently resets
- Cleans up (calls `stop()`) on unmount via `useEffect` return

### `ListeningPill` component

```ts
interface ListeningPillProps {
  onStop: () => void
}
```

- Absolutely positioned above the input using relative parent container
- Content: pulsing dot + "Listening..." text + × stop button
- Styled with `backdrop-filter: blur(12px)`, `rgba` background, border — matches MUSE glass aesthetic
- Wrapped in Framer Motion `AnimatePresence` for smooth enter/exit (slide up + fade)

### `HeroInput` changes

- Mic button added to right side of input, inside the input wrapper
- States:
  - **Idle / unsupported**: mic icon, `opacity: 0.5` at rest, `opacity: 1` on hover
  - **Unsupported browser**: `title="Voice not supported in this browser"`, pointer-events none on click
  - **Listening**: mic icon shifts to `color: var(--muse-primary)` to signal active state
- `onTranscript`: replaces current input value with transcript (voice is a fresh expression, not an append)
- `onError('permission-denied')`: shows small error text below input — "Microphone access needed for voice input" — auto-dismisses after 4s via `setTimeout`
- `ListeningPill` renders inside a `relative` wrapper above the input, controlled by `isListening`

---

## UX Flow

1. User sees mic icon on right side of text input
2. User clicks mic
   - If permission not yet granted → browser native permission prompt appears
   - If permission granted → skip to step 3
3. `ListeningPill` appears above input with pulsing animation + "Listening..."
4. User speaks — words appear in the input field in real-time as interim results stream in
5. User stops speaking (silence timeout) OR clicks × stop button
6. Final transcript locks into input field; pill dismisses with animation
7. Mic icon returns to idle state
8. User reviews text, optionally edits, then clicks "Feel the Music" to submit

---

## Error Handling

| Scenario | Behavior |
|---|---|
| Browser doesn't support SpeechRecognition | `isSupported = false`; mic icon shows tooltip "Voice not supported in this browser"; click does nothing |
| Permission denied | Small text below input: "Microphone access needed for voice input"; auto-dismisses after 4s; mic stays clickable |
| No speech / silence timeout | `onend` fires naturally; pill dismisses; input stays empty; no error shown |
| Navigation while listening | `useEffect` cleanup calls `stop()` |
| Existing text in input | Transcript replaces (not appends) existing text |

---

## Out of Scope

- Whisper API fallback (Firefox users type instead)
- Multi-language support (English only)
- Voice activity detection beyond browser's built-in silence timeout
- Saving voice recordings

---

## Acceptance Criteria

- [ ] Mic icon visible on right side of text input on home page
- [ ] Clicking mic triggers browser permission prompt if not granted
- [ ] While listening, `ListeningPill` floats above input with pulsing dot and stop button
- [ ] Spoken words appear in the input field in real-time
- [ ] Stopping (silence or × button) dismisses pill and finalizes transcript in input
- [ ] User submits manually via "Feel the Music" button — no auto-submit
- [ ] Permission denied shows error text below input, auto-dismisses after 4s
- [ ] Unsupported browsers show tooltip, mic does nothing on click
- [ ] Navigating away while listening stops recognition cleanly
- [ ] `lang="en-US"` is set on SpeechRecognition instance
