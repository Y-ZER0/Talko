# build-plan.md

Sequential build phases. Every phase is decomposed into tasks tagged **[LOGIC]** or **[UI]** — never both in one task, per `AGENTS.md` §0. Within a phase, LOGIC tasks always come before the UI task(s) that depend on them. `progress-tracker.md` mirrors this exact structure — check items off there, not here.

A note on the tag boundary: a frontend file can be `.tsx` and still be `[LOGIC]` if it renders no visual output of its own (e.g. a Context provider that only supplies a socket instance to `children`). The test is "does this task produce something a user looks at," not "which file extension." If yes → `[UI]`. If it's wiring/state/data → `[LOGIC]`, regardless of which app it's in.

---

## Phase 0 — Foundations `[LOGIC]`

- Scaffold pnpm monorepo (`apps/web`, `apps/api`, `packages/shared`) per `architecture.md`
- Postgres + TypeORM connection, Redis (`ioredis`) connection, run initial migration for the **canonical** schema tables (users, conversations, conversation_members, messages, message_receipts, message_reactions)
- `packages/shared` skeleton: enums, empty dto/event barrels
- CI: lint + type-check across workspaces

## Phase 1 — Feature 2: Authentication & Profiles

1. `[LOGIC]` NestJS: Clerk JWT verification (`ClerkAuthGuard`, `@Public()` decorator, `@CurrentUser()`), `users` module (entity/service/repo/controller), Clerk `user.created` webhook → upsert local `users` row
2. `[LOGIC]` Next.js: `@clerk/nextjs` middleware over `(protected)` route group, `useCurrentUser()` wrapper hook, `auth.service.ts`
3. `[UI]` Login/Register pages (Clerk components), `AuthGuard` redirect states
4. `[UI]` Account/Profile page — cover image, avatar, display name, username, email, location, website, about (`ui-registry.md` → `ProfileHeader`, `PersonalDetailsForm`) — matches uploaded Image 2

## Phase 2 — Feature 3: 1-on-1 & Group Chats (data + rooms membership)

1. `[LOGIC]` `conversations` + `conversation_members` entities/module: create conversation (deterministic 1-on-1 lookup vs new group), add/remove member, list-my-conversations REST endpoint
2. `[UI]` Conversation list sidebar — search, All/Unread/Groups tabs, list item (avatar, name, timestamp, unread badge, presence dot), "new conversation" flow — matches Image 1 left column

## Phase 3 — Feature 4: Message Persistence (REST layer, no realtime yet)

1. `[LOGIC]` `messages` entity/module: cursor-paginated `GET /conversations/:id/messages`, `POST /conversations/:id/messages` (REST fallback/initial send path), `toDto()` mapping, `message_receipts`/`message_reactions` entities scaffolded (unused until Phases 7/10)

## Phase 4 — Feature 1: Real-Time Bi-Directional Messaging

