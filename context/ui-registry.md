# ui-registry.md

Component inventory derived from the five uploaded prototypes. **Reuse these — do not create a second version of any of them.** Each entry lists where it appears, its states, and its data source (per `code-standards.md` layer rules: `ui/` components never fetch, they receive props from hooks).

## Shell / Navigation

| Component | Appears in | States / Notes | Data source |
|---|---|---|---|
| `AppSidebarHeader` | Chat shell (top-left) | Logo mark, app name, connection status pill (`CONNECTED`), "+" new-conversation button | `useSocket()` connection status |
| `ConversationSearchInput` | Chat shell sidebar | Placeholder "Search conversations…" | local input state → `useSearchMessages` (debounced) |
| `ConversationFilterTabs` | Chat shell sidebar | Segmented control: `All` / `Unread` / `Groups`, pill-style, active = filled dark | local filter state, feeds `useConversations(filter)` |
| `ConversationListItem` | Sidebar list | Avatar (initials, gradient bg) + presence dot bottom-right, name, timestamp, preview text OR italic "typing…" state, unread count badge (red circle), selected state = light bg + border | `useConversations()` + `usePresence()` + typing event |
| `CurrentUserFooter` | Sidebar bottom | Avatar+presence dot, "You", "MANAGE PROFILE" link, settings gear icon | `useCurrentUser()` |

## Chat / Messages

| Component | Appears in | States / Notes | Data source |
|---|---|---|---|
| `ConversationHeader` | Chat top bar | Avatar, title, member-count badge (`👤 12`), subtitle ("LAST SEEN Xh AGO" for 1-on-1, member count for groups), action icons (call, video, search, more) — call/video icons are **inert in v1**, see `build-plan.md` scope note | `useConversation()` + `usePresence()` |
| `DateDivider` | Message timeline | Centered pill, e.g. "TODAY" | derived client-side from message timestamps, no fetch |
| `MessageBubble` — received | Timeline, left-aligned | Sender avatar, light/cream background, rounded corners flat on the avatar side | `useMessages()` |
| `MessageBubble` — sent | Timeline, right-aligned | Orange/red gradient background, white text, rounded corners flat on the right | `useMessages()` + optimistic entries from `useSendMessage()` |
| `MessageStatusRow` | Below a sent bubble | `DELIVERED · 12:43` or `READ · 12:40`, right-aligned, small caps, muted tone | `receipt:update` events via `useMarkAsRead`/receipt hook |
| `ReactionBar` | Below any bubble | Emoji + count pills (`🔥 3`, `✨ 1`), tap to toggle own reaction | `useReactToMessage()` |
| `ReplyQuoteCard` | Above a reply message, inside the bubble | Colored accent bar, quoted sender name (bold) + quoted text (truncated) | `messages.parent_id` → resolved parent in `useMessages()` |
| `ImageAttachmentCard` | Inline in timeline | Gradient/photo thumbnail, filename chip overlay (e.g. `MIXER_V04.PNG`), caption text below the card | `message_attachments` (Phase 8) |
| `VoiceNoteBubble` | Inline in timeline | Circular play button, waveform bar visualization, duration (`0:12`/`0:24`) | `message_attachments`, media_type = audio |
| `FileAttachmentRow` | Inline in timeline | File-type icon, filename, type + size subtitle | `message_attachments`, media_type = document |
| `MessageComposer` | Bottom of chat pane | Paperclip (attach), image icon, text input (`Message {name}…`), emoji icon, mic icon, `Send` button (filled orange pill, disabled when empty) | `useSendMessage()`, `useUploadMedia()`, typing emitter |
| `TypingIndicator` | Sidebar list item / header subtitle | Italic, accent-colored, replaces the last-message preview while active | `typing:start`/`typing:stop` events |

## Right Info Panel

| Component | Appears in | States / Notes | Data source |
|---|---|---|---|
| `ConversationInfoHeader` | Right panel top | Large avatar, title, "GROUP · N MEMBERS" or 1-on-1 equivalent, quick action icon row (call/video/mute/pin) | `useConversation()` |
| `SharedMediaGrid` | Right panel | 2×3 grid of gradient/photo thumbnails, trailing "+N" overflow tile opens full gallery | `message_attachments` filtered by media_type = image |
| `FilesList` | Right panel | Row per file: icon, name, size | `message_attachments` filtered by media_type = document/audio |
| `ConversationActionsList` | Right panel bottom | Text rows with icon: "Mute notifications", "Block user" | mute → `conversation_members.muted_until`; block → `blocked_contacts` (Phase 12) |

## Settings Shell

| Component | Appears in | States / Notes | Data source |
|---|---|---|---|
| `SettingsTopBar` | All `/account/*` pages | Back arrow, app icon, "Account / PROFILE & SETTINGS" title block, "Save changes" primary button (only shown on forms with unsaved changes) | local dirty-state per form |
| `SettingsNav` | Left column, all settings pages | Profile / Notifications / Appearance / Privacy, active = white pill on cream bg; divider; Sign out (destructive-adjacent, not red) | Next.js route active-state |

## Profile Page

| Component | Notes |
|---|---|
| `ProfileCoverBanner` | Gradient banner image, "COVER" camera-icon button top-right for upload |
| `ProfileAvatarUpload` | Circular avatar overlapping the banner, small camera-icon button bottom-right, presence dot bottom-left |
| `ProfileIdentityBlock` | Display name (bold, large), `@username` (muted), "ONLINE" status pill (green) |
| `ProfileStatusField` | Single-line "status" text with trailing pencil/edit icon, supports emoji |
| `PersonalDetailsForm` | Icon-prefixed inputs: Display Name (`@`), Username (`@`), Email (envelope), Location (pin), Website (link) — two-column grid on desktop | About textarea with live character counter (`104 / 240`) |

## Notifications Page

| Component | Notes |
|---|---|
| `SettingsToggleRow` | Reusable: leading icon in a rounded square, bold title, muted description, trailing pill toggle switch. Used for: Direct messages, Sound, Mentions only in groups, Do not disturb (Notifications page) and Read receipts, Show last seen, Allow being added to groups (Privacy page) — **one shared component, not four copies** |

## Appearance Page

| Component | Notes |
|---|---|
| `ThemeSwatchCard` | Large rounded card previewing a theme (Dark / Dim / Light), selected state = colored ring + checkmark badge top-right |
| `AccentColorSwatch` | Circular color swatch, 8 options in a row, selected state = dark ring outline. Drives `ThemeContext` accent value only — never persisted to the backend, see `architecture.md` |

## Privacy Page

| Component | Notes |
|---|---|
| `SettingsToggleRow` | Reused from Notifications page (see above) |
| `BlockedContactRow` | Avatar, name, "Blocked N days ago" subtitle, trailing "UNBLOCK" outline button |
| `DangerZoneCard` | Red-tinted bordered card, "Danger zone" heading in red, description, filled red "Delete account" button with trash icon — requires a confirmation step before firing (not shown in prototype but mandatory per `ui-rules.md` destructive-action rule) |

## Shared Atoms (used across every screen above)

- `Avatar` — circular, initials fallback with deterministic gradient background per user id, optional presence-dot overlay
- `ToggleSwitch` — pill toggle, on = filled dark track + white knob right, off = light track + knob left
- `Badge` — small pill, used for unread counts (filled, high-contrast) and member counts (outline, muted)
- `EmptyState`, `LoadingSpinner` — standard reference-plan atoms, unchanged
