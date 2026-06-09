# Short Drama — AI 短剧脚本生成器

> An AI-powered short drama script generator. Input your drama genre/elements, get complete episode outlines, scene breakdowns, character arcs, and full scripts.

## Features

- 🎭 **Genre-based generation**: 霸总, 穿越, 甜宠, 仙侠, 悬疑, and more
- 📺 **Episode planning**: 20-100 episode outlines with synopsis per episode
- 👥 **Character management**: Character profiles, relationships, and arcs
- 🎬 **Scene breakdown**: Scene-by-scene breakdown with dialogue suggestions
- 🌐 **Bilingual**: Full zh-CN + en support
- 🔐 **User auth**: Email/password + Google login via Supabase
- 🌙 **Dark mode**: Light/dark theme toggle

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase and SenseTime credentials

# 3. Start dev server
pnpm dev

# 4. Open http://localhost:3000
```

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server (port 3000) |
| `pnpm build` | Production build |
| `pnpm test` | Run unit tests |
| `pnpm lint` | Lint check |
| `pnpm typecheck` | TypeScript check |
| `pnpm check` | Full quality gate (typecheck + lint + test + build) |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SENSENOVA_ACCESS_KEY` | ✅ | SenseTime API access key |
| `SENSENOVA_SECRET_KEY` | ✅ | SenseTime API secret key |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon/public key |

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS 4 + dark mode
- **i18n**: next-intl v4 (zh-CN + en)
- **AI**: SenseTime (sensenova-6.7-flash-lite)
- **Auth**: Supabase (email/password + Google OAuth)
- **Testing**: Vitest + Playwright
- **Deploy**: Vercel

## Project Structure

```
short-drama/
├── shared/              # Cross-platform: types, constants, utils, api
├── apps/web/            # Next.js web app
├── packages/ui/         # Shared UI components
├── tests/               # Unit + E2E tests
├── scripts/             # Setup/check/deploy
├── docs/                # Architecture, progress, decisions
└── .github/workflows/   # CI/CD
```

## Deploy

```bash
# Push to GitHub, Vercel auto-deploys main branch
git push origin main
```

Or connect the repo in Vercel dashboard.

## License

MIT
