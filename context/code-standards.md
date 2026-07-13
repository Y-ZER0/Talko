# code-standards.md

## Naming Conventions

| Artifact                                       | Convention                    | Example                                         |
| ---------------------------------------------- | ----------------------------- | ----------------------------------------------- |
| Feature folder                                 | `kebab-case`                  | `conversations/`, `read-receipts/`              |
| Frontend request DTO (interface)               | `PascalCase` + `RequestDto`   | `SendMessageRequestDto`                         |
| Backend request DTO (class, `class-validator`) | `PascalCase` + `RequestDto`   | `SendMessageRequestDto`                         |
| Shared response interface                      | `PascalCase` + `Dto`          | `MessageDto`, `ConversationDto`                 |
| Socket event name (string literal)             | `domain:action`               | `message:new`, `typing:start`, `receipt:update` |
| Socket event payload type                      | `PascalCase` + `EventPayload` | `TypingEventPayload`                            |
| Frontend service                               | `camelCase` const object      | `messageService`                                |
| Backend service class                          | `PascalCase` + `Service`      | `MessagesService`, `PresenceService`            |
| Gateway class                                  | `PascalCase` + `Gateway`      | `ChatGateway`, `PresenceGateway`                |
| Query key factory                              | `camelCase` + `Keys`          | `messageKeys`, `conversationKeys`               |
| Query hook (fetch)                             | `use` + `PascalCase`          | `useMessages`, `useConversation`                |
| Mutation hook                                  | `use` + verb + `PascalCase`   | `useSendMessage`, `useEditMessage`              |
| Context file                                   | `PascalCase` + `Context.tsx`  | `SocketContext.tsx`, `ThemeContext.tsx`         |
| Provider component                             | `PascalCase` + `Provider`     | `SocketProvider`, `ThemeProvider`               |
| Context consumer hook                          | `use` + `PascalCase`          | `useSocket`, `useTheme`                         |
| UI component                                   | `PascalCase`                  | `MessageBubble`, `TypingIndicator`              |
| TypeORM entity                                 | `PascalCase` singular         | `Message`, `ConversationMember`                 |
| Repository class                               | `PascalCase` + `Repository`   | `MessagesRepository`                            |
| Controller class                               | `PascalCase` + `Controller`   | `MessagesController`                            |
| NestJS module                                  | `PascalCase` + `Module`       | `MessagesModule`, `RealtimeModule`              |
| Guard                                          | `PascalCase` + `Guard`        | `ClerkAuthGuard`                                |
| Redis key                                      | `domain:id:field`             | `user:{id}:status`, `conv:{id}:typing:{userId}` |
| Enum values                                    | `SCREAMING_SNAKE_CASE`        | `MessageMediaType.IMAGE`                        |

## Structure & Imports

Frontend layer rules (identical contract to the reference architecture plan, extended for realtime):

| Layer                             | Responsibility                                                | Can import                                     | Cannot import                     |
| --------------------------------- | ------------------------------------------------------------- | ---------------------------------------------- | --------------------------------- |
| `page.tsx`                        | Route composition, metadata                                   | Feature `ui/`, `shared/ui/`                    | hooks, services, context directly |
| Feature `ui/`                     | Pure render components                                        | Feature `hooks/`, `shared/ui/`, `@repo/shared` | services, context directly        |
| Feature `hooks/` (query/mutation) | TanStack Query — server state                                 | Feature `services/`, `dtos/`, `@repo/shared`   | Context, UI components            |
| Feature `hooks/` (socket)         | Subscribes to `useSocket()`, pushes into TanStack Query cache | `SocketContext`, TanStack `queryClient`        | UI components directly            |
| Feature `services/`               | HTTP calls only                                               | `shared/lib/api-client`, `@repo/shared`        | Context, UI, hooks                |
| `SocketContext` / `ThemeContext`  | UI/connection state only                                      | React only                                     | Services, query hooks, HTTP       |

