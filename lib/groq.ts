import Groq from 'groq-sdk'
import { AudiusTrack, RankedTrack, SpotifyTrackData, VibeProfile } from '@/types'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const MODEL = 'llama-3.3-70b-versatile'

function stripJsonFences(text: string): string {
  return text.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
}

function safeParseJson<T>(text: string): T | null {
  try {
    return JSON.parse(stripJsonFences(text)) as T
  } catch {
    return null
  }
}

export async function decodeVibe(input: string): Promise<VibeProfile> {
  const response = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0.7,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are a synesthetic music curator with perfect emotional intelligence. You translate human feelings into precise musical and visual parameters. You think in colors, textures, and sonic landscapes. You never use clichés.

CRITICAL — Emotional nuance and restraint:
- When the user uses qualifiers like "quiet", "soft", "trying not to", "holding back", "gentle", "barely", "almost", "subtle" — the vibe name and all music attributes MUST reflect restraint and internalization, NOT intensity.
  - "quiet anger" → moodLabel: "Smoldering Tension" or "Controlled Burn" or "Still Water Rage" — NOT "Burning Fury" or "Explosive Rage"
  - "soft sadness" → reflective, not overwhelming
  - "trying to stay calm" → tension below the surface, not explosive energy
- The moodLabel must be tonally faithful. "Quiet" anything should have a low-to-moderate energyLevel (20-45) and lower tempo.
- For anger WITH restraint: use deep crimson/maroon colors, NOT bright red
- For sadness: distinguish between acute grief (lower energy, lower valence) and nostalgic melancholy (moderate)

Underground search query guidance:
- Underground queries for Audius should use MUSICAL GENRE TERMS, not pure mood descriptions
- Good: "lo-fi melancholy piano", "indie sad guitar", "bedroom pop heartbreak"
- Bad: "music for feeling sad and lonely" (Audius users don't tag that way)
- Include genre + emotion or genre + instrument
- Consider: lo-fi, indie, bedroom pop, ambient, post-rock, dream pop, emo, singer-songwriter, folk

Spotify genre seed guidance — spotifyGenres MUST be 2-4 values chosen ONLY from this exact list:
acoustic, ambient, blues, chill, classical, country, dance, electronic, emo, folk, funk, grunge, hip-hop, house, indie, indie-pop, jazz, metal, new-age, piano, pop, punk, r-n-b, rainy-day, rock, sad, singer-songwriter, sleep, soul, study, synth-pop, trip-hop
Examples: late-night melancholy → ["sad", "indie-pop", "singer-songwriter"] | euphoric party → ["dance", "pop", "electronic"] | peaceful study → ["ambient", "study", "acoustic"]

Audio parameters guidance:
- danceability 0-100: how rhythmically inviting (low = free-form, high = groove-locked)
- acousticness 0-100: organic/live instruments vs electronic production
- instrumentalness 0-100: vocals absent (high) vs vocals present (low)
- Quiet/introspective moods: high acousticness (60-90), low danceability (10-30)
- Electronic/club moods: low acousticness (5-20), high danceability (70-90)
- Ambient/instrumental: high instrumentalness (60-90)`,
      },
      {
        role: 'user',
        content: `The user described this feeling or moment:
"${input}"

Return ONLY a valid JSON object matching this exact structure. No markdown, no backticks, no explanation, just JSON:
{
  "emotionalCore": "2-3 word emotional essence",
  "energyLevel": 0-100,
  "tempoRange": { "min": 60, "max": 90 },
  "valenceTarget": 0.0-1.0,
  "danceability": 0-100,
  "acousticness": 0-100,
  "instrumentalness": 0-100,
  "spotifyGenres": ["genre1", "genre2", "genre3"],
  "sonicTexture": ["texture1", "texture2", "texture3"],
  "era": "timeless|70s|80s|90s|2000s|modern",
  "searchQueries": {
    "mainstream": [
      "artist or song name matching this feeling",
      "query 2",
      "query 3",
      "query 4",
      "query 5"
    ],
    "underground": [
      "genre + mood query for Audius (e.g. 'lo-fi melancholy piano')",
      "genre + emotion query 2 (e.g. 'indie sad bedroom pop')",
      "genre + texture query 3 (e.g. 'ambient introspective guitar')",
      "genre + instrument query 4",
      "broader genre query 5 (e.g. just 'lo-fi chill' or 'indie folk')"
    ]
  },
  "colorPalette": {
    "primary": "#hexcode",
    "secondary": "#hexcode",
    "background": "#hexcode starting dark",
    "text": "#hexcode high contrast on background",
    "surface": "#hexcode slightly lighter than background"
  },
  "moodLabel": "Poetic 2-3 word label that accurately reflects the NUANCE and RESTRAINT in the user's description"
}

Color rules:
- Background must always be dark (lightness < 20%)
- Primary should be vivid and emotionally resonant
- Colors must form a coherent, beautiful palette
- Sad moods: deep blues, purples, slate
- Happy moods: amber, coral, gold
- Angry moods with restraint: deep maroon, wine, near-black with crimson
- Angry moods explosive: deep red, near-black, burnt orange
- Peaceful moods: sage, teal, warm grey
- Energetic moods: electric blue, violet, lime`,
      },
    ],
  })

  const text = response.choices[0]?.message?.content ?? ''
  const parsed = safeParseJson<VibeProfile>(text)

  if (!parsed) {
    throw new Error('Failed to parse vibe profile from AI response')
  }

  return parsed
}

export async function refineVibe(currentVibe: VibeProfile, originalInput: string, refinement: string): Promise<VibeProfile> {
  const response = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0.7,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are a synesthetic music curator. The user already has a vibe profile from their original feeling. They want to REFINE it — adjust the musical parameters based on their feedback while keeping the core mood intact.

Rules:
- Adjust the vibe profile based on the refinement, NOT replace it entirely
- If they say "more acoustic" — increase acousticness, shift search queries toward acoustic artists
- If they say "darker" — lower valence, shift colors darker, adjust mood label
- If they say "more energy" — increase energyLevel, tempo, danceability
- If they say "less mainstream" — shift mainstream queries toward indie/alternative artists
- Keep the colorPalette coherent — adjust it to match the refined mood
- Generate ENTIRELY NEW searchQueries that reflect the refined vibe — don't reuse the old ones
- The moodLabel should subtly shift to reflect the refinement
- spotifyGenres MUST be from: acoustic, ambient, blues, chill, classical, country, dance, electronic, emo, folk, funk, grunge, hip-hop, house, indie, indie-pop, jazz, metal, new-age, piano, pop, punk, r-n-b, rainy-day, rock, sad, singer-songwriter, sleep, soul, study, synth-pop, trip-hop`,
      },
      {
        role: 'user',
        content: `Original feeling: "${originalInput}"

Current vibe profile:
${JSON.stringify(currentVibe, null, 2)}

User's refinement: "${refinement}"

Return ONLY a valid JSON object with the FULL updated vibe profile (same structure as the current one). Adjust all fields that the refinement affects. Generate completely new searchQueries. No markdown, no backticks, just JSON.`,
      },
    ],
  })

  const text = response.choices[0]?.message?.content ?? ''
  const parsed = safeParseJson<VibeProfile>(text)

  if (!parsed) {
    throw new Error('Failed to parse refined vibe profile')
  }

  return parsed
}

