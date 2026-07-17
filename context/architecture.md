# architecture.md

## Tech Stack

| Layer                    | Choice                                                                                                                                                                        |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend framework        | NestJS (TypeScript-native, DI, guards, gateways)                                                                                                                              |
| Frontend framework       | Next.js 14+ App Router                                                                                                                                                        |
| Repo strategy            | pnpm monorepo, `packages/shared` for DTOs/enums/socket event contracts                                                                                                        |
| Auth                     | Clerk (identity + session) — NestJS verifies Clerk-issued JWTs; Next.js uses `@clerk/nextjs` middleware                                                                       |
| Realtime                 | Socket.io (NestJS `@WebSocketGateway`, socket.io-client on the frontend)                                                                                                      |
| ORM                      | TypeORM + Repository pattern, PostgreSQL                                                                                                                                      |
| Presence/ephemeral state | Redis (`ioredis`) — online status, active socket ids, typing TTL keys                                                                                                         |
| Server state (frontend)  | TanStack Query — chat history, infinite pagination, optimistic sends, cache invalidation                                                                                      |
| Client state (frontend)  | React Context API — live socket instance, active room id(s), theme/accent                                                                                                     |
| Media                    | Multer (multipart upload handling, memory storage) → **ImageKit** (storage + CDN + on-the-fly image transformation/optimization via URL params — no separate resize pipeline) |
| Push                     | Firebase Cloud Messaging — background-only notifications                                                                                                                      |
| Search                   | PostgreSQL full-text search (`tsvector` generated column + `tsquery`)                                                                                                         |

## Project Folder Structure

```
/
├── apps/
│   ├── web/                                    # Next.js frontend
│   └── api/                                    # NestJS backend
├── packages/
│   └── shared/
│       ├── src/
│       │   ├── dtos/
│       │   │   ├── user.dto.ts
│       │   │   ├── conversation.dto.ts
│       │   │   ├── message.dto.ts
│       │   │   ├── reaction.dto.ts
│       │   │   ├── receipt.dto.ts
│       │   │   └── auth.dto.ts
│       │   ├── events/                         # Socket.io event contracts (both sides import these)
│       │   │   ├── socket-events.enum.ts        # 'message:new', 'message:ack', 'typing:start', ...
│       │   │   ├── typing.event.ts
│       │   │   ├── presence.event.ts
│       │   │   └── receipt.event.ts
│       │   ├── enums/
│       │   │   ├── user-role.enum.ts
│       │   │   └── message-media-type.enum.ts
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

### Backend (`apps/api/src/`)

```
modules/
├── auth/                     # Clerk JWT verification, guards, @CurrentUser decorator
│   ├── guards/clerk-auth.guard.ts
│   ├── strategies/clerk.strategy.ts
│   └── auth.module.ts
├── users/                    # profile CRUD (mirrors reference plan's users module)
├── conversations/
│   ├── controllers/conversations.controller.ts   # REST: create/list conversations, membership
│   ├── services/conversations.service.ts
│   ├── repositories/conversations.repository.ts
│   ├── entities/{conversation,conversation-member}.entity.ts
│   └── conversations.module.ts
├── messages/
│   ├── controllers/messages.controller.ts        # REST: paginated history, search
│   ├── services/messages.service.ts
│   ├── repositories/messages.repository.ts
│   ├── entities/{message,message-receipt,message-reaction}.entity.ts
│   └── messages.module.ts
├── realtime/                                      # everything socket.io
│   ├── gateways/chat.gateway.ts                    # message:new, message:edit, message:delete, reaction:add
│   ├── gateways/presence.gateway.ts                # connect/disconnect, ping/pong, typing:start/stop
│   ├── services/socket-registry.service.ts         # wraps Redis presence reads/writes
│   └── realtime.module.ts
├── presence/
│   ├── redis/redis.module.ts                       # ioredis client provider
│   ├── services/presence.service.ts                # setOnline/setOffline/getStatus/heartbeat TTL
│   └── presence.module.ts
├── media/
│   ├── controllers/media.controller.ts             # Multer upload endpoint(s), memory storage
│   ├── services/media.service.ts                    # streams buffer to ImageKit, returns base url + fileId
│   └── media.module.ts
├── notifications/
│   ├── services/fcm.service.ts
│   └── notifications.module.ts
└── search/
    ├── controllers/search.controller.ts
    ├── services/search.service.ts                   # tsquery builder
    └── search.module.ts
