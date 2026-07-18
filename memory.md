# Memory — Phase 11 Search & Filtering [UI] Complete

Last updated: 2026-07-18

## What was built

**Phase 11 Search & Filtering [UI]:**

- **SearchPanel** (`apps/web/src/features/search/ui/SearchPanel.tsx`) — full-screen absolute overlay (`absolute inset-0 z-30`) triggered from header search icon. Search input with 300ms debounce, results list showing message content (with highlighted matches), sender name, timestamp, conversation name. Click result → navigates to conversation and scrolls to message with 2s highlight ring. Escape key or close button to dismiss.
- **useDebouncedValue hook** (`apps/web/src/features/search/hooks/useDebouncedValue.ts`) — generic debounce hook, 300ms default. Prevents per-keystroke API requests (typing "hello" sends 1 request instead of 4).
- **ConversationHeader** (`apps/web/src/features/messages/ui/ConversationHeader.tsx`) — added `onSearchClick` prop, wired to existing search icon button.
- **MessageTimeline** (`apps/web/src/features/messages/ui/MessageTimeline.tsx`) — added `searchOpen` state, URL-based `?messageId=` param reading for cross-conversation navigation, `handleSearchResultClick` callback, renders `SearchPanel`.
- **MessageList** (`apps/web/src/features/messages/ui/MessageList.tsx`) — added `scrollToMessageId` prop, `data-message-id` attribute on each message wrapper div, scroll-to-message effect with temporary highlight ring (primary-500/30, 2s fade).

## Decisions made

- **SearchPanel is an absolute overlay on the message area**, not a sidebar panel — keeps it scoped to the conversation context, doesn't shift the three-column layout.
- **300ms debounce on search input** — balances responsiveness with API efficiency. No lodash dependency, uses project's existing setTimeout pattern.
- **Cross-conversation search results** navigate via URL (`?messageId=` param) so the page works with direct links. Same-conversation results scroll in-place.
- **Sidebar All/Unread/Groups tabs** remain client-side filtered (filter the conversations list in memory) — they already work as intended, no server-side filtering needed.

## Problems solved

- No debounce existed in the codebase — search was firing one API request per keystroke after char 2. Created `useDebouncedValue` hook to fix.

## Current state

- Phase 11 [LOGIC] + [UI] complete. All typechecks + lints pass across all 3 workspaces (web, api, shared).
- Database migration applied via Supabase SQL editor.
- Search icon in conversation header now opens SearchPanel.
- Sidebar tabs (All/Unread/Groups) filter conversations client-side.

## Next session starts with

Phase 12 — Appearance & Privacy Settings:
1. Phase 12 [LOGIC] — Privacy prefs migration (`users.read_receipts_enabled`, `show_last_seen`, `allow_group_invites_from_anyone`), `blocked_contacts` table + block/unblock endpoints, `PATCH /users/me/privacy`
2. Phase 12 [UI] — `AppearancePanel` (ThemeContext-driven: Dark/Dim/Light, accent swatches) + `PrivacyPanel` (toggles wired to Phase 12 logic, blocked contacts list, danger-zone delete account)

## Open questions

- None
