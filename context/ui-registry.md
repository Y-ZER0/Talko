# ui-registry.md

Visual consistency patterns extracted from existing components. Every new component must match these patterns.

Last updated: 2026-07-17

---

## Baseline — Established 2026-07-14

[Note: This baseline was established via /imprint audit on the Tailwind-migrated codebase]

| Property            | Token class                        |
| ------------------- | ---------------------------------- |
| Page background     | `bg-bg`                            |
| Card background     | `bg-surface`                       |
| Muted background    | `bg-surface-muted`                 |
| Border              | `border border-border`             |
| Card radius         | `rounded-2xl`                      |
| Input radius        | `rounded-xl`                       |
| Button radius       | `rounded-full`                     |
| Text — primary      | `text-text`                        |
| Text — secondary    | `text-text-muted`                  |
| Text — inverse      | `text-text-inverse`                |
| Text — accent       | `text-primary-500`                 |
| Button — primary    | `bg-primary-500 text-text-inverse font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-primary-600` |
| Button — ghost      | `bg-transparent text-text-muted font-medium hover:bg-surface hover:text-text` |
| Input — text        | `bg-surface border border-border rounded-xl font-sans text-base text-text px-4 py-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10` |
| Input — disabled    | `disabled:bg-surface-muted disabled:text-text-muted disabled:cursor-not-allowed` |
| Label — field       | `text-[11px] font-medium text-text-muted tracking-label uppercase` |
| Hover — surface     | `hover:bg-surface-muted`           |
| Hover — border      | `hover:border-primary-500/50`      |
| Focus ring          | `focus:ring-2 focus:ring-primary-500/10` |
| Shadow              | `shadow-none` (cards use border, not shadow) |

---

## Avatar

File: `shared/ui/components/Avatar.tsx`
Last updated: 2026-07-14

| Property         | Class                              |
| ---------------- | ---------------------------------- |
| Background       | Deterministic via `ACCENT_HEX[hash % 8]` (inline style) |
| Border radius    | `rounded-full`                     |
| Text — initials  | `text-white font-semibold`         |
| Presence dot     | `absolute rounded-full border-2 border-surface` |
| Online dot       | `bg-online`                        |
| Offline dot      | `bg-text-muted`                    |

**Pattern notes:**
- Avatar background is NOT a Tailwind class — uses inline `backgroundColor` from the 8-color accent palette
- Dot size adapts to avatar size (sm/md/lg)
- Always `border-surface` on the presence dot to create a "cutout" effect against the avatar

---

## Card (generic)

Used by: ProfileHeader, PersonalDetailsForm, auth SignIn/SignUp

| Property         | Class                              |
| ---------------- | ---------------------------------- |
| Background       | `bg-surface`                       |
| Border radius    | `rounded-2xl`                      |
| Border           | `border border-border`             |
| Padding          | `p-6`                              |
| Shadow           | `none`                             |

**Pattern notes:**
- Cards never use box-shadow — separation comes from border + background contrast
- Auth cards use `rounded-2xl p-6 border border-border`
- Profile cards use `rounded-2xl overflow-hidden` (cover bleeds to edges)

---

## TopBar / Header

File: `features/settings/ui/SettingsTopBar.tsx`
Last updated: 2026-07-14

| Property         | Class                              |
| ---------------- | ---------------------------------- |
| Background       | `bg-bg`                            |
| Border           | `border-b border-border`           |
| Padding          | `px-6 py-4`                        |
| Layout           | `flex items-center justify-between` |
| Title            | `text-lg font-semibold text-text`  |
| Subtitle         | `text-[11px] font-medium text-text-muted tracking-label uppercase` |

**Pattern notes:**
- Header sits on `bg-bg` (same as page), separated by bottom border
- Title + subtitle pattern: title is `text-lg font-semibold`, subtitle is mono uppercase `text-[11px]`

---

## Navigation (Settings)

File: `features/settings/ui/SettingsNav.tsx`
Last updated: 2026-07-14