shared/                       # cross-module: filters, interceptors, decorators, guards, types
database/                     # migrations, seeds
config/
app.module.ts
main.ts
```

### Frontend (`apps/web/src/`)

```
app/
├── (auth)/{login,register}/page.tsx
├── (protected)/
│   ├── layout.tsx                          # AuthGuard (Clerk) wrapper
│   ├── (chat)/
│   │   ├── layout.tsx                      # mounts SocketProvider (see below)
│   │   ├── page.tsx                        # empty state / no conversation selected
│   │   └── chat/[conversationId]/page.tsx
│   └── account/
│       ├── layout.tsx
│       ├── profile/page.tsx
│       ├── notifications/page.tsx
│       ├── appearance/page.tsx
│       └── privacy/page.tsx
└── layout.tsx                              # root layout + AppProviders

features/
├── auth/                     # Clerk wrapper components, useCurrentUser hook
├── conversations/
│   ├── ui/{ConversationList,ConversationListItem,ConversationHeader}.tsx
│   ├── services/conversation.service.ts
│   ├── hooks/{conversationKeys,useConversations,useConversation,useCreateConversation}.ts
│   └── dtos/create-conversation-request.dto.ts
├── messages/
│   ├── ui/{MessageList,MessageBubble,MessageComposer,ReplyPreview,ReactionBar}.tsx
│   ├── services/message.service.ts
│   ├── hooks/
│   │   ├── messageKeys.ts
│   │   ├── useMessages.ts                  # useInfiniteQuery
│   │   ├── useSendMessage.ts               # optimistic mutation
│   │   ├── useEditMessage.ts
│   │   ├── useDeleteMessage.ts
│   │   └── useReactToMessage.ts
│   └── dtos/{send-message-request,edit-message-request}.dto.ts
├── presence/
│   ├── ui/{PresenceDot,TypingIndicator}.tsx
│   ├── context/SocketContext.tsx           # CLIENT state: live socket instance + active room id(s)
│   └── hooks/{useSocket,useTypingEmitter,usePresence}.ts
├── receipts/
│   ├── ui/ReadReceiptIcon.tsx
│   └── hooks/useMarkAsRead.ts              # wraps IntersectionObserver + socket emit, debounced
├── media/
│   ├── ui/{ImageAttachment,FileAttachment,VoiceNoteBubble}.tsx
│   └── hooks/useUploadMedia.ts             # useMutation → Multer endpoint
├── search/
│   └── ui/SearchPanel.tsx + hooks/useSearchMessages.ts
└── settings/
    ├── ui/{ProfileForm,NotificationsPanel,AppearancePanel,PrivacyPanel}.tsx
    └── hooks/ (TanStack Query — profile is server state, theme is not)

shared/
├── context/
│   ├── AppProviders.tsx
│   └── ThemeContext.tsx                    # CLIENT state: dark/dim/light + accent color
├── ui/components/                          # DataTable-equivalents: EmptyState, LoadingSpinner, ToggleSwitch
└── lib/{api-client.ts,socket-client.ts}
```

## System Boundaries

- `apps/web` never imports anything from `apps/api` and vice versa; the only shared code is `packages/shared`.
- `features/realtime` types (socket event payloads) live in `packages/shared/src/events`, not duplicated per app — a typing payload shape defined only on the frontend _will_ drift from the gateway's emitted shape.
- Redis is **only** reachable from `apps/api` (`modules/presence`, `modules/realtime`). The frontend never talks to Redis directly, even for reads — presence goes through the socket or a thin REST endpoint that itself reads Redis.
- Media files are never stored as bytes in Postgres. `media.controller.ts` is the only place `Multer` is wired.

## Data Flow & Database Schema

### Canonical schema (as provided) — kept as-is, source of truth for these tables:

```dbml
Table users {
  id uuid [pk, default: `uuid_generate_v4()`]
  clerk_id varchar [unique, not null]
  username varchar [unique, not null]
  avatar_url varchar
  created_at timestamp [default: `now()`]
}

Table conversations {
  id uuid [pk, default: `uuid_generate_v4()`]
  is_group boolean [default: false]
  group_name varchar [null]
  created_at timestamp [default: `now()`]
}

Table conversation_members {
  id uuid [pk, default: `uuid_generate_v4()`]
  conversation_id uuid [not null]
  user_id uuid [not null]
  role varchar [default: 'member']
  joined_at timestamp [default: `now()`]
  indexes { (conversation_id, user_id) [unique] }
}

Table messages {
  id uuid [pk, default: `uuid_generate_v4()`]
  conversation_id uuid [not null]
  sender_id uuid [not null]
  parent_id uuid [null]
  content text [null]
  media_url varchar [null]
  media_type varchar [null]
  is_deleted boolean [default: false]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}

