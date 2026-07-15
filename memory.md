# Memory — Phase 4.2: Frontend Socket Infrastructure

Last updated: 2026-07-15

## What was built

**Phase 4, Task 4.2 `[LOGIC]` — Frontend socket infrastructure:**

- `apps/web/src/shared/lib/socket-client.ts` — modified `createSocket` to use `autoConnect: false` (context registers handlers first, calls `.connect()`); `disconnectSocket` now calls `removeAllListeners()`
- `apps/web/src/features/presence/context/SocketContext.tsx` — `SocketProvider`: uses Clerk `useAuth()` to get token, creates socket on sign-in, disconnects on sign-out. Registers connect/disconnect/connect_error handlers. Tracks joined rooms via `pendingJoins` ref, rejoins all on reconnect. Exposes `joinRoom()` / `leaveRoom()` + `activeRooms` array + `isConnected`.
- `apps/web/src/features/presence/hooks/useSocket.ts` — consumer hook that returns context or throws if used outside `SocketProvider`
- `packages/shared/src/events/socket-events.enum.ts` — grouped events into sections (Message/Typing/Reaction/Receipt/Conversation/Presence/System), added `CONVERSATION_LEAVE`

## Decisions made

- **autoConnect: false**: Socket context registers event handlers (connect/disconnect/connect_error) before calling `.connect()` — avoids missing the initial connect event on a fast connection.
- **pendingJoins ref for rejoin**: `joinRoom`/`leaveRoom` mutate a `Ref<Set<string>>` so it persists across socket reconnections. On `connect`, all pending rooms are re-emitted via `conversation:join`. State-driven `activeRooms` array triggers consumer re-renders.
- **SocketProvider tied to Clerk auth**: No socket until `isSignedIn` is true. Disconnects and clears rooms on sign-out. Token fetched via `getToken()` for fresh JWTs.
- **CONVERSATION_LEAVE added to enum**: Follows the same pattern as `CONVERSATION_JOIN`, even though the gateway doesn't handle it yet — the enum is the contract.

## Problems solved

- `createSocket` was using `autoConnect: true`, creating a race between socket connection and handler registration. Changed to `autoConnect: false` — context now registers handlers then calls `.connect()`.

## Current state

- Phases 1–3 complete
- Phase 4.1 (ChatGateway) complete
- Phase 4.2 (socket-client + SocketContext + useSocket) complete — all typechecks green across all 3 workspaces
- Phase 4.3 (MessageList/MessageBubble/MessageComposer + optimistic send UI) is next
- No database running yet

## Next session starts with

**Phase 4, Task 4.3 `[UI]` — Message timeline + composer:**
1. `apps/web/src/features/messages/ui/MessageList.tsx` — infinite scroll, renders `MessageBubble` per message
2. `apps/web/src/features/messages/ui/MessageBubble.tsx` — sent/received styling, status indicators
3. `apps/web/src/features/messages/ui/MessageComposer.tsx` — text input, send button, wire to `useSendMessage` + socket emit
4. Wire `SocketProvider` into `(chat)/layout.tsx`
5. Mount `MessageList` + `MessageComposer` in `chat/[conversationId]/page.tsx`

## Open questions

- None
