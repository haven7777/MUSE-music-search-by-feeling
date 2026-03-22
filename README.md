```
███╗   ███╗██╗   ██╗███████╗███████╗
████╗ ████║██║   ██║██╔════╝██╔════╝
██╔████╔██║██║   ██║███████╗█████╗
██║╚██╔╝██║██║   ██║╚════██║██╔══╝
██║ ╚═╝ ██║╚██████╔╝███████║███████╗
╚═╝     ╚═╝ ╚═════╝ ╚══════╝╚══════╝
```

### Describe a feeling. Discover its soundtrack.

[![Deploy with Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com)
![Next.js](https://img.shields.io/badge/Next.js_14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript)
![Groq](https://img.shields.io/badge/Groq-Llama_3.3_70B-orange?style=flat-square)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-animations-purple?style=flat-square)

---

## The Problem

Every music app asks you to pick a genre, tap a mood button, or browse a pre-made playlist. "Chill vibes." "Workout." "Focus." These aren't feelings. They're categories.

MUSE asks something more human: **"What are you feeling right now?"**

You type anything in natural language — a moment, a mood, a contradiction — and MUSE translates it into music using emotional AI. Not genre matching. Not keyword matching. **Emotional translation.**

---

## How It Works

**1. ✍️ Describe** — Type your feeling in natural language. Anything from "driving alone at 3am feeling nostalgic but weirdly hopeful" to "quiet anger I can't show."

**2. 🧠 Decode** — Groq (Llama 3.3 70B) analyzes the emotional core, energy level, tempo range, valence target, and sonic texture of your feeling — and generates a custom color palette for your mood.

**3. 🎵 Discover** — MUSE simultaneously searches Spotify (for mainstream metadata + audio features), iTunes (for 30-second previews), and Audius (for full indie/underground playback).

**4. 🎨 Experience** — Results appear in a dynamically themed interface — every color, every gradient, every glow shifts to match your emotional analysis. A second AI call ranks all 10 tracks and writes one specific, evocative sentence explaining why each song fits *this exact feeling.*

---

## Features

- **Dynamic color theming** — Groq generates a bespoke color palette per mood. Sad + introspective → deep purples and navy. Energetic + joyful → amber and coral. The entire UI shifts.
- **Dual-platform discovery** — Mainstream (Spotify metadata) and underground (Audius full playback) in a single view.
- **iTunes preview fallback** — Spotify deprecated preview URLs in late 2024. MUSE uses the iTunes Search API (free, no auth) for 30-second previews of mainstream tracks.
- **AI explanations that are actually specific** — Not "this song has a melancholic feel." More like "the synth fade at 0:43 mirrors that moment when hope arrives when you least expect it."
- **Vibe Signature** — A custom SVG radar chart showing your mood's audio fingerprint across Energy, Danceability, Valence, Acousticness, and Tempo — animated on mount, colored by your palette.
- **Saved Moments gallery** — Save any playlist to localStorage. Revisit your musical memories, each with its unique color identity.
- **Single-player enforcement** — One track plays at a time across both columns, enforced via React Context.

---

## Architecture

### Why Groq?
Speed. Llama 3.3 70B via Groq's inference API returns a structured vibe profile in under 1 second — fast enough to feel real-time. The alternative (OpenAI, Anthropic) would add 3-5 seconds of perceived latency and break the illusion of instantaneous emotional translation.

### Why iTunes for Previews?
Spotify deprecated `preview_url` in November 2024. The iTunes Search API is free, requires no authentication, and provides 30-second MP3 previews for most mainstream catalog tracks. MUSE searches iTunes server-side and attaches preview URLs to matched Spotify tracks.

### Why Audius?
Audius provides free, full-length audio streaming with no rate limits and no API key required for basic search. Its catalog skews toward independent and emerging artists — the perfect complement to Spotify's mainstream coverage. Stream URLs (`/v1/tracks/{id}/stream`) are used directly as `<audio src>`, with the browser following the 302 redirect natively.

### Dynamic Color System
`lib/colorSystem.ts` injects CSS custom properties onto `:root` via `document.documentElement.style.setProperty`. All components reference `var(--muse-primary)` etc. instead of hardcoded colors. A CSS transition on `:root` makes the palette shift smooth (0.8s ease). Contrast text is computed via the WCAG relative luminance formula to guarantee AA accessibility on any generated palette.

### Two-Phase AI Approach
1. **Decode** (`/api/vibe`) — Groq decodes the feeling into a structured `VibeProfile` with musical parameters and a color palette. Uses `response_format: { type: 'json_object' }` for reliable structured output.
2. **Rank + Explain** (`/api/rank`) — After music search, all 10 candidate tracks are sent back to Groq with the original feeling context. Groq re-ranks by emotional fit and writes one specific explanatory sentence per track.

---

## Getting Started

```bash
# 1. Clone and install
git clone <repo-url>
cd muse
npm install

# 2. Configure environment
cp .env.local.example .env.local
# Fill in your API keys (see table below)

# 3. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Required | Source |
|----------|----------|--------|
| `SPOTIFY_CLIENT_ID` | Yes | [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) |
| `SPOTIFY_CLIENT_SECRET` | Yes | [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) |
| `GROQ_API_KEY` | Yes | [Groq Console](https://console.groq.com) |

Audius and iTunes require no API keys.

---

## What's Next

- **Spotify OAuth** — Save generated playlists directly to your Spotify account
- **Emotional timeline** — Visualize your mood history as a temporal color gradient
- **Collaborative moments** — Share a feeling + playlist with a friend via URL
- **Visual export** — Export any playlist as a shareable card image (html2canvas)
- **Voice input** — Describe your feeling by speaking instead of typing