| Property         | Class                              |
| ---------------- | ---------------------------------- |
| Container bg     | `bg-surface-muted rounded-2xl p-2` |
| Container layout | `flex flex-col gap-1`              |
| Item — inactive  | `flex items-center gap-3 px-4 py-3 rounded-xl bg-transparent text-text-muted font-medium` |
| Item — active    | `flex items-center gap-3 px-4 py-3 rounded-xl bg-surface text-text font-semibold` |
| Item — hover     | `hover:bg-surface hover:text-text` |
| Divider          | `h-px bg-border my-2`             |
| Icon — active    | `stroke="#E8562E"` (primary-500)   |
| Icon — inactive  | `stroke="#8A8478"` (text-muted)    |

**Pattern notes:**
- Active state = white pill on muted background
- Inactive state = transparent background
- Sign out uses ghost button pattern
- Icons are 20x20 SVGs, stroke-based

---

## Form Field (icon-prefixed input)

File: `features/settings/ui/PersonalDetailsForm.tsx`
Last updated: 2026-07-14

| Property         | Class                              |
| ---------------- | ---------------------------------- |
| Label            | `text-[11px] font-medium text-text-muted tracking-label uppercase mb-2` |
| Input            | `w-full py-3 pl-9 pr-4 bg-surface border border-border rounded-xl font-sans text-base text-text outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10` |
| Icon             | `absolute left-3 text-text-muted`  |
| Disabled         | `disabled:bg-surface-muted disabled:text-text-muted disabled:cursor-not-allowed` |

**Pattern notes:**
- Label is always mono uppercase at 11px
- Input has left padding for icon (`pl-9`), right padding for breathing room (`pr-4`)
- Focus state: border turns primary-500 + subtle ring

---

## Textarea

File: `features/settings/ui/PersonalDetailsForm.tsx`
Last updated: 2026-07-14

| Property         | Class                              |
| ---------------- | ---------------------------------- |
| Textarea         | `w-full px-4 py-3 bg-surface border border-border rounded-xl font-sans text-base text-text resize-y outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 box-border` |
| Char counter     | `absolute bottom-2 right-3 font-mono text-[11px] text-text-muted` |

**Pattern notes:**
- Same border/focus pattern as text inputs
- Character counter uses mono font, positioned bottom-right

---

## Status Pill (Online)

File: `features/settings/ui/ProfileIdentityBlock.tsx`
Last updated: 2026-07-14

| Property         | Class                              |
| ---------------- | ---------------------------------- |
| Container        | `flex items-center gap-1.5 px-3 py-1.5 bg-online/10 rounded-full` |
| Dot              | `w-2 h-2 rounded-full bg-online`   |
| Text             | `font-mono text-[11px] font-semibold text-online tracking-label uppercase` |

**Pattern notes:**
- Uses 10% opacity background of the status color
- Dot + text always together
- Mono uppercase for the label

---

## PresenceDot (standalone)

File: `features/presence/ui/PresenceDot.tsx`
Last updated: 2026-07-17

| Property         | Class                              |
| ---------------- | ---------------------------------- |
| Dot              | `inline-block rounded-full`        |
| Online           | `bg-online`                        |
| Offline          | `bg-text-muted`                    |
| Sizes            | sm: `w-2 h-2`, md: `w-2.5 h-2.5`, lg: `w-3.5 h-3.5` |

**Pattern notes:**
- Standalone dot without border-surface cutout (not overlaid on avatar)
- Colors match the Avatar presence dot pattern
- Used in contexts where Avatar component is not present
- Includes `aria-label` for accessibility

---

## Primary Button

Used in: SettingsTopBar (save), auth forms

| Property         | Class                              |
| ---------------- | ---------------------------------- |
| Background       | `bg-primary-500`                   |
| Text             | `text-text-inverse font-semibold text-sm` |
| Padding          | `px-5 py-2.5` (settings) / `py-3 px-6` (auth) |
| Border radius    | `rounded-full`                     |
| Hover            | `hover:bg-primary-600`             |
| Disabled         | `disabled:opacity-70 disabled:cursor-not-allowed` |
| Transition       | `transition-colors`                |

**Pattern notes:**
- All primary actions use this button style
- Always rounded-full (pill shape)
- No border, no shadow

---

## Icon Button (circular)

Used in: Back button, camera upload buttons

