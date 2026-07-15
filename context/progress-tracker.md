# progress-tracker.md

Mirrors `build-plan.md` exactly. Check an item **only** when the code exists, compiles, and (for `[LOGIC]`) has passed REVIEW or (for `[UI]`) has passed IMPRINT. Update this file in the same session the work happens — per `AGENTS.md` REMEMBER step.

## Phase 0 — Foundations
- [x] `[LOGIC]` Monorepo scaffold (apps/web, apps/api, packages/shared)
- [x] `[LOGIC]` Postgres + TypeORM connection, initial migration (canonical tables)
- [x] `[LOGIC]` Redis connection
- [x] `[LOGIC]` CI: lint + type-check

## Phase 1 — Auth & Profiles (Feature 2)
- [x] `[LOGIC]` Clerk backend: guard, decorator, users module, webhook sync
- [x] `[LOGIC]` Clerk frontend: middleware, useCurrentUser, auth.service.ts
- [x] `[UI]` Login/Register pages + AuthGuard states
- [x] `[UI]` Account/Profile page

## Phase 2 — Conversations & Membership (Feature 3)
- [x] `[LOGIC]` conversations + conversation_members module
- [x] `[UI]` Conversation list sidebar + new-conversation flow

## Phase 3 — Message Persistence (Feature 4)
- [x] `[LOGIC]` messages module, cursor pagination, toDto

## Phase 4 — Real-Time Messaging (Feature 1)
- [x] `[LOGIC]` ChatGateway (connect/join/message:new/ack/broadcast)
- [x] `[LOGIC]` socket-client.ts + SocketContext + useSocket
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
| 2026-07-14 | Phase 1.1 | Built auth backend: ClerkAuthGuard (global APP_GUARD, auto-creates user on first access), @Public/@CurrentUser decorators, UsersModule (entity/service/controller/webhook). Updated invariant in architecture.md — guard now auto-creates user (not just webhook). |
| 2026-07-14 | Phase 1.2 | Clerk frontend: middleware protection for (protected) routes (/ /chat /account), ClerkProvider in AppProviders, useCurrentUser() wrapper, auth.service.ts (getCurrentUser/updateProfile), useCurrentUserProfile TanStack Query hook. |
| 2026-07-14 | Phase 1.3 | Login/Register pages with Clerk `<SignIn />`/`<SignUp />` components. Styled with Tailwind + warm off-white background, centered card layout, brand header. |
| 2026-07-14 | Phase 1.4 | Account/Profile page: ProfileHeader (cover banner, avatar, identity block, status), PersonalDetailsForm (display name, username, email, location, website, about with char counter), SettingsTopBar, SettingsNav. All components match UI 2.png prototype. useUpdateProfile hook added. |
| 2026-07-14 | Refactor | Migrated all UI from inline styles to Tailwind CSS v4. Added React Hook Form + Zod for form validation. Created AccountContext to fix handleSave unused issue (lifts save state to layout, child pages register save handlers via context). |
| 2026-07-14 | Phase 2.1 | Built conversations + conversation_members module: Conversation/ConversationMember entities, ConversationsService with deterministic 1-on-1 lookup, group creation, add/remove member (group only), list-my-conversations enriched with lastMessage + member user info. Removed rootDir from api tsconfig to fix shared package import. All typechecks green. |
| 2026-07-14 | Phase 2.2 | Built conversation sidebar UI: ConversationSidebar (header, search, ALL/Unread/Groups tabs, scrollable list, CurrentUserBar), ConversationListItem (avatar, name, preview, timestamp, unread badge), NewConversationModal (direct/group toggle, form inputs), CurrentUserBar (avatar, username, settings link). Updated chat layout to render sidebar on desktop (320px). Empty state improved. All typechecks green. |
| 2026-07-15 | Phase 3 | Built messages backend module
| 2026-07-15 | Phase 4.1 | Built ChatGateway: Clerk JWT verification on connect, explicit room join via conversation:join, message:new handler delegating to MessagesService.create() with ack + broadcast (sender excluded). No presence wiring. Registered RealtimeModule. All typechecks green.: Message/MessageReceipt/MessageReaction entities, MessagesService with cursor-paginated GET and POST (with clientId idempotency), MessagesRepository, MessagesController, migration adding client_id + edited_at columns with unique index. Frontend: message.service.ts, messageKeys.ts, useMessages (useInfiniteQuery), useSendMessage (useMutation). All typechecks green. |
