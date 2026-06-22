# Progress

## Current State

Production-ready SaaS application deployed on Vercel. Full auth, AI generation, payments, admin dashboard, and bilingual i18n.

## Completed

### Core Infrastructure
- [x] Harness skeleton (CLAUDE.md, docs, scripts, CI/CD, README)
- [x] pnpm monorepo with shared/ + packages/ui + apps/web
- [x] Shared types (DramaGenre, Character, EpisodeOutline, Scene, etc.)
- [x] Shared constants, validators, utils, API client, hooks
- [x] packages/ui components (Button, Input with password toggle, Badge, Card, GenrePill, Toast)
- [x] Full i18n (zh-CN + en) via next-intl v4
- [x] Tailwind CSS v4 + dark mode

### Auth System
- [x] Supabase email/password sign-up with auto-confirm (service role)
- [x] Auth callback route with Google OAuth
- [x] sign-in, sign-up, logout pages
- [x] Password visibility toggle (eye icon) on all password fields
- [x] middleware.ts with Supabase SSR + next-intl

### AI Generation
- [x] `/api/generate` — SenseTime AI with backup provider fallback
- [x] 4 generation modes: outline, scene, character, full_script
- [x] Batch generation (3 eps/batch) for Vercel Hobby 10s limit
- [x] JSON repair strategies for malformed AI output
- [x] Multi-provider fallback (SenseTime → Backup)
- [x] Daily limit enforcement (3/day for free users, 429 on exceeded)

### Payment
- [x] Creem checkout API (`/api/checkout`)
- [x] Creem webhook handler (`/api/webhooks/creem`) with HMAC-SHA256 verification
- [x] User metadata update on successful payment
- [x] Payment status caching (localStorage + server revalidation)
- [x] Pricing page (Free + Pro tiers)
- [x] Success page with countdown redirect

### Pages
- [x] Home — drama generation interface with genre selection
- [x] History — 7-day localStorage history with delete/clear/review
- [x] Pricing — Free/Pro comparison with subscribe button
- [x] Admin — live dashboard with user stats (via Supabase admin API)
- [x] Success — payment callback with status feedback
- [x] Error — graceful error page with retry
- [x] sitemap.xml + robots.ts for SEO

### Testing
- [x] 33 unit tests for shared types, validators, utils, prompts, formats
- [x] E2E smoke tests for home page (zh-CN + en)
- [x] Full quality check (typecheck + tests + build)

### Deployment
- [x] Vercel project configured
- [x] CI/CD via GitHub Actions
- [x] Build passes cleanly (all routes compile)

## 2026-06-11: Full Polish Pass
- [x] SEO optimization (sitemap, robots, metadata, favicon)
- [x] Visual polish (gradient orbs, animations, card hover, reduced motion)
- [x] History integration with localStorage persistence
- [x] Creem payment integration

## 2026-06-19: Feature Completion Pass
- [x] Password visibility toggle on sign-in/sign-up
- [x] Daily limit enforcement for free users (3/day)
- [x] Admin API endpoint with real Supabase stats
- [x] Admin page with live stats (total users, paid users, generation counts)
- [x] Admin link in footer
- [x] Fixed unit test expectations (episodeCount default 10, generationType default full_script)
- [x] Full quality gate passed (33 tests, clean build)

## Bug Fix: Auto Episode Mode — AI Completion Signal
- [x] Fixed: auto episode count now uses AI-generated `storyComplete` signal
  - Root cause: stop condition `res.episodes.length < BATCH_SIZE` was always false (API returns exactly 3 per batch), causing infinite loop
  - Fix: AI now outputs `"storyComplete": true/false` in JSON based on whether the story reached its natural conclusion
  - Frontend reads `res.storyComplete === true` to stop, falls back to `MAX_AUTO_BATCHES = 20` safety limit
  - Prompt updated to instruct AI about the `storyComplete` field (both zh-CN and en)
  - API route passes through `storyComplete` from AI response

## Known Issues
- [ ] Mobile hamburger menu not implemented (nav is sm:flex, no hamburger)
- [ ] Creem webhook signature verification not tested end-to-end
- [ ] History is localStorage-only — clearing browser data loses it
- [ ] Generated stats are approximate (metadata-based, not transactional)

## Next Steps
- [ ] Add more drama genres based on market trends
- [ ] Mobile hamburger menu
- [ ] Script export PDF
- [ ] Collaborative editing features
- [ ] Database layer for persistent history

## 2026-06-22: Generation Checkpoint — resume on batch failure
- [x] `GenerationCheckpoint` type in shared/types
- [x] `CHECKPOINT_KEY` + `CHECKPOINT_TTL_MS` in shared/constants
- [x] `saveGenerationCheckpoint`, `loadGenerationCheckpoint`, `clearGenerationCheckpoint`, `matchGenerationCheckpoint` in shared/hooks
- [x] Checkpoint saved to localStorage after each successful batch
- [x] On batch failure: partial result displayed with "继续生成" button
- [x] On retry: checkpoint detected → resume from last completed batch
- [x] On success/clean start: checkpoint cleared
- [x] 6-hour TTL, settings-match guard, stale checkpoint cleanup