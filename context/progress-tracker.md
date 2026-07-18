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
- [x] `[UI]` MessageList/MessageBubble/Composer + optimistic send

## Phase 5 — Presence (Feature 5)
- [x] `[LOGIC]` PresenceService (Redis) + ping/pong + presence:update
- [x] `[UI]` PresenceDot + "last seen" header text

## Phase 6 — Typing Indicators (Feature 6)
- [x] `[LOGIC]` typing:start/stop socket events
- [x] `[UI]` Debounced emitter + TypingIndicator component

## Phase 7 — Read Receipts (Feature 7)
- [x] `[LOGIC]` receipt:read event, respects read_receipts_enabled, broadcast
- [x] `[UI]` useMarkAsRead (Intersection Observer) + ReadReceiptIcon

## Phase 8 — Multimedia (Feature 8)
- [x] `[LOGIC]` message_attachments migration + MediaController + MediaService (ImageKit) + wire upload into message send flow
- [x] `[UI]` Attach button, Image/File/VoiceNote components, shared-media grid

## Phase 9 — Push Notifications (Feature 9)
- [x] `[LOGIC]` device_tokens migration + FCM service + suppress-if-online rule
- [x] `[UI]` Permission prompt + Notifications settings panel

## Phase 10 — Message Interactions (Feature 10)
- [x] `[LOGIC]` Reply/Edit/Delete/React — REST + socket broadcast each
- [x] `[UI]` ReplyPreview, inline edit, delete confirm, ReactionBar

### Refactor
- [x] Split monolithic `chat.gateway.ts` into per-domain gateways: ConnectionGateway, ConversationGateway, MessageGateway, ReceiptGateway, MessageInteractionGateway, ReactionGateway. All on shared namespace `'/'` with single auth pass via ConnectionGateway. PresenceGateway stripped of duplicate auth.

## Phase 11 — Search & Filtering (Feature 11)
- [x] `[LOGIC]` search_vector migration + SearchService + endpoint
- [x] `[UI]` Search panel + wire All/Unread/Groups tabs to real state

## Phase 12 — Appearance & Privacy
- [ ] `[LOGIC]` Privacy prefs migration + blocked_contacts + endpoints
- [ ] `[UI]` AppearancePanel (ThemeContext-driven) + PrivacyPanel

---

