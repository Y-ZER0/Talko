# ui-tokens.md

Tokens read off the five uploaded prototypes. Hex values are best-effort estimates from the screenshots, not a designer-provided palette — **treat every hex below as "confirm against the real Figma file before shipping,"** not as gospel. What's structurally certain regardless of exact hex: a warm off-white base (not pure white), one orange-red brand accent, an 8-color deterministic avatar/accent palette, and a dual type system (humanist sans for content, tracked uppercase mono-ish for meta/labels).

## Color

```css
:root {
  /* Base surface — warm off-white, not pure white/gray */
  --color-bg: #F4EFE6;
  --color-surface: #FFFFFF;
  --color-surface-muted: #EDE7DC;
  --color-border: #E6DFD2;

  /* Text */
  --color-text: #1C1B19;
  --color-text-muted: #8A8478;
  --color-text-inverse: #FFFFFF;

  /* Brand / primary accent (default) — orange-red, used for sent bubbles, primary buttons, active states */
  --color-primary-500: #E8562E;
  --color-primary-600: #D2431F;
  --color-primary-700: #B23419;
  --color-primary-gradient: linear-gradient(135deg, #E8562E 0%, #C7351F 100%);

  /* Danger */
  --color-danger: #D93F3F;
  --color-danger-bg: #FBEAEA;

  /* Success / online */
  --color-online: #22C55E;

  /* Deterministic accent/avatar palette — 8 values, index by hash(userId) % 8 */
  --accent-orange: #E8562E;   /* default */
  --accent-teal:   #1C9BB5;
  --accent-purple: #8F6FE0;
  --accent-green:  #1FAA6B;
  --accent-pink:   #D6548F;
  --accent-gold:   #C98F1E;
  --accent-blue:   #2E86DE;
  --accent-coral:  #D9573F;

  /* Theme surfaces (Appearance panel) */
  --theme-dark-bg: #0D0D0E;
  --theme-dim-bg: #1A2233;
  --theme-light-bg: #EDEDED;
}
```

Usage rules:
- `--color-primary-*` is the **default** accent; when a user picks a different accent in Appearance, every place that currently reads `--color-primary-500` (sent bubbles, active nav pill, primary buttons, focus rings) reads the selected `--accent-*` value instead — this is the entire mechanism behind `ThemeContext`, there is no separate "accent" system to build.
- Avatar background is deterministic per user (hash the user id into the 8-value accent palette above) so a given person's avatar color never changes between sessions or components.
- `--color-danger` only appears on the Privacy page's Danger Zone card and on message-delete confirmations — never repurpose it for a generic "warning."

## Typography

Two families, used deliberately:

```css
:root {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;   /* names, body copy, message content */
  --font-mono: "JetBrains Mono", ui-monospace, monospace;        /* timestamps, meta labels, badges, form field labels */

  --text-xs: 0.75rem;    /* 12px — timestamps, meta labels */
  --text-sm: 0.875rem;   /* 14px — secondary text, descriptions */
  --text-base: 1rem;     /* 16px — message content, body */
  --text-lg: 1.125rem;   /* 18px — section headers */
  --text-xl: 1.5rem;     /* 24px — page titles, profile display name */

  --tracking-label: 0.06em; /* letter-spacing on uppercase mono labels: STATUS, DISPLAY NAME, COVER, ONLINE */
}
```

Rule: any all-caps label (`STATUS`, `DISPLAY NAME`, `GROUP · 12 MEMBERS`, `TODAY` divider, `READ · 12:40`) uses `--font-mono` + `--tracking-label` + `--text-xs`. Names, message bodies, and form values use `--font-sans`. Don't mix these up per-component — it's the single most visible consistency signal across the whole app.

## Spacing & Radius

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-8: 48px;

  --radius-sm: 8px;    /* form inputs, small buttons, badges */
  --radius-md: 16px;   /* message bubbles, cards */
  --radius-lg: 24px;   /* large cards: profile cover, theme swatch cards */
  --radius-full: 9999px; /* avatars, pills, toggle switches, Send button */
}
```

## Elevation / Layering

- Cards on `--color-bg` sit on `--color-surface` (white) with no visible box-shadow in the prototypes — separation comes from the color/contrast difference, not shadow. Don't introduce drop-shadows that aren't in the reference.
- Modals/overlays (delete confirmation, mobile info-panel sheet) get a scrim `rgba(0,0,0,0.4)` and the surface itself uses `--radius-lg` at the top corners only if presented as a bottom sheet on mobile.

## Component-Specific Tokens

```css
:root {
  --composer-height: 64px;
  --sidebar-width: 320px;
  --info-panel-width: 320px;
  --avatar-size-sm: 32px;   /* list items */
  --avatar-size-md: 40px;   /* chat header */
  --avatar-size-lg: 96px;   /* profile page */
  --toggle-track-width: 44px;
  --toggle-track-height: 24px;
}
```
