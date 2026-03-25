import { GoogleGenerativeAI } from '@google/generative-ai'
import { VibeProfile } from '@/types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

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

const SYSTEM_PROMPT = `You are a synesthetic music curator with perfect emotional intelligence. You translate human feelings into precise musical and visual parameters. You think in colors, textures, and sonic landscapes. You never use clichés.

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
- Ambient/instrumental: high instrumentalness (60-90)`

const USER_PROMPT_TEMPLATE = (input: string) => `The user described this feeling or moment:
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
- Energetic moods: electric blue, violet, lime`

export async function decodeVibe(input: string): Promise<VibeProfile> {
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: SYSTEM_PROMPT + '\n\n' + USER_PROMPT_TEMPLATE(input) }] }],
    generationConfig: {
      temperature: 0.7,
      responseMimeType: 'application/json',
    },
  })

  const text = result.response.text()
  const parsed = safeParseJson<VibeProfile>(text)

  if (!parsed) {
    throw new Error('Failed to parse vibe profile from Gemini response')
  }

  return parsed
}

export async function decodeVibeFromImage(imageBase64: string, mimeType: string, textHint?: string): Promise<VibeProfile> {
  const parts: Array<{ text: string } | { inlineData: { data: string; mimeType: string } }> = [
    { text: SYSTEM_PROMPT },
    { inlineData: { data: imageBase64, mimeType } },
    { text: textHint
      ? `The user uploaded this image and said: "${textHint}"\n\nAnalyze the mood, atmosphere, colors, and emotional tone of this image. Then ${USER_PROMPT_TEMPLATE('the feeling evoked by this image' + (textHint ? ` combined with: "${textHint}"` : ''))}`
      : `Analyze the mood, atmosphere, colors, and emotional tone of this image. Then ${USER_PROMPT_TEMPLATE('the feeling evoked by this image')}`
    },
  ]

  const result = await model.generateContent({
    contents: [{ role: 'user', parts }],
    generationConfig: {
      temperature: 0.7,
      responseMimeType: 'application/json',
    },
  })

  const text = result.response.text()
  const parsed = safeParseJson<VibeProfile>(text)

  if (!parsed) {
    throw new Error('Failed to parse vibe profile from Gemini vision response')
  }

  return parsed
}
