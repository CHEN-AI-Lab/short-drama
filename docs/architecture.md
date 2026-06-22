# Short Drama — Architecture

## Overview

AI短剧脚本生成器 — An AI-powered short drama script generation tool. Input a genre/element combination (e.g., "霸总+穿越+甜宠"), and the AI generates episode outlines, scene breakdowns, character arcs, and full scripts.

## Tech Stack

- **Web**: Next.js 15 (App Router) + React 19 + TypeScript (strict)
- **Styling**: Tailwind CSS 4 + dark mode
- **i18n**: next-intl v4 (zh-CN + en, cookie-only)
- **AI**: SenseTime (sensenova-6.7-flash-lite) with backup provider support
- **Auth**: Supabase (email/password + Google OAuth)
- **Payment**: Creem (optional, for paid plans)
- **Build**: pnpm workspace monorepo + Turborepo
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Deploy**: Vercel

## Project Structure

```
short-drama/
├── shared/              # Cross-platform shared layer
│   ├── types/           # DramaGenre, Character, EpisodeOutline, etc.
│   ├── constants/       # GENRES, EPISODE_COUNTS, DAILY_LIMIT_FREE
│   ├── validators/      # Zod schemas
│   ├── utils/           # System prompts, format utilities
│   ├── api/             # API client + Supabase wrappers
│   ├── hooks/           # Shared React hooks (useDramaHistory, usePaymentStatus)
│   └── messages/        # i18n translation files (zh-CN.json, en.json)
├── apps/web/            # Next.js web app
│   └── src/
│       ├── app/[locale]/   # Pages (home, sign-in, sign-up, history, pricing, admin, success)
│       ├── app/api/        # API routes (generate, auth, checkout, webhooks, user, admin)
│       ├── components/     # UI components (DramaGenerator, CharacterList, EpisodeList, etc.)
│       └── i18n/           # next-intl request config
├── packages/ui/         # Shared UI components (Button, Card, Input, Badge, GenrePill, Toast)
├── tests/               # Unit + E2E tests
├── scripts/             # Setup/check/deploy
├── docs/                # Architecture, progress, decisions
└── .github/workflows/   # CI/CD
```

## Data Flow

1. User inputs drama genre/elements + episode count
2. Frontend sends GenerationRequest to `/api/generate`
3. API route checks auth → enforces daily limit → calls AI API (SenseTime primary, backup fallback)
4. AI returns generated script structure (episodes, scenes, characters)
5. Large scripts are batch-generated (3 episodes per batch to fit Vercel Hobby 10s limit)
6. If a batch fails, partial results are saved as a **checkpoint** in localStorage; user can resume from the last completed batch
7. Frontend displays results with tab-based browsing (characters / episodes / arcs)

## Generation Types

The system supports 4 generation modes, each with a different JSON output structure:

| Type | Characters | Per Episode | Scenes | Dialogue | Arcs |
|------|-----------|-------------|--------|----------|------|
| **Outline** | Name + role only | Title + hook + summary | ❌ | ❌ | ❌ |
| **Scene** | Name + age + personality + background + role | Title + hook + summary + scenes | ✅ | ❌ | ❌ |
| **Character** | Detailed (personality + background + relationships + arc) | Title + summary (concise) | ❌ | ❌ | ✅ |
| **Full Script** | Name + age + personality + background + role + relationships | Title + hook + summary + scenes + dialogue | ✅ | ✅ | ✅ |

## Episode Count

- **Auto mode** (default): AI decides episode count based on genres and story (typically 5–30). After generation, the input field syncs to the actual count.
- **Manual mode**: User inputs an exact number (1–200). The API enforces trimming/renumbering to match.

## Daily Limit

- Free users (authenticated, not paid): **3 generations/day**, tracked via `user_metadata.daily_generation_count` + `last_generation_date`
- Paid users (user_metadata.paid === true or app_metadata.role === 'pro'): **unlimited**
- Unauthenticated users: **no limit** (but limited utility without history)
- 429 response when limit exceeded with upgrade prompt

## Routes

| Path | Purpose |
|------|---------|
| `/` | Home page — drama generation interface |
| `/sign-in` | User login (email/password + Google OAuth) |
| `/sign-up` | User registration |
| `/pricing` | Pricing/payment plans |
| `/history` | Generation history (localStorage, 7-day retention) |
| `/success` | Payment success callback |
| `/admin` | Admin dashboard (live usage stats from Supabase) |

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/generate` | POST | Generate drama script (with daily limit check) |
| `/api/user/paid` | GET/POST | Check/update user payment status |
| `/api/user/session` | GET | Get current user session |
| `/api/checkout` | POST | Create Creem payment checkout session |
| `/api/auth/signin` | POST | Email/password login |
| `/api/auth/signup` | POST | Email/password registration |
| `/api/auth/logout` | POST | Sign out |
| `/api/auth/callback` | GET | OAuth callback (Google) |
| `/api/webhooks/creem` | POST | Creem payment webhook (HMAC-SHA256 verified) |
| `/api/admin/stats` | GET | Admin usage statistics (protected) |

## Auth & Session

- **Client**: `AuthProvider` (React context) fetches `/api/user/session` on mount
- **Server**: middleware.ts creates Supabase SSR client on every request
- **Login flow**: email/password → POST `/api/auth/signin` → sets cookies → redirect home
- **Google OAuth**: browser-side `signInWithOAuth` → callback route exchanges code for session
- **Admin check**: `/api/admin/stats` and admin page verify email === `phoebe.yanxi@gmail.com`

## Password Visibility Toggle

Password fields on sign-in and sign-up pages include an eye icon toggle that switches between `password` and `text` input types. Implemented in `packages/ui/src/input.tsx` via the `showPasswordToggle` prop.

## Export

Results can be downloaded as **Markdown (.md)** — includes full script content with scenes, dialogue, character details, and generation parameters.

## Shared Types

See `shared/types/index.ts` for complete type definitions:
- `DramaGenre` — genre keys (ceo, time_travel, sweet_romance, etc.)
- `EpisodeCount` — number (1–200)
- `GenerationRequest` / `GenerationResponse` — API contract
- `Character`, `EpisodeOutline`, `Scene`, `CharacterArc` — content models
- `HistoryItem` — localStorage history entry

## Shared Constants

See `shared/constants/index.ts` for genre lists, generation types, character archetypes, and daily limit constant.