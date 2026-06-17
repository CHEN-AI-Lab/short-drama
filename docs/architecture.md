# Short Drama — Architecture

## Overview

AI短剧脚本生成器 — An AI-powered short drama script generation tool. Input a genre/element combination (e.g., "霸总+穿越+甜宠"), and the AI generates episode outlines, scene breakdowns, character arcs, and full scripts.

## Tech Stack

- **Web**: Next.js 15 (App Router) + React 19 + TypeScript (strict)
- **Styling**: Tailwind CSS 4 + dark mode
- **i18n**: next-intl v4 (zh-CN + en, cookie-only)
- **AI**: SenseTime (sensenova-6.7-flash-lite)
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
│   ├── constants/       # GENRES, EPISODE_COUNTS, CHARACTER_ARCHETYPES
│   ├── validators/      # Zod schemas
│   ├── utils/           # System prompts, format utilities
│   ├── api/             # API client + Supabase/Creem wrappers
│   ├── hooks/           # Shared React hooks
│   └── messages/        # i18n translation files
├── apps/web/            # Next.js web app
│   └── src/
│       ├── app/[locale]/   # Pages
│       ├── components/     # UI components
│       └── i18n/           # next-intl request config
├── packages/ui/         # Shared UI components
├── tests/               # Unit + E2E tests
├── scripts/             # Setup/check/deploy
├── docs/                # Architecture, progress, decisions
└── .github/workflows/   # CI/CD
```

## Data Flow

1. User inputs drama genre/elements + episode count
2. Frontend sends GenerationRequest to `/api/generate`
3. API route calls SenseTime API with structured prompt
4. AI returns generated script structure (episodes, scenes, characters)
5. Frontend displays results with tab-based browsing (characters / episodes / arcs)

## Generation Types

The system supports 4 generation modes, each with a different JSON output structure:

| Type | Characters | Per Episode | Scenes | Dialogue | Arcs |
|------|-----------|-------------|--------|----------|------|
| **Outline** | Name + role only | Title + hook + summary | ❌ | ❌ | ❌ |
| **Scene** | Name + age + personality + background + role | Title + hook + summary + scenes | ✅ | ❌ | ❌ |
| **Character** | Detailed (personality + background + relationships + arc) | Title + summary (concise) | ❌ | ❌ | ✅ |
| **Full Script** | Name + age + personality + background + role + relationships | Title + hook + summary + scenes + dialogue | ✅ | ✅ | ✅ |

The system prompt varies the required JSON schema per type — each type gets its own template structure, so the AI output differs significantly. See `shared/utils/prompts.ts` for the per-type prompt templates.

## Episode Count

- **Auto mode** (default): AI decides episode count based on genres and story (typically 5–30). After generation, the input field syncs to the actual count.
- **Manual mode**: User inputs an exact number (1–200). The API enforces trimming/renumbering to match.

## Routes

| Path | Purpose |
|------|---------|
| `/` | Home page — drama generation interface |
| `/sign-in` | User login |
| `/sign-up` | User registration |
| `/pricing` | Pricing/payment plans |
| `/history` | Generation history (localStorage, 7-day retention) |
| `/success` | Payment success callback |
| `/admin` | Admin dashboard (usage stats) |

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/generate` | POST | Generate drama script |
| `/api/user/paid` | GET | Check user payment status |
| `/api/user/session` | GET | Get current user session |
| `/api/checkout` | POST | Create payment checkout session |
| `/api/auth/signin` | POST | Email/password login |
| `/api/auth/signup` | POST | Email/password registration |
| `/api/auth/logout` | POST | Sign out |
| `/api/auth/signin` | POST | Email/password login |
| `/api/auth/callback` | GET | OAuth callback (Google) |
| `/api/webhooks/creem` | POST | Payment webhook |

## Export

Results can be downloaded as **Markdown (.md)** — includes full script content with scenes, dialogue, character details, and generation parameters. See `DramaGenerator.tsx` → `formatScriptAsMarkdown()`.

## Shared Types

See `shared/types/index.ts` for complete type definitions:
- `DramaGenre` — genre keys (ceo, time_travel, sweet_romance, etc.)
- `EpisodeCount` — now `number` (1–200)
- `GenerationRequest` / `GenerationResponse` — API contract
- `Character`, `EpisodeOutline`, `Scene`, `CharacterArc` — content models
- `HistoryItem` — localStorage history entry

## Shared Constants

See `shared/constants/index.ts` for genre lists, generation types, character archetypes.
