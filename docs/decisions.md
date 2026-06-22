# Key Decisions

## ADR-001: Monorepo with apps/web only

**Context**: Only a web end is needed initially. Future mini-program (Taro) or mobile app (React Native) may be added.

**Decision**: Use pnpm monorepo with `apps/web/` as the only populated end. Empty `apps/` dirs reserved for future use.

**Consequence**: Adding a new platform later requires only creating a new app directory — no restructuring.

---

## ADR-002: Cookie-only i18n (no middleware.ts locale detection)

**Context**: next-intl v4 supports both middleware-based and cookie-only locale detection. Middleware adds complexity and URL prefix overhead.

**Decision**: Use cookie-only approach — locale is stored in `NEXT_LOCALE` cookie, no URL-based detection. The middleware still handles next-intl routing but does not auto-detect from browser.

**Consequence**: Simpler setup, no locale guessing. User must manually switch language. URL always has locale prefix (`/zh-CN/...`).

---

## ADR-003: SenseTime as primary AI provider

**Context**: Zero-cost requirement. The user has existing SenseTime API access with `sensenova-6.7-flash-lite` model.

**Decision**: Use SenseTime for all AI generation. Optional backup provider supported via BACKUP_* env vars.

**Consequence**: Primary provider dependency. If SenseTime API fails, falls back to backup provider (e.g., OpenAI-compatible).

---

## ADR-004: Supabase Auth (email + Google)

**Context**: User system is required. Supabase provides free-tier auth with multiple providers.

**Decision**: Use Supabase Auth with email/password + Google OAuth. `@supabase/ssr` handles cookie-based session management with Next.js.

**Consequence**: Users need Supabase project. Free tier is sufficient for MVP.

---

## ADR-005: No database for MVP

**Context**: V0 only needs text generation via API. User session and payment status can be tracked via Supabase Auth + localStorage cache.

**Decision**: Skip Prisma/SQLite for MVP. Payment status stored in Supabase user metadata (via `user_metadata`). Daily generation count also stored in `user_metadata`.

**Consequence**: MVP launches faster. Database can be added later when richer persistence is needed.

---

## ADR-006: Daily limit in user_metadata (no extra DB table)

**Context**: Free users need daily generation limits. Adding a separate DB table adds complexity.

**Decision**: Store `daily_generation_count` and `last_generation_date` in Supabase `user_metadata`. Reset count when date changes. Increment via service role admin API after successful generation.

**Consequence**: Simple but no historical tracking of per-day usage. Count resets if admin clears metadata.

---

## ADR-007: Password visibility toggle in Input component

**Context**: User explicitly requested eye icon toggle on password fields.

**Decision**: Add `showPasswordToggle` prop to the shared Input component. When `type="password"` and prop is true, render a relative wrapper with an eye icon button that toggles between password/text type.

**Consequence**: Clean UX — single toggle per field, no extra wrapper needed in sign-in/sign-up pages.

---

## ADR-008: Admin stats via Supabase admin.listUsers()

**Context**: Admin page needs live user/generation stats. No dedicated DB tables exist.

**Decision**: Use `supabase.auth.admin.listUsers()` to paginate through all users and aggregate stats from `user_metadata`. Admin access restricted to `phoebe.yanxi@gmail.com`.

**Consequence**: Works without a database. Pagination handles up to 10K+ users. Stats are approximate (generation_count and daily_generation_count are metadata fields, not transactional logs).

---

## ADR-009: Auto episode mode uses AI completion signal (storyComplete)

**Context**: Auto mode should let AI decide the episode count based on story content. Previously used `batchCount = 999` with a stop condition (`res.episodes.length < BATCH_SIZE = 3`). The API always returns exactly 3 episodes per batch (trimmed to `episodeCount`), so the stop condition never fires — causing infinite generation. A subsequent quick-fix capped auto mode at 10 batches (30 episodes) but this is arbitrary, not story-aware.

**Decision**: The AI now includes a `storyComplete` boolean in its JSON response. The prompt (both zh-CN and en) instructs the AI to set `storyComplete: true` when the story reaches its natural conclusion (all major conflicts resolved, proper ending), or `false` if more episodes are needed. The frontend stops looping when `res.storyComplete === true`. A `MAX_AUTO_BATCHES = 20` (60 episodes) safety limit prevents runaway loops if the AI never sets `storyComplete`. The API route passes `storyComplete` through from the AI JSON response.

**Files changed**:
- `shared/types/index.ts` — added `storyComplete?: boolean` to `GenerationResponse`
- `shared/utils/prompts.ts` — added `storyComplete` instructions to system prompt for both languages
- `apps/web/src/app/api/generate/route.ts` — reads `storyComplete` from AI response, includes in response
- `apps/web/src/components/DramaGenerator.tsx` — sends `autoEpisodeCount` flag through to prompt builder; checks `res.storyComplete === true` to stop

**Consequence**: Auto mode now generates the right number of episodes based on story pacing. The AI decides when the story is done. Safety limit of 60 episodes (20 batches × 3 eps) prevents infinite loops if the AI malfunctions.

---

## ADR-010: Generation Checkpoint — resume on batch failure

**Context**: AI API (SenseTime) can take 55–67s per batch of 3 episodes, dangerously close to the client's 70s timeout. If a single batch times out, the entire generation is lost and the user must start from scratch.

**Decision**: Save a `GenerationCheckpoint` to localStorage after each successful batch. On failure (either API error or network error), the partial result is displayed to the user with a "继续生成" (Continue) button. Clicking it loads the checkpoint, detects matching settings, and resumes generation from the last completed batch — skipping already-generated episodes.

Key design points:
- Checkpoint stored in localStorage with key `short_drama_generation_checkpoint`
- 6-hour TTL on checkpoints before auto-expiry
- `matchGenerationCheckpoint()` compares settings (genres, type, locale, instructions) — only resumes if identical
- Checkpoint cleared on: (a) successful completion, (b) settings change, (c) explicit "new generation"
- On resume, the component restores `seenCharNames` and `seenArcChars` sets for correct deduplication

**Files changed**:
- `shared/types/index.ts` — added `GenerationCheckpoint` interface
- `shared/constants/index.ts` — added `CHECKPOINT_KEY`, `CHECKPOINT_TTL_MS`
- `shared/hooks/index.ts` — added `saveGenerationCheckpoint`, `loadGenerationCheckpoint`, `clearGenerationCheckpoint`, `matchGenerationCheckpoint`
- `apps/web/src/components/DramaGenerator.tsx` — checkpoint save after each batch, resume on retry/continue, partial result display on failure

**Consequence**: Users no longer lose all progress when a batch fails mid-way. Partial content is visible and can be completed on retry. The safety net covers both explicit API errors (`res.error`) and unexpected JS exceptions (`catch`).