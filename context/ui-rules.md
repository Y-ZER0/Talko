# ui-rules.md

## Layout Rules

### Chat shell (three-column desktop layout)
- **Desktop (≥1024px):** fixed-width left sidebar (~320px), flexible center column (min 480px), collapsible right info panel (~320px, shown by default, dismissible via header "more" icon).
- **Tablet (640–1023px):** left sidebar + center column only. Right info panel becomes an overlay/slide-over triggered from the header, not a persistent column — reclaim the width instead of squeezing three columns.
- **Mobile (<640px):** single column, stack-navigation pattern. Conversation list is the default view; selecting a conversation pushes the chat view full-screen with a back arrow in the header (do not show list + chat side by side). The right info panel opens as a bottom sheet or full-screen overlay from the header's "more" action, never inline.
- The message composer is always pinned to the viewport bottom (`sticky`/`fixed`), never scrolls with the timeline.
- The message timeline auto-scrolls to bottom on new own-message send and on initial conversation load; it does **not** auto-scroll when a message arrives while the user has scrolled up more than one viewport height — show a "new messages" pill instead.

### Settings shell (two-column layout)
- **Desktop/tablet (≥768px):** persistent left nav (~240px) + content panel.
- **Mobile (<768px):** the settings nav becomes the top-level view (list of Profile/Notifications/Appearance/Privacy); tapping an item pushes that panel full-screen with a back arrow — same drill-down pattern as the chat shell, for consistency.
- Forms show a "Save changes" action only once a field has actually changed (dirty-state gated) — never a persistently-enabled save button that no-ops.

## Accessibility Mandates

- Every icon-only control (call, video, search, more, mic, attach, emoji, mute, pin, unblock's trailing icon if iconified) has an `aria-label` describing the action, not the icon shape (`aria-label="Start video call"`, not `aria-label="Video icon"`).
- `ToggleSwitch` uses a real `<button role="switch" aria-checked>` (or a visually-hidden native checkbox) — never a `<div>` with only a click handler and no keyboard/AT support.
- New incoming messages, typing indicators, and presence changes are announced via a polite `aria-live="polite"` region scoped to the active conversation — not `assertive`, which would interrupt a screen-reader user mid-sentence for every message.
- The message timeline is a `role="log"` region so assistive tech treats new entries as an append-only stream rather than re-reading the whole list.
- Focus management: opening the composer's emoji/attach menus traps focus within the menu and returns focus to the trigger on close (Esc or outside click). Selecting a conversation moves focus to the message timeline's first unread message (or the composer if none unread).
- Color contrast: the sent-message gradient (orange/red) with white text must meet WCAG AA (4.5:1) at its darkest gradient stop — verify against the actual gradient, not just the average color, since the top of the gradient is lighter.
- Any **destructive action** (`Delete account`, `Delete message`, `Remove from group`, `Unblock` is not destructive — exempt) requires a confirmation step (dialog or two-stage button) before firing — the `DangerZoneCard` in the Privacy screen must not fire on a single click, regardless of how the prototype mock renders it.
- Respect `prefers-reduced-motion`: disable the waveform "pulse" animation on `VoiceNoteBubble` and any typing-indicator dot animation when the user has reduced motion enabled — static equivalents only.
- All form fields in `PersonalDetailsForm` have a visible `<label>` (the icon-prefixed inputs in the prototype are not a substitute for a label — add a visually-associated label even if styled subtly).

## Responsive Breakpoints (canonical values — use these tokens, not ad hoc pixel values)

```
--bp-sm: 640px   // mobile → tablet
--bp-md: 768px   // settings shell nav collapse point
--bp-lg: 1024px  // tablet → desktop, right info panel becomes persistent
--bp-xl: 1280px  // wide desktop, no structural change, just max-width content clamp
```

## Interaction Rules

- Typing indicator debounce: show after the first keystroke, clear automatically 3s after the last keystroke if no explicit `typing:stop` arrives (defensive client-side timeout, don't rely solely on the server event — see `library-docs.md`).
- Read receipts fire only when a message is ≥50% visible in the viewport for ≥500ms (already specified in `library-docs.md` — this file is the UI-facing restatement so IMPRINT can check it without cross-referencing).
- Unread badges clear optimistically the moment the conversation is opened, reconciled against the server's mark-as-read response — don't wait for the round trip to update the sidebar.
- Optimistic sent messages render at reduced opacity or with a subtle "sending" spinner until the `message:ack` reconciles them — never render an optimistic message identically to a confirmed one.
