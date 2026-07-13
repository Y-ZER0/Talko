# progress-tracker.md

Mirrors `build-plan.md` exactly. Check an item **only** when the code exists, compiles, and (for `[LOGIC]`) has passed REVIEW or (for `[UI]`) has passed IMPRINT. Update this file in the same session the work happens — per `AGENTS.md` REMEMBER step.

## Phase 0 — Foundations
- [x] `[LOGIC]` Monorepo scaffold (apps/web, apps/api, packages/shared)
- [x] `[LOGIC]` Postgres + TypeORM connection, initial migration (canonical tables)
- [x] `[LOGIC]` Redis connection
- [x] `[LOGIC]` CI: lint + type-check

## Phase 1 — Auth & Profiles (Feature 2)
- [ ] `[LOGIC]` Clerk backend: guard, decorator, users module, webhook sync
- [ ] `[LOGIC]` Clerk frontend: middleware, useCurrentUser, auth.service.ts
- [ ] `[UI]` Login/Register pages + AuthGuard states
- [ ] `[UI]` Account/Profile page

## Phase 2 — Conversations & Membership (Feature 3)
- [ ] `[LOGIC]` conversations + conversation_members module
- [ ] `[UI]` Conversation list sidebar + new-conversation flow

## Phase 3 — Message Persistence (Feature 4)
- [ ] `[LOGIC]` messages module, cursor pagination, toDto

## Phase 4 — Real-Time Messaging (Feature 1)
- [ ] `[LOGIC]` ChatGateway (connect/join/message:new/ack/broadcast)
- [ ] `[LOGIC]` socket-client.ts + SocketContext + useSocket
- [ ] `[UI]` MessageList/MessageBubble/Composer + optimistic send

## Phase 5 — Presence (Feature 5)
- [ ] `[LOGIC]` PresenceService (Redis) + ping/pong + presence:update
- [ ] `[UI]` PresenceDot + "last seen" header text

## Phase 6 — Typing Indicators (Feature 6)
- [ ] `[LOGIC]` typing:start/stop socket events
- [ ] `[UI]` Debounced emitter + TypingIndicator component

## Phase 7 — Read Receipts (Feature 7)
- [ ] `[LOGIC]` receipt:read event, respects read_receipts_enabled, broadcast
- [ ] `[UI]` useMarkAsRead (Intersection Observer) + ReadReceiptIcon

## Phase 8 — Multimedia (Feature 8)
- [ ] `[LOGIC]` message_attachments migration + MediaController + thumbnailing
- [ ] `[UI]` Attach button, Image/File/VoiceNote components, shared-media grid

## Phase 9 — Push Notifications (Feature 9)
- [ ] `[LOGIC]` device_tokens migration + FCM service + suppress-if-online rule
- [ ] `[UI]` Permission prompt + Notifications settings panel

## Phase 10 — Message Interactions (Feature 10)
- [ ] `[LOGIC]` Reply/Edit(+migration)/Delete/React — REST + socket broadcast each
- [ ] `[UI]` ReplyPreview, inline edit, delete confirm, ReactionBar

## Phase 11 — Search & Filtering (Feature 11)
- [ ] `[LOGIC]` search_vector migration + SearchService + endpoint
- [ ] `[UI]` Search panel + wire All/Unread/Groups tabs to real state

## Phase 12 — Appearance & Privacy
- [ ] `[LOGIC]` Privacy prefs migration + blocked_contacts + endpoints
- [ ] `[UI]` AppearancePanel (ThemeContext-driven) + PrivacyPanel

---

## Session Log (append-only, newest at top)
| Date | Phase(s) touched | Notes / decisions made |
|---|---|---|
| 2026-07-13 | Phase 0 | Scaffolded full monorepo: pnpm workspaces, NestJS api, Next.js web, shared package. Installed all deps. Created initial DB migration for canonical schema. Redis module added (ioredis). Typecheck passes across all 3 workspaces. |