Import alias: `@/*` → `apps/web/src`, `@repo/shared` → `packages/shared/src`. Never deep-import (`@repo/shared/src/dtos/message.dto` is banned — import from the package root barrel).

Backend layer rules — identical to the reference plan's Part 5.2, plus:

| Layer        | Responsibility           | Rules                                                                                                                         |
| ------------ | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `gateway`    | Socket.io event handlers | No business logic inline — delegate to the matching module's service immediately, same as a controller does for REST          |
| `service`    | Business logic           | Never imports `socket.io` types directly — a service must be callable identically from a REST controller or a gateway handler |
| `repository` | DB access                | Raw TypeORM only, returns entities                                                                                            |

## Environment & Dependencies

Package manager: **pnpm** everywhere. Dependency additions always go through the workspace-scoped install (`pnpm add <pkg> --filter api` / `--filter web`), never root unless it's a genuine dev-tool shared by all workspaces (eslint, typescript, turbo).

Required environment variables (`.env` per app, never committed):

```
# apps/api
DATABASE_URL=postgres://...
REDIS_URL=redis://...
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
FCM_PROJECT_ID=
FCM_CLIENT_EMAIL=
FCM_PRIVATE_KEY=
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=
PORT=3001

# apps/web
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

Never read `process.env` directly inside a service/component — go through the existing `config/` module (backend) or a typed `env.ts` (frontend), so a missing var fails fast at boot, not at request time.

## Backend & Logic

- **Error handling:** global `AllExceptionsFilter` (per reference plan) — services throw `NotFoundException`/`ConflictException`/etc., never raw `Error`. Gateway handlers catch and emit a typed `error` event back to the specific socket — never let an unhandled exception kill the socket connection.
- **API route handlers:** controllers extract → call service → return `ApiResponse<T>`. No `try/catch` in controllers; the global filter handles it.
- **Backend architecture guideline specific to this project:** any logic that must run identically whether triggered via REST or via socket (e.g., "create a message") lives in exactly one service method. The gateway and the controller are both thin callers of `MessagesService.create()` — never duplicate the persistence logic in the gateway.
- **Idempotency:** `message:new` payloads include a client-generated `clientId` (uuid). `MessagesService.create()` is idempotent on `(conversation_id, sender_id, clientId)` for a short window — protects against double-send on reconnect/retry.
- **N+1 guard:** conversation list / message list queries must eager-load via TypeORM relations or a single joined query — never loop-query per-row for sender profile or receipt status.

## Hard Rules (violating these is a REVIEW-blocking defect)

1. A build-plan task is `[UI]` xor `[LOGIC]` — never both (see `AGENTS.md`).
2. Server state → TanStack Query. Client-only state → Context. No exceptions, no "just this once" for socket data.
3. No direct API/socket calls from UI components — always through the service/hook layer.
4. Always use the query key factory (`messageKeys`, `conversationKeys`) — never inline arrays in `useQuery`/`useInfiniteQuery`.
5. Every mutation calls `invalidateQueries` (or a targeted `setQueryData` for the specific optimistic-update cases already named in `build-plan.md` Phase 4).
6. `TypeORM` entities never leave the backend — `toDto()` is mandatory on every service method returning data.
7. Backend request DTOs are classes with `class-validator` decorators; frontend request DTOs are plain interfaces.
8. `ValidationPipe` global options: `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`.
9. Socket event payload shapes are defined once in `packages/shared/src/events` — a gateway or a frontend listener written against an inline/ad hoc shape is a defect.
10. Redis is presence/typing only. Postgres is messages/receipts/reactions/attachments only. Never let one leak into the other's job.
11. Features do not import from other features — cross-feature communication goes through `shared/` or `@repo/shared`.
12. A "complete" feature slice includes its schema migration, service, DTOs, hooks, and UI — partial slices are technical debt, not progress (do not mark `progress-tracker.md` complete for a partial slice).
