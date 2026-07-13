# project-overview.md

## About the Project & Problem Solved

A real-time, multi-device messaging application (1-on-1 and group chat) inspired by the attached UI prototypes: a three-pane desktop chat client (conversation list → active thread → contextual info panel) plus a settings area (profile, notifications, appearance, privacy).

**Problem it solves:** teams and small groups need a chat surface that feels instant (sub-200ms perceived latency for message delivery, typing, and presence) and trustworthy (accurate delivered/read state, reliable persistence, no duplicate/lost messages on reconnect) without building the real-time and persistence plumbing from scratch for every client feature.

> **Naming flag (say this out loud once, not repeatedly):** the prototypes label the app "Signal." Signal is an existing trademarked product (Signal Foundation / Signal Messenger). Ship under a different name — this doc uses **"the app"** / **`chat-app`** as the working codename throughout. Don't let a placeholder mockup label become the App Store listing name by accident.

## Pages & Navigation

Two top-level areas, matching the prototypes exactly:

1. **Main app shell** (`/`) — three-column layout:
   - Left: conversation list (search, filter tabs: All / Unread / Groups, per-item unread badge, last message preview, presence dot)
   - Center: active conversation (header with participant count/last-seen, message timeline, composer)
   - Right: contextual info panel (shared media grid, files list, mute/pin actions) — collapsible, hidden on smaller viewports
2. **Account / Settings** (`/account`) — two-column layout:
   - Left: settings nav (Profile, Notifications, Appearance, Privacy, Sign out)
   - Right: active settings panel

Routing (App Router, matches `architecture.md` folder tree):
```
/                          → conversation list + empty state
/chat/[conversationId]     → conversation list + active thread + info panel
/account/profile
/account/notifications
/account/appearance
/account/privacy
/login, /register          → public auth pages (Clerk-hosted or embedded components)
```

## Core User Flow

1. User authenticates via Clerk → session established → NestJS verifies Clerk JWT on both REST and the Socket.io handshake.
2. On app load, client fetches paginated conversation list (REST + TanStack Query) and opens **one** persistent Socket.io connection; the socket joins a room per conversation the user is a member of.
3. Selecting a conversation loads message history (paginated REST, cached/invalidated by TanStack Query) and marks the socket as "active" in that room for typing/presence purposes.
4. Sending a message: optimistic insert into the TanStack Query cache → emitted over the socket → server persists → server broadcasts to the room → server ack reconciles the optimistic message with the real id.
5. Read receipts fire from an Intersection Observer on the message list, debounced, batched, sent over the socket, persisted, and broadcast back to the sender.
6. Presence (online/last-seen) and typing indicators are ephemeral — Redis-backed, never written to Postgres.
7. Media (images/files/voice notes) upload via REST (Multer) before the message referencing them is sent over the socket.
8. Push notifications (FCM) fire only for messages delivered while the recipient's socket is disconnected/backgrounded.

## Data Architecture (high-level)

Relational system of record: **PostgreSQL** via TypeORM — users, conversations, membership, messages, receipts, reactions (full schema in `architecture.md`).
Ephemeral/real-time state: **Redis** — active socket ids per user, online/offline flags, typing-state TTL keys, room membership cache.
Object storage: media files land behind a CDN-fronted bucket; Postgres stores only URLs + type, never binary blobs.
Search: Postgres full-text (`tsvector`/`tsquery`) generated column on `messages.content`.

## Scope

### Features In Scope (mapped 1:1 to `build-plan.md` phases)
1. Real-time bi-directional messaging (Socket.io)
2. Authentication & profiles (Clerk)
3. 1-on-1 and group chats (Socket.io rooms)
4. Message persistence (Postgres + TypeORM + REST)
5. Connection & presence state (Redis + ping/pong)
6. Typing indicators (Socket.io ephemeral events, debounced client-side)
7. Read receipts (Intersection Observer + sockets + Postgres)
8. Multimedia support (Multer + image processing)
9. Push notifications (FCM, background-only)
10. Message interactions: reply, edit, delete, react (Postgres + sockets)
11. Search & filtering (Postgres full-text search)

### Features Out of Scope (v1)
- End-to-end encryption (content column is plaintext at rest in v1 — call this out to stakeholders explicitly, it's a real gap versus the "Signal" branding expectation)
- Voice/video calls (icons in the prototype header are UI-only placeholders in v1 — do not wire them to a real WebRTC stack)
- Message disappearing/self-destruct timers
- Multi-device sync of *drafts* (only sent messages sync)
- Admin/moderation tooling beyond basic group roles already in `conversation_members.role`
- Desktop/mobile native shells — web-responsive only

## Target User & Success Criteria

**Target user:** small-to-mid-size teams (5–50 people per workspace) who want group + DM chat with attachments, embedded in a product they already use — not a consumer mass-market messaging replacement.

**Success criteria (must be measurable, not vibes):**
- P50 message delivery latency (send → recipient render) < 250ms on a healthy connection
- Read receipt round-trip < 1s under normal load
- Zero message loss across a socket reconnect (verified by replay-from-cursor on reconnect)
- Typing indicator false-positive rate (indicator shown after user stopped typing >3s) < 5%
- Search returns results for a 10k-message conversation in < 300ms p95