| Property         | Class                              |
| ---------------- | ---------------------------------- |
| Back button      | `w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center text-text hover:bg-border transition-colors` |
| Camera button    | `w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center border-2 border-surface hover:bg-black/80 transition-colors` |

**Pattern notes:**
- Two variants: surface-based (back) and overlay-based (camera)
- Camera buttons use black/70 background for visibility over images
- Both are `rounded-full`

---

## Auth Pages (Login/Register)

File: `app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx`
Last updated: 2026-07-14

| Property         | Class                              |
| ---------------- | ---------------------------------- |
| Page             | `min-h-screen flex flex-col items-center justify-center bg-bg p-4` |
| Brand icon       | `w-12 h-12 rounded-xl bg-text flex items-center justify-center mb-3` |
| Title            | `text-2xl font-semibold text-text m-0` |
| Subtitle         | `text-sm text-text-muted m-2`      |
| Footer link      | `text-primary-500 font-medium no-underline hover:text-primary-600` |

**Pattern notes:**
- Centered layout, full viewport height
- Brand icon: dark bg (`bg-text`) with white icon, `rounded-xl`
- Clerk components styled via `appearance.elements` to match design tokens

---

## Form Error Message

Used in: PersonalDetailsForm, NewConversationModal

| Property | Class |
| --- | --- |
| Error text | `mt-1 text-xs text-danger` |

**Pattern notes:**
- Appears below the input field when validation fails
- Uses `text-danger` color from design tokens
- Always `text-xs` for compact display
- Only shown when `errors.fieldName` exists (react-hook-form)

---

## Hardcoded Values Found

These inline hex values bypass the design system and should be replaced:

| File | Value | Should be |
| --- | --- | --- |
| `SettingsNav.tsx:22,38,60,79` | `stroke="#E8562E"` | Token reference (SVG stroke cannot use Tailwind) |
| `SettingsNav.tsx:22,38,60,79` | `stroke="#8A8478"` | Token reference |
| `ProfileStatusField.tsx:62` | `stroke="#8A8478"` | Token reference |
| `ProfileCoverBanner.tsx:18` | `linear-gradient(135deg, #E8562E, #C98F1E, #1C9BB5)` | Hardcoded gradient (acceptable — gradient cannot use Tailwind) |
| `Avatar.tsx:14-23` | `ACCENT_HEX` array | Hardcoded (acceptable — used for inline `backgroundColor`) |
| `NotificationPermissionPrompt.tsx:59` | `stroke="#E8562E"` | Token reference (SVG stroke cannot use Tailwind) |

**Note:** SVG `stroke` attributes and CSS `linear-gradient` cannot use Tailwind classes. These hardcoded values are acceptable as they map directly to design tokens defined in `globals.css`.

---

## TypingIndicator

File: `features/typing/ui/TypingIndicator.tsx`
Last updated: 2026-07-17

| Property         | Class                              |
| ---------------- | ---------------------------------- |
| Text             | `text-xs text-primary-500 italic truncate` |
| Accessibility    | `aria-live="polite" role="status"` |

**Pattern notes:**
- Uses `text-primary-500` (accent color) to distinguish from normal message preview
- Italic style signals ephemeral/transient state
- `truncate` prevents long multi-user lists from overflowing
- Always paired with `aria-live="polite"` for screen reader announcement
- Replaces message preview in ConversationListItem when active

---

## ReadReceiptIcon

File: `features/receipts/ui/ReadReceiptIcon.tsx`
Last updated: 2026-07-17

| Property         | Class                              |
| ---------------- | ---------------------------------- |
| Container        | `inline-flex items-center gap-0.5` |
| Text — sent      | `font-mono text-[10px] tracking-label uppercase text-text-muted` |
| Text — delivered | `font-mono text-[10px] tracking-label uppercase text-text-muted` |
| Text — read      | `font-mono text-[10px] tracking-label uppercase text-primary-500` |
| Timestamp        | `font-mono text-[10px] text-text-muted ml-0.5` |
| Icons            | SVG checkmarks, `stroke="currentColor"`, strokeWidth 1.8 |
| Single check     | 14×14px, one polyline |
| Double check     | 18×14px, two overlapping polylines |

