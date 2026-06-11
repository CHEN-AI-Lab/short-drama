# Progress

## Current State
- Project scaffold created: Harness skeleton, shared layer, apps/web setup
- Core types and constants defined
- AI generation API route implemented
- UI components built (InputPanel, OutputPanel, CharacterPanel, ScriptPreview)
- i18n bilingual support (zh-CN + en)
- Supabase auth integration
- Tests scaffolded

## Completed
- [x] Harness skeleton (docs, scripts, CI/CD, CLAUDE.md, README)
- [x] Shared types (DramaGenre, Character, EpisodeOutline, Scene, etc.)
- [x] Shared constants, validators, utils, API client, hooks
- [x] packages/ui components (Button, Input, Badge, Card)
- [x] apps/web: Next.js app with layouts, i18n, middleware
- [x] API route `/api/generate` with SenseTime AI
- [x] Home page, sign-in, sign-up, pricing, success, admin pages
- [x] Unit tests for shared layer
- [x] CI/CD pipeline
- [x] Vercel deployment (short-drama-iota.vercel.app)

## 2026-06-11: Full Polish Pass

### 1. SEO 优化
- [x] sitemap.ts — 10 URLs (5 pages × 2 locales)
- [x] robots.ts — allow /, disallow /api/ and /admin
- [x] Enhanced root layout metadata (title template, OG, favicon)
- [x] SVG favicon with gradient

### 2. 视觉精修
- [x] Ambient gradient orbs + float animation on hero
- [x] Gradient heading text (text-gradient utility)
- [x] Animated page load (fade-in-up, stagger-children)
- [x] Card hover lift effect (card-hover class)
- [x] Section headers with accent bar
- [x] Reduced motion support

### 3. 功能增强
- [x] History integration: useDramaHistory connected to DramaGenerator
- [x] `/history` page with list, clear, empty state
- [x] Nav links (生成, 历史, 定价)
- [x] TXT export button in result section
- [x] Full zh-CN + en translations for history

### 4. 付费集成
- [x] Real Creem checkout API (`/api/checkout`)
- [x] Creem webhook handler (`/api/webhooks/creem`)
- [x] Signature verification via HMAC-SHA256
- [x] Updates user_metadata + app_metadata on payment
- [x] Falls back gracefully when Creem keys missing

### 5. 部署
- [x] Git commit + push to GitHub
- [x] Vercel redeploy (production URL: short-drama-iota.vercel.app)
- [x] Verified: home, history, sitemap, robots, English nav all working

## Known Issues
- [ ] Nav links in mobile menu are hidden (sm:flex) — no hamburger menu yet
- [ ] Creem webhook signature verification not tested end-to-end (needs Creem to send test event)
- [ ] History is localStorage-only — clearing browser data loses it

## Next Steps
- [ ] Add more drama genres based on market trends
- [ ] Mobile hamburger menu
- [ ] Script export PDF (currently only TXT)
- [ ] Collaborative editing features