type TrackInput = {
  source: 'spotify' | 'audius'
  track: SpotifyTrackData | AudiusTrack
}

interface RankResult {
  trackId: string
  rank: number
  explanation: string
  confidence: number
}

export async function rankTracks(
  originalInput: string,
  vibeProfile: VibeProfile,
  tracks: TrackInput[],
): Promise<RankedTrack[]> {
  const trackDescriptions = tracks
    .map((t) => {
      const isSpotify = t.source === 'spotify'
      const track = t.track

      if (isSpotify) {
        const s = track as SpotifyTrackData
        const featStr = s.audioFeatures
          ? `Energy: ${s.audioFeatures.energy.toFixed(2)}, Valence: ${s.audioFeatures.valence.toFixed(2)}, Danceability: ${s.audioFeatures.danceability.toFixed(2)}`
          : 'Audio features unavailable'
        return `[SPOTIFY] ID:${s.id} "${s.title}" by ${s.artist}\n  ${featStr}`
      } else {
        const a = track as AudiusTrack
        const tagsStr = a.tags.length > 0 ? a.tags.join(', ') : 'none'
        return `[AUDIUS] ID:${a.id} "${a.title}" by ${a.artist}\n  Plays: ${a.playCount}, Tags: ${tagsStr}`
      }
    })
    .join('\n\n')

  const response = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0.8,
    messages: [
      {
        role: 'system',
        content: `You are the world's most empathetic music curator. You understand that music selection is deeply personal and emotional. You write about music the way great critics do — specifically, evocatively, never generically.`,
      },
      {
        role: 'user',
        content: `The user felt: "${originalInput}"
Their emotional profile: ${JSON.stringify({ emotionalCore: vibeProfile.emotionalCore, energyLevel: vibeProfile.energyLevel, valenceTarget: vibeProfile.valenceTarget, sonicTexture: vibeProfile.sonicTexture, moodLabel: vibeProfile.moodLabel })}

Here are the candidate tracks:
${trackDescriptions}

Return ONLY valid JSON — an array of ranked results:
[
  {
    "trackId": "id from above",
    "rank": 1,
    "explanation": "One sentence, max 120 chars, specific to THIS feeling, never generic. Reference a musical element if possible.",
    "confidence": 0.85
  }
]

confidence: 0.0-1.0 — how well this track genuinely fits the feeling (below 0.6 = poor fit).
Order by fit with the feeling (rank 1 = best match).
Include ALL tracks provided. No markdown, just JSON array.`,
      },
    ],
  })

  const text = response.choices[0]?.message?.content ?? ''
  const rankResults = safeParseJson<RankResult[]>(text)

  const rankMap = new Map<string, RankResult>()
  if (rankResults && Array.isArray(rankResults)) {
    for (const r of rankResults) {
      rankMap.set(r.trackId, r)
    }
  }

  const ranked: RankedTrack[] = tracks.map((t, i) => {
    const id = t.track.id
    const result = rankMap.get(id)
    return {
      source: t.source,
      rank: result?.rank ?? i + 1,
      explanation: result?.explanation ?? 'Selected for your mood',
      confidence: result?.confidence ?? 1,
      track: t.track,
    }
  })

  ranked.sort((a, b) => a.rank - b.rank)
  return ranked
}

const VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'

export async function decodeVibeFromImage(imageBase64: string, mimeType: string, textHint?: string): Promise<VibeProfile> {
  const imagePrompt = textHint
    ? `The user uploaded this image and said: "${textHint}". Analyze the mood, atmosphere, colors, and emotional tone of this image combined with their words.`
    : `Analyze the mood, atmosphere, colors, and emotional tone of this image.`

  const response = await groq.chat.completions.create({
    model: VISION_MODEL,
    temperature: 0.7,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:${mimeType};base64,${imageBase64}` },
          },
          {
            type: 'text',
            text: `You are a synesthetic music curator with perfect emotional intelligence. You translate feelings and images into precise musical and visual parameters.

${imagePrompt}

Then return ONLY a valid JSON object (no markdown, no backticks) matching this exact structure:
{
  "emotionalCore": "2-3 word emotional essence",
  "energyLevel": 0-100,
  "tempoRange": { "min": 60, "max": 90 },
  "valenceTarget": 0.0-1.0,
  "danceability": 0-100,
  "acousticness": 0-100,
  "instrumentalness": 0-100,
  "spotifyGenres": ["genre1", "genre2", "genre3"],
  "sonicTexture": ["texture1", "texture2", "texture3"],
  "era": "timeless|70s|80s|90s|2000s|modern",
  "searchQueries": {
    "mainstream": ["query1", "query2", "query3", "query4", "query5"],
    "underground": ["lo-fi genre+mood query1", "genre+emotion query2", "genre+texture query3", "genre+instrument query4", "broader genre query5"]
  },
  "colorPalette": {
    "primary": "#hexcode vivid and emotionally resonant",
    "secondary": "#hexcode complementary",
    "background": "#hexcode dark (lightness < 20%)",
    "text": "#hexcode high contrast on background",
    "surface": "#hexcode slightly lighter than background"
  },
  "moodLabel": "Poetic 2-3 word label"
}

spotifyGenres MUST be from: acoustic, ambient, blues, chill, classical, country, dance, electronic, emo, folk, funk, grunge, hip-hop, house, indie, indie-pop, jazz, metal, new-age, piano, pop, punk, r-n-b, rainy-day, rock, sad, singer-songwriter, sleep, soul, study, synth-pop, trip-hop`,
          },
        ],
      },
    ],
  })

  const text = response.choices[0]?.message?.content ?? ''
  const parsed = safeParseJson<VibeProfile>(text)

  if (!parsed) {
    throw new Error('Failed to parse vibe profile from vision response')
  }

  // Vision models sometimes add descriptions after hex codes — strip them
  if (parsed.colorPalette) {
    const extractHex = (val: string) => {
      const match = val.match(/#[0-9A-Fa-f]{6}/)
      return match ? match[0] : val
    }
    parsed.colorPalette.primary = extractHex(parsed.colorPalette.primary)
    parsed.colorPalette.secondary = extractHex(parsed.colorPalette.secondary)
    parsed.colorPalette.background = extractHex(parsed.colorPalette.background)
    parsed.colorPalette.text = extractHex(parsed.colorPalette.text)
    parsed.colorPalette.surface = extractHex(parsed.colorPalette.surface)
  }

  return parsed
}