**Pattern notes:**
- Three states: sent (single check, muted), delivered (double check, muted), read (double check, primary-500)
- Uses mono font + tracking-label + uppercase for status label — matches all-caps meta labels across the app
- READ state uses `text-primary-500` (accent) to visually distinguish from delivered
- Timestamp only shown in READ state, formatted as `h:mm A`
- Icons use `currentColor` for stroke — inherits text color from parent span
- Compact vertical footprint: fits alongside the message timestamp in a single row

---

## ToggleSwitch

File: `shared/ui/components/ToggleSwitch.tsx`
Last updated: 2026-07-17

| Property         | Class                              |
| ---------------- | ---------------------------------- |
| Track — on       | `bg-primary-500`                   |
| Track — off      | `bg-border`                        |
| Track size       | `var(--toggle-track-width)` × `var(--toggle-track-height)` (44×24px) |
| Track radius     | `rounded-full`                     |
| Thumb            | `bg-white shadow-sm rounded-full`  |
| Thumb size       | `20×20px`                          |
| Thumb — on       | `translate-x-5`                    |
| Thumb — off      | `translate-x-0.5`                  |
| Focus ring       | `focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-2 focus:ring-offset-surface` |
| Disabled         | `disabled:opacity-50 disabled:cursor-not-allowed` |
| Accessibility    | `role="switch"` `aria-checked`     |

**Pattern notes:**
- Uses `role="switch"` with `aria-checked` — never a `<div>` with click handler
- Track dimensions from CSS custom properties defined in `globals.css`
- Transition: `transition-colors duration-200` on track, `transition-transform duration-200` on thumb
- `pointer-events-none` on thumb to prevent double-toggle

---

## NotificationsPanel (Settings)

File: `features/settings/ui/NotificationsPanel.tsx`
Last updated: 2026-07-17

| Property         | Class                              |
| ---------------- | ---------------------------------- |
| Card background  | `bg-surface`                       |
| Card radius      | `rounded-2xl`                      |
| Card padding     | `p-6`                              |
| Title            | `text-lg font-semibold text-text`  |
| Subtitle         | `text-xs text-text-muted`          |
| Toggle row       | `flex items-center justify-between py-4 border-b border-border last:border-b-0` |
| Label            | `text-sm font-medium text-text`    |
| Description      | `text-xs text-text-muted mt-0.5`   |
| Save button      | Primary Button pattern             |
| Error message    | `text-xs text-danger`              |
| Loading spinner  | `w-6 h-6 border-[3px] border-border border-t-primary-500 rounded-full animate-spin` |

**Pattern notes:**
- Dirty-state gated save button — only appears when `isDirty` is true (per ui-rules.md)
- Toggle rows separated by `border-b border-border` with `last:border-b-0`
- Loading state uses same spinner pattern as profile page
- Error state uses `text-danger` (same as form validation errors)

---

## NotificationPermissionPrompt (Floating Banner)

File: `features/notifications/ui/NotificationPermissionPrompt.tsx`
Last updated: 2026-07-17

| Property         | Class                              |
| ---------------- | ---------------------------------- |
| Container        | `fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-surface border border-border rounded-2xl p-4 shadow-lg max-w-sm w-full mx-4` |
| Icon container   | `w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center` |
| Icon             | SVG bell, `stroke="#E8562E"`, strokeWidth 2 |
| Title            | `text-sm font-semibold text-text`  |
| Description      | `text-xs text-text-muted mt-1`     |
| Allow button     | Primary Button pattern (text-xs variant) |
| Dismiss button   | Ghost button pattern (text-xs variant) |
| Accessibility    | `role="alert"`                     |

**Pattern notes:**
- Fixed-position bottom-center overlay with `z-50`
- Uses `shadow-lg` (only floating element that does — cards use border only)
- `max-w-sm` constrains width on large screens, `mx-4` provides mobile padding
- Icon container uses `bg-primary-500/10` (10% opacity brand color, same as Status Pill pattern)
- Buttons use `ml-[52px]` to align with text content after the icon
- localStorage dismiss key prevents re-showing after user acts