1. `[LOGIC]` `ChatGateway` (`@WebSocketGateway`): handshake JWT verification, room join = `conversation_id`, `message:new` handler → `MessagesService.create()` → broadcast + ack; socket event contracts defined once in `packages/shared/src/events`
2. `[LOGIC]` Frontend: `socket-client.ts` (singleton socket.io-client instance), `SocketContext` (Context API — holds the live socket instance + set of active/joined room ids, per the project's explicit Context API scope), `useSocket()` hook
3. `[UI]` Message timeline (`MessageList`, `MessageBubble` sent/received styles), `MessageComposer`, `useSendMessage()` optimistic mutation wired to both the REST create (Phase 3) and the live socket broadcast — matches Image 1 center pane

## Phase 5 — Feature 5: Connection & Presence State

1. `[LOGIC]` Redis-backed `PresenceService` (`setOnline`/`setOffline`/`getStatus`), ping/pong heartbeat in `ChatGateway`, `presence:update` broadcast on status change
2. `[UI]` `PresenceDot` (list item + chat header), header "LAST SEEN Xh AGO" text sourced from presence state — matches Image 1 header/sidebar green dots

## Phase 6 — Feature 6: Typing Indicators

1. `[LOGIC]` `typing:start` / `typing:stop` ephemeral socket events (no DB write); Redis TTL key per (conversation, user) optional for reconnect-safety
2. `[UI]` Composer emits debounced `typing:start`/`stop` (lodash `debounce` or RxJS) on keystroke; `TypingIndicator` renders "X is typing…" in the conversation list row and/or header — matches Image 1 "Elena Rossi · typing..."

## Phase 7 — Feature 7: Read Receipts

1. `[LOGIC]` `receipt:read` socket event (batched, one call per visible batch not per message) → writes `message_receipts.status='read'` **only if** `users.read_receipts_enabled = true` for that user → broadcasts `receipt:update` to the room
2. `[UI]` `useMarkAsRead()` hook wrapping `IntersectionObserver` on the message list (debounced, fires once messages are >50% visible for >500ms), `ReadReceiptIcon` (sent/delivered/read ticks + timestamp) — matches Image 1 "🔥3 ✨1 · READ · 12:40"

## Phase 8 — Feature 8: Multimedia Support

1. `[LOGIC]` Migration: `message_attachments` table (see `architecture.md` schema gaps); `MediaController` (Multer memory storage, size/type validation) → `MediaService` streams to **ImageKit**, returns the base attachment URL(s) — no server-side resize step, thumbnails are ImageKit transformation URLs built at render time (see `library-docs.md`) — before the referencing message is emitted
2. `[UI]` Composer attach button (image/file/voice), `ImageAttachment` card, `FileAttachment` row, `VoiceNoteBubble` (waveform + play/duration), upload progress state, right-panel "Shared Media" grid + "Files" list — matches Image 1 `MIXER_V04.PNG` card, audio waveform bubble, `signal-brand-tokens.pdf` row, and the right-panel media grid/files list

## Phase 9 — Feature 9: Push Notifications

1. `[LOGIC]` Migration: `device_tokens` table; FCM registration endpoint; on message persist, check `PresenceService` — if recipient has **no** active socket in that room, send FCM push; else suppress
2. `[UI]` Browser notification-permission prompt; Notifications settings panel (Direct messages / Sound / Mentions only / Do not disturb toggles) wired to a user-notification-prefs endpoint — matches Image 3

## Phase 10 — Feature 10: Message Interactions (Reply / Edit / Delete / React)

1. `[LOGIC]` Reply: uses existing `messages.parent_id`. Edit: requires `messages.edited_at` (schema gap) + `message:edit` socket event + REST PATCH. Delete: soft-delete via `is_deleted`, `message:delete` broadcast, content nulled server-side (don't just hide it client-side). React: `message_reactions` CRUD + `reaction:add`/`reaction:remove` broadcast
2. `[UI]` `ReplyPreview` (quoted message above composer), inline edit mode on the composer, delete confirmation + "message deleted" placeholder bubble, `ReactionBar`/reaction pill with count — matches Image 1 reaction pills under the mixer message

## Phase 11 — Feature 11: Search & Filtering

1. `[LOGIC]` Migration: `messages.search_vector` generated tsvector column + GIN index (schema gap); `SearchService` builds `tsquery`, scoped to conversations the user is a member of (never search across conversations you're not in); `GET /search?q=`
2. `[UI]` Search panel triggered from the header search icon, results list with conversation + snippet, wire the existing All/Unread/Groups tabs (Phase 2 UI) to real filter state instead of static markup — matches Image 1 top-right search icon

## Phase 12 — Appearance & Privacy Settings

1. `[LOGIC]` Migration: `users.read_receipts_enabled`, `show_last_seen`, `allow_group_invites_from_anyone` (schema gap); `blocked_contacts` table + block/unblock endpoints; `PATCH /users/me/privacy` — **note:** theme/accent are explicitly Context-API client state (never sent to the backend) per the project's stated Context API scope, so there is no "appearance" logic task beyond persisting the choice to `localStorage`-equivalent client storage inside the Context itself
2. `[UI]` `AppearancePanel` (theme cards: Dark/Dim/Light, accent color swatch row, driven entirely by `ThemeContext`) — matches Image 4; `PrivacyPanel` (read receipts/last seen/group-invite toggles wired to Phase 12.1, blocked contacts list with unblock, danger-zone delete-account) — matches Image 5

---

## Explicitly out of this build plan (see `project-overview.md` Scope)

Voice/video call buttons in the chat header render as inert icons in Phase 4's UI task — do not create a Phase for WebRTC. E2EE, disappearing messages, and admin/moderation tooling are not phases; don't let an agent invent them mid-session because "Signal has this."
