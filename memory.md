# Memory — Phase 0 Foundations

Last updated: 2026-07-13

## What was built

- **Root monorepo**: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, `.gitignore`, `.npmrc`
- **`packages/shared`** (`@repo/shared`): DTOs (user, conversation, message, reaction, receipt, auth), Socket event contracts (socket-events.enum, typing, presence, receipt, message), enums (MessageMediaType, UserRole), barrel export
- **`apps/api`** (NestJS 11): All module directories scaffolded per `architecture.md`, `AppModule` with TypeORM + Config + global ValidationPipe, `main.ts` with CORS, `RedisModule` (global ioredis), initial DB migration for all 6 canonical tables (users, conversations, conversation_members, messages, message_receipts, message_reactions) with FKs and cascade deletes
- **`apps/web`** (Next.js 15 App Router): All route groups scaffolded (auth, protected chat, account/*), Clerk middleware, `AppProviders` with `QueryClientProvider`, `api-client.ts` + `socket-client.ts` lib wrappers

## Decisions made

- **tsconfig baseUrl**: Root `tsconfig.base.json` sets `baseUrl: "."` (repo root). Each child tsconfig must explicitly override `baseUrl: "."` (its own directory) for path resolution — otherwise `@/*: ["./src/*"]` resolves relative to the repo root, not the app's root
- **NestJS `@Global()` RedisModule**: Redis client provided globally so any module can inject `"REDIS_CLIENT"` without re-importing
- **Migration-first approach**: Schema changes go into migration files + `architecture.md` DBML block in the same session (per `architecture.md` Invariant 8)

## Problems solved

- **Turbo 2.x `pipeline` → `tasks`**: Turbo v2 renamed `pipeline` to `tasks` in `turbo.json` — fixed after first failed run
- **`@clerk/nextjs` missing**: Not in initial deps — added after typecheck failed on `middleware.ts` import
- **`dotenv` needed for TypeORM CLI**: `data-source.ts` reads `DATABASE_URL` directly via dotenv for migration commands; added as api dependency

## Current state

- Project typechecks green across all 3 workspaces (shared, api, web)
- No database running yet — migrations not executed
- Phase 0 is complete; all 4 checklist items marked in `progress-tracker.md`

## Next session starts with

**Phase 1 — Feature 2: Authentication & Profiles**

1. `[LOGIC]` NestJS: Clerk JWT verification (`ClerkAuthGuard`, `@Public()` decorator, `@CurrentUser()`), `users` module (entity/service/repo/controller), Clerk `user.created` webhook → upsert local `users` row
2. `[LOGIC]` Next.js: `@clerk/nextjs` middleware over `(protected)` route group, `useCurrentUser()` wrapper hook, `auth.service.ts`
3. `[UI]` Login/Register pages (Clerk components), `AuthGuard` redirect states
4. `[UI]` Account/Profile page — ProfileHeader, PersonalDetailsForm

## Open questions

- None currently — Phase 0 completed as planned
