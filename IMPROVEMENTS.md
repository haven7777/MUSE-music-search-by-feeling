# MUSE — Weakness Fixes Roadmap

## Priority Order (impact vs effort)

### Batch 1: Security & Error Handling (HIGH IMPACT, LOW EFFORT) ✅ DONE
- [x] **1.1 Prompt injection protection** — sanitizeForPrompt() strips quotes, collapses newlines, caps length
- [x] **1.2 Silent failure fixes** — Error toasts for refresh/refine failures via useToast
- [x] **1.3 Retry logic** — withRetry() utility with exponential backoff on all Groq LLM calls
- [x] **1.4 Add .env.example** — Documents all 6 required env vars

### Batch 2: Code Quality (MEDIUM IMPACT, MEDIUM EFFORT) ✅ DONE
- [x] **2.1 Split large components** — Extracted RefinementInput from ResultsPage (~70 lines less)
- [x] **2.2 Unify styling approach** — Skipped (low ROI, mixed approach works fine for solo project)
- [x] **2.3 Remove unsafe type casts** — Added isSpotifyTrack/isAudiusTrack type guards, replaced all `as` casts
- [x] **2.4 Lazy load heavy components** — Dynamic import for TrackModal and MoodBackground (ssr: false)

### Batch 3: Performance (MEDIUM IMPACT, LOW EFFORT) ✅ DONE
- [x] **3.1 Fix SW caching** — Added cache size limits (200 images, 100 static) to prevent unbounded growth
- [x] **3.2 Image optimization** — Added loading="lazy" + decoding="async" to all album art images
- [x] **3.3 Bundle analysis** — Verified: all heavy deps are server-only or tree-shakeable, no issues

### Batch 4: CI/CD (HIGH IMPACT, LOW EFFORT)
- [ ] **4.1 GitHub Actions workflow** — Lint + type-check + build on every push/PR
- [ ] **4.2 Add .env.example validation** — Fail build if required env vars are missing

### Batch 5: Testing (HIGH IMPACT, HIGH EFFORT)
- [ ] **5.1 Setup Vitest** — Install and configure for the Next.js project
- [ ] **5.2 Unit tests — lib/** — Test groq.ts helpers, spotify.ts, audius.ts, rateLimit, colorSystem, utils
- [ ] **5.3 Unit tests — API routes** — Test each route's validation, error handling, response shape
- [ ] **5.4 Component tests** — Test key interactive components (HeroInput, ResultsPage, MiniPlayer)
- [ ] **5.5 E2E smoke test** — One Playwright test: input mood → see results → save moment

---

## Session Strategy
- Do 1 batch per session
- Push after each batch
- Verify nothing broke before moving to next
- Batch 1 → 2 → 3 can run in one long session if context allows
- Batch 4 and 5 are independent and can be done in any order