Table message_receipts {
  id uuid [pk, default: `uuid_generate_v4()`]
  message_id uuid [not null]
  user_id uuid [not null]
  status varchar [default: 'delivered']
  read_at timestamp [null]
  indexes { (message_id, user_id) [unique] }
}

Table message_reactions {
  id uuid [pk, default: `uuid_generate_v4()`]
  message_id uuid [not null]
  user_id uuid [not null]
  emoji varchar [not null]
  created_at timestamp [default: `now()`]
  indexes { (message_id, user_id, emoji) [unique] }
}
```

### ⚠️ Schema Gaps — additions required before Phases 8/9/10/11 can actually be built

The provided schema covers 1–4, 7 (partially), and 10 (partially). It does **not** support: multiple attachments per message, push notification targeting, mute state, edit history, or full-text search. These aren't nice-to-haves — features 8, 9, 10, and 11 are unbuildable against the schema as given. Add:

```dbml
// -- Extends `messages`: search + edit tracking --
// ALTER TABLE messages ADD COLUMN search_vector tsvector
//   GENERATED ALWAYS AS (to_tsvector('english', coalesce(content, ''))) STORED;
// CREATE INDEX messages_search_idx ON messages USING GIN (search_vector);
// ALTER TABLE messages ADD COLUMN edited_at timestamp NULL;

// -- Extends `conversation_members`: mute (shown in the prototype's right-panel "MUTE NOTIFICATIONS") --
// ALTER TABLE conversation_members ADD COLUMN muted_until timestamp NULL;

    // -- New: multiple attachments per message (v1 schema allows exactly one media_url/media_type pair) --
    // -- Phase 8 built this. `messages.media_url`/`media_type` columns are DEPRECATED --
    // -- new messages use `message_attachments` only. The old columns remain for backward compat only. --
    Table message_attachments {
      id uuid [pk, default: `uuid_generate_v4()`]
      message_id uuid [not null]
      media_url varchar [not null]
      media_type varchar [not null, note: 'image, video, audio, document']
      thumbnail_url varchar [null]
      file_size_bytes int [null]
      created_at timestamp [default: `now()`]
    }
    Ref: message_attachments.message_id > messages.id [delete: cascade]

    // -- Index for efficient querying of shared media per conversation --
    // CREATE INDEX IDX_message_attachments_message ON message_attachments (message_id);

    // -- Media upload endpoint: POST /media/upload (Multer memoryStorage → ImageKit) --
    // -- returns { url, fileId, mediaType } -- message referencing it is emitted AFTER upload resolves --

// -- New: FCM device targeting (feature 9 is unbuildable without this) --
Table device_tokens {
  id uuid [pk, default: `uuid_generate_v4()`]
  user_id uuid [not null]
  fcm_token varchar [unique, not null]
  platform varchar [not null, note: 'web, ios, android']
  last_active_at timestamp [default: `now()`]
}
Ref: device_tokens.user_id > users.id [delete: cascade]

// -- Extends `users`: privacy prefs + blocked contacts (Image 5 shows both; the given schema has neither) --
// ALTER TABLE users ADD COLUMN read_receipts_enabled boolean DEFAULT true;
// ALTER TABLE users ADD COLUMN show_last_seen boolean DEFAULT true;
// ALTER TABLE users ADD COLUMN allow_group_invites_from_anyone boolean DEFAULT false;
Table blocked_contacts {
  id uuid [pk, default: `uuid_generate_v4()`]
  blocker_id uuid [not null]
  blocked_id uuid [not null]
  created_at timestamp [default: `now()`]
  indexes { (blocker_id, blocked_id) [unique] }
}
Ref: blocked_contacts.blocker_id > users.id [delete: cascade]
Ref: blocked_contacts.blocked_id > users.id [delete: cascade]
```

`read_receipts_enabled` isn't cosmetic — if false, the receipts flow in Phase 7 must skip writing `message_receipts.status = 'read'` for that user entirely, not just hide the tick client-side, or you're lying to the UI about a privacy toggle that does nothing server-side.

`messages.media_url`/`media_type` are **deprecated** since Phase 8 — all new attachments go into `message_attachments`. The old columns remain nullable for backward compatibility with messages created before Phase 8. Do not write new code that populates them.

### Server State Flow (mirrors the reference TanStack Query pattern exactly)

```
UI (MessageList) → useMessages() [useInfiniteQuery, cache key: messageKeys.list(conversationId)]
  → cache HIT+fresh → render from cache
  → cache MISS/stale → message.service.ts → GET /conversations/:id/messages?cursor=...
  → HTTP boundary → MessagesController → MessagesService → MessagesRepository (TypeORM) → Postgres
  → MessagesService.toDto() maps Entity[] → MessageDto[]  (never leak `sender.passwordHash`-equivalent fields)
  → response cached under messageKeys.list(conversationId), UI re-renders
```

### Realtime Flow (Socket.io — not TanStack Query, not REST)

```
Sender: useSendMessage() optimistic mutation
  → queryClient.setQueryData appends optimistic MessageDto (status: 'sending') to the infinite cache
  → socket.emit('message:new', payload)
  → ChatGateway.handleMessage() → MessagesService.create() → Postgres insert
  → gateway emits 'message:ack' to sender (reconcile optimistic id → real id)
  → gateway broadcasts 'message:new' to conversation room (io.to(conversationId))
  → all other members' SocketContext listener → queryClient.setQueryData appends to their cache
```

### Presence Flow (Redis — never Postgres)

```
socket connect → PresenceGateway verifies JWT → PresenceService.setOnline(userId)
               → Redis SET user:{id}:status online, EX heartbeatTTL (60s)
               → Redis SET user:{id}:lastSeen <ISO timestamp>
               → global broadcast presence:update { userId, status: "online" }

client sends "ping" every 30s → PresenceGateway.handlePing → refresh TTL → emit "pong"

socket disconnect → PresenceService.setOffline(userId)
                  → Redis SET user:{id}:status offline
                  → Redis SET user:{id}:lastSeen <ISO timestamp>
                  → global broadcast presence:update { userId, status: "offline", lastSeen }
```

Application-level ping/pong refreshes the Redis TTL so stale connections expire (60s TTL, 30s heartbeat interval). This catches browser tab crashes and network drops where the disconnect event doesn't fire cleanly. Single-device per user (no multi-tab socket tracking in this version).

## Authentication & Core Patterns

- **Frontend:** `@clerk/nextjs` middleware protects the `(protected)` route group. `useCurrentUser()` wraps Clerk's `useUser()` — features never call Clerk hooks directly, they call this wrapper (so swapping identity providers later touches one file).
- **Backend REST:** `ClerkAuthGuard` (global, `@Public()` decorator to opt out) verifies the Clerk session JWT on every request, attaches `req.user` via `@CurrentUser()`.
- **Backend Socket.io:** the JWT is verified in the gateway's `handleConnection` (not per-event) — reject the handshake if invalid, store `userId` on the socket instance, never trust a `userId` field sent in an event payload.
- **First-party user record:** `users.clerk_id` is the join key. On first authenticated request/connection, upsert a local `users` row from the Clerk profile. The `ClerkAuthGuard` auto-creates the user on first access (fetches from Clerk API) — this covers the race window between sign-up and webhook delivery. The webhook (`user.created`) provides eventual consistency but is not the sole creation path.

## Invariants — never violate these

1. **A task is `[UI]` xor `[LOGIC]`, never both.** (see `AGENTS.md` §0 and `build-plan.md`.)
2. Server state → TanStack Query. Client-only state (socket instance, active room id, theme) → Context. Never store a `MessageDto[]` in a Context provider; never use `useState` in a component to hold fetched messages "just for this render."
3. Redis is the only source of truth for **presence/typing**. Postgres is the only source of truth for **persisted messages/receipts/reactions**. Never derive online status from "last message timestamp" — that's a different, slower, wrong signal.
4. Socket.io room name == `conversation_id` (uuid), always. No ad hoc room naming.
5. Every socket event payload type is defined once in `packages/shared/src/events` and imported by both apps.
6. TypeORM entities never serialize past the service layer — `toDto()` is mandatory, same as the reference plan's Hard Rule 10.
7. Media upload (Multer) always completes and returns a URL **before** the message referencing it is emitted over the socket — never emit a message pointing at an in-flight upload. Attachments are stored in `message_attachments`; `messages.media_url`/`media_type` are deprecated since Phase 8.
8. Any schema change required by a feature gets written into this file's DBML block in the same session, not left implicit in a migration file only.
9. Push notifications (FCM) are suppressed if the recipient has an active socket connection in that conversation's room — check room membership via `server.in(conversationId).fetchSockets()` before sending, or you'll double-notify. PresenceService (Redis) alone is insufficient — a user can be online but in a different conversation.
10. Device tokens are stored in the `device_tokens` table, keyed by unique `fcm_token`. The FcmService wraps firebase-admin v14 modular API (`firebase-admin/app` and `firebase-admin/messaging`). Invalid tokens detected during send (invalid/not-registered) are automatically removed from the table.
