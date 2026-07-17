# Memory — Phase 9: Push Notifications UI

Last updated: 2026-07-17

## What was built

**Phase 9 `[UI]` — Permission Prompt + Notifications Settings:**

- `packages/shared/src/dtos/notification-preferences.dto.ts` — `NotificationPreferencesDto` and `UpdateNotificationPreferencesRequest` types
- `apps/web/src/shared/ui/components/ToggleSwitch.tsx` — shared toggle component (`role="switch"`, `aria-checked`, 44x24 token dimensions)
- `apps/web/src/features/notifications/services/notification-preferences.service.ts` — `GET`/`PATCH /users/me/notification-preferences` frontend service
- `apps/web/src/features/notifications/hooks/useNotificationPreferences.ts` — `useQuery` hook with key factory
- `apps/web/src/features/settings/ui/NotificationsPanel.tsx` — 4 toggle rows (Direct messages / Sound / Mentions only / Do not disturb) with local state, no save button (save hook was deleted by request)
- `apps/web/src/features/notifications/ui/NotificationPermissionPrompt.tsx` — fixed bottom banner, browser Notification API request, localStorage dismiss tracking
- `apps/web/src/app/(protected)/account/notifications/page.tsx` — updated stub to render `NotificationsPanel`
- `apps/web/src/app/(protected)/(chat)/layout.tsx` — added `NotificationPermissionPrompt` mount
- `context/ui-registry.md` — imprinted ToggleSwitch, NotificationsPanel, NotificationPermissionPrompt patterns

## Decisions made

- **No save button on notification panel:** The `useUpdateNotificationPreferences` hook was deleted per developer request. Toggles are local-only for now — persisting them requires a backend `[LOGIC]` task to add the preference columns and endpoints.
- **Permission prompt is fixed bottom-center, not a modal:** Uses `role="alert"` and `position: fixed` with `z-50`. Dismissed via localStorage key so it only shows once.
- **FCM token registration removed from prompt:** The initial prompt used dynamic `firebase/messaging` imports to auto-register after permission grant, but firebase isn't installed in the web app. Prompt now only requests browser Notification permission — token registration must be handled separately.

## Current state

- Phase 9 LOGIC complete. Phase 9 UI complete (minus backend preference persistence).
- Phases 10–12 remain.
- No database running yet.
- `useUpdateNotificationPreferences` deleted — notification preferences panel renders toggles but changes don't persist to backend.

## Next session starts with

**Start Phase 10 — Message Interactions `[LOGIC]`:**
1. Reply (uses existing `messages.parent_id`)
2. Edit (needs `messages.edited_at` migration)
3. Delete (soft-delete via `is_deleted`)
4. React (`message_reactions` CRUD)
5. All with REST + socket broadcast per action

## Open questions

- None
