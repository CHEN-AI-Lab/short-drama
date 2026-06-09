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
5. Frontend displays results with interactive editing

## Routes

| Path | Purpose |
|------|---------|
| `/` | Home page — drama generation interface |
| `/sign-in` | User login |
| `/sign-up` | User registration |
| `/pricing` | Pricing/payment plans |
| `/success` | Payment success callback |
| `/admin` | Admin dashboard (usage stats) |

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/generate` | POST | Generate drama script |
| `/api/user/paid` | GET | Check user payment status |
| `/api/checkout` | POST | Create payment checkout session |
| `/api/auth/callback` | GET | OAuth callback |
| `/api/webhooks/creem` | POST | Payment webhook |

## Shared Types

See `shared/types/index.ts` for complete type definitions.

## Shared Constants

See `shared/constants/index.ts` for genre lists, episode counts, character archetypes.
