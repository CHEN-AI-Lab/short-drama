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

**Decision**: Use SenseTime for all AI generation. No fallback provider needed.

**Consequence**: Single-provider dependency. If SenseTime API changes or goes down, generation stops.

---

## ADR-004: Supabase Auth (email + Google)

**Context**: User system is required. Supabase provides free-tier auth with multiple providers.

**Decision**: Use Supabase Auth with email/password + Google OAuth. `@supabase/ssr` handles cookie-based session management with Next.js.

**Consequence**: Users need Supabase project. Free tier is sufficient for MVP.

---

## ADR-005: No database for MVP

**Context**: V0 only needs text generation via API. User session and payment status can be tracked via Supabase Auth + localStorage cache.

**Decision**: Skip Prisma/SQLite for MVP. Payment status stored in Supabase user metadata (via custom claims or `user_metadata`).

**Consequence**: MVP launches faster. Database can be added later when user history/persistence is needed.