## Session Log (append-only, newest at top)
| Date | Phase(s) touched | Notes / decisions made |
|---|---|---|
| 2026-07-18 | Phase 11.2 | Built SearchPanel UI: full-screen overlay triggered from header search icon. Search input with debounced query (2-char min via existing useSearchMessages hook), results list showing message content (with highlight), sender name, timestamp, conversation name. Clicking result navigates to conversation and scrolls to message with highlight ring. Escape/click-outside to close. Integrated into MessageTimeline with URL-based messageId param for cross-conversation navigation. Added scrollToMessageId prop + data-message-id attribute to MessageList. All typechecks + lints green across all 3 workspaces. |
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
| 2026-07-17 | Phase 4.3 | Built MessageTimeline, MessageList (infinite scroll, date/sender grouping), MessageBubble (sent/received styling, status indicators), MessageComposer (textarea with auto-resize, Enter to send). Updated ConversationSidebar to use next/navigation router instead of local state. Wired SocketProvider into (chat)/layout. Updated useSendMessage to use socket as primary transport (MESSAGE_NEW emit with ack callback) with REST fallback. Added MESSAGE_ACK listener in MessageList to replace optimistic messages with confirmed ones. Extracted grouping helpers into message-helpers.ts. Fixed scroll bug (initial-load-only scrollToBottom). All typechecks green across 3 workspaces. |
| 2026-07-17 | Phase 5.1 | Built presence backend: SocketRegistryService (Redis I/O), PresenceService (orchestration + broadcast), PresenceGateway (connect/disconnect JWT verification, setOnline/setOffline, custom ping/pong handler with TTL refresh). Added PING/PONG to SocketEvent enum. Added lastSeen to PresenceEventPayload. Removed rootDir from api tsconfig to fix shared package import. All typechecks green across 3 workspaces. |
| 2026-07-17 | Phase 5.2 | Built presence UI: PresenceContext (Map-based state, listens for presence:update events, 30s ping emitter), usePresence hook, PresenceDot component (standalone, 3 sizes, aria-label). Updated ChatLayout with PresenceProvider wrapper. ConversationListItem now passes isOnline to Avatar from presence context. MessageTimeline header shows "Online" (green) or "last seen Xm ago" for 1:1 conversations. Added formatLastSeen helper. Imprinted PresenceDot to ui-registry.md. All typechecks green. |
| 2026-07-17 | Phase 6.1 | Typing socket events: updated TypingEventPayload (added userId), added setTyping/clearTyping to SocketRegistryService (Redis TTL key conv:{id}:typing:{userId}, 5s TTL), created TypingService for orchestration, added typing:start/stop handlers to PresenceGateway with in-memory socket.data.typingConversations tracking for disconnect cleanup. Listeners broadcast to conversation room excluding sender (socket.to). All typechecks green. |
| 2026-07-17 | Phase 6.2 | Typing indicator UI: created TypingContext (provider + socket listeners + 5s auto-expiry + client-side userId→username resolution from TanStack Query cache), useTypingIndicator hook, TypingIndicator component (formatted text: "X is typing...", "X and Y are typing...", etc.). MessageComposer emits debounced typing:start on keystroke with 3s timeout, typing:stop on submit/unmount. ConversationListItem conditionally renders typing text or message preview. Imprinted TypingIndicator to ui-registry.md. All typechecks green. |
| 2026-07-17 | Phase 7.1 | Built receipt:read socket handler: migration adding read_receipts_enabled to users table, batch upsert in MessagesRepository, markAsRead service with membership check, ChatGateway handler that checks privacy toggle before writing receipts and broadcasts receipt:update per message. All typechecks green. |
| 2026-07-17 | Phase 7.2 | Read receipts UI: created ReceiptProvider (listens for receipt:update socket events, batches into Map state), useMarkAsRead hook (IntersectionObserver, 500ms debounce, emits receipt:read with batched message IDs), ReadReceiptIcon component (single check/sent, double check/delivered, double check in primary-500/read with timestamp). Modified MessageBubble to accept observeRef and use ReadReceiptIcon. Modified MessageList to wrap with ReceiptProvider and observe all messages. Imprinted ReadReceiptIcon to ui-registry.md. All typechecks green. |
| 2026-07-17 | Phase 2 gap | Implemented unread count per conversation
| 2026-07-17 | Phase 8.1 | Built message_attachments migration + entity + MessageAttachmentDto. Created MediaModule (MediaController with Multer memoryStorage, MediaService with ImageKit upload + buildTransformedUrl). Deprecated messages.media_url/media_type — all new attachments go in message_attachments. Updated Message entity with @OneToMany relation. Updated MessageDto with attachments array. Updated MessagesRepository.saveWithAttachments(), MessagesService.create()/toDto(). Updated ChatGateway.handleMessage() to pass attachments through. Extended SendMessageRequestDto (REST) + SendMessageEventPayload (socket) with attachments array. Created frontend media.service.ts + useUploadMedia hook. Updated useSendMessage optimistic message + socket payload. Installed imagekit + @types/multer. Typechecks green.
| 2026-07-17 | Phase 8.2 | Created ImageAttachmentCard (thumbnail + fullscreen overlay via ImageKit URL transforms), FileAttachmentRow (file icon + name + size + download), VoiceNoteBubble (play/pause + waveform bars + duration timer). Updated MessageComposer with file picker (hidden input per type), pending upload list with progress spinner/success/error states, upload-all-then-send flow. Updated MessageBubble with AttachmentsRenderer that switches on mediaType. Created useConversationAttachments hook (extracts unique attachments from message cache). Created SharedMediaPanel with image grid + files list + empty state. Integrated info panel into MessageTimeline with toggle via header "more" button (desktop: side column, mobile: overlay). Typechecks green. |
| 2026-07-17 | Phase 2 gap | Implemented unread count per conversation: migration adding last_read_at to conversation_members, countUnread query in ConversationsRepository, updateLastReadAt in ConversationMembersRepository, findMaxCreatedAt in MessagesRepository, markAsRead now updates last_read_at to max message timestamp, toConversationDto now async with live unreadCount, added CONVERSATION_OPEN socket event with gateway handler, frontend emits conversation:open on entering a conversation. All typechecks green. |
| 2026-07-17 | Phase 9.1 | Built push notifications backend: device_tokens migration + DeviceToken entity + DeviceTokensRepository + FcmService (firebase-admin v14, multicast, invalid token cleanup) + NotificationsService + register-token REST endpoint. ChatGateway.handleMessage() now checks room membership via server.in().fetchSockets() and sends FCM push to recipients not present in the conversation room. Added NotificationsModule + RealtimeModule import. Installed firebase-admin. All typechecks green. |
| 2026-07-17 | Phase 9.2 | Built notification settings UI: ToggleSwitch shared component (role="switch", aria-checked, 44x24 token dimensions), NotificationsPanel (4 toggles: Direct messages, Sound, Mentions only, Do not disturb — dirty-state gated save button), NotificationPermissionPrompt (fixed bottom banner, browser Notification API, localStorage dismiss). Created notification-preferences.service.ts + useNotificationPreferences + useUpdateNotificationPreferences hooks. Added NotificationPreferencesDto to shared package. Wired prompt into chat layout, notifications page renders panel. All typechecks green across 3 workspaces. |
| 2026-07-18 | Refactor | Split monolithic `chat.gateway.ts` into 6 per-domain gateways (ConnectionGateway, ConversationGateway, MessageGateway, ReceiptGateway, MessageInteractionGateway, ReactionGateway) on shared namespace `'/'`. ConnectionGateway handles auth + presence setOnline/setOffline in one pass. PresenceGateway stripped of duplicate auth. ConversationsService updated to inject ConnectionGateway. All typechecks green. |
| 2026-07-18 | Phase 10.2 | Built Phase 10 UI: ReplyPreview, MessageActions (emoji bar + Edit/Delete menu), ReactionPills (grouped counts, toggle), DeleteConfirmModal. Wired reactions into MessageDto + API entity JOINs. Frontend hooks: useEditMessage, useDeleteMessage, useReaction, useReplyTo. Modified MessageBubble (hover state, inline edit, deleted placeholder, reaction pills), MessageComposer (reply preview), MessageList (socket listeners for edits/deletes/reactions), MessageTimeline (orchestrator). Refactored: extracted useRealtimeMessages hook, ConversationHeader, ToolbarButton, PendingUploadList, InlineEditor. Removed dead code, fixed toggle reaction bug. All typechecks + lints green. |
| 2026-07-18 | Phase 10.1 | Built Message Interactions LOGIC: `edit()`/`delete()`/`addReaction()`/`removeReaction()` in MessagesService, `updateMessage()`/`upsertReaction()`/`deleteReaction()` in MessagesRepository, REST endpoints (PATCH/DELETE/:messageId, POST/DELETE :messageId/reactions), `MessageInteractionGateway` (MESSAGE_EDIT, MESSAGE_DELETE), `ReactionGateway` (REACTION_ADD, REACTION_REMOVE). No schema changes needed — all columns/tables already in place. All typechecks green. |
| 2026-07-18 | Phase 11.1 | Built Search & Filtering LOGIC: Supabase SQL migration adding `search_vector` (tsvector generated column) + GIN index to messages table. Created `SearchResultDto` (messageId, messageContent, messageTimestamp, senderName, conversationId) in shared package. Built `SearchModule` (service, controller) — `GET /search?q=` with tsquery builder, scoped to user's conversations via conversation_members JOIN, ranks by ts_rank, excludes deleted messages, LIMIT 20. Frontend: `search.service.ts` + `searchKeys.ts` + `useSearchMessages.ts` (useQuery, enabled when query >= 2 chars, 30s staleTime). All typechecks + lints green across 3 workspaces. |
