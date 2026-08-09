# Light/Dark Theming — Recommended Architecture

Written 2026-08-09. This is the recommended approach for supporting a three-way theme preference —
light, dark, or system default — in an unauthenticated app where the preference must live in a
cookie. It is a recommendation, not a ratified decision; when it is discussed and settled, the
outcome lands in [decisions.md](./decisions.md), and the work items live in
[backlog.md](./backlog.md).

## Current State (2026-08-09)

The app is well positioned for this:

- The Tailwind palette in `src/tailwind/colors.ts` is already **semantic** (`body`, `title`,
  `border`, `app-background`, `primary`), and components use Tailwind classes exclusively — there
  are no component-level SCSS modules.
- The document routes already prove out the CSS-custom-property pattern
  (`src/styles/document/_variables.scss` defines `--color-*` variables consumed via `var()`).

The blockers:

- The semantic tokens are hardcoded hex values, so nothing can swap them per mode.
- Tailwind is configured with `darkMode: 'media'`, which is wired but unused — and is the wrong
  strategy for an explicit preference (a user who picks light on a dark OS would get a mixed theme).
- Light mode is forced in two places: `color-scheme: only light` in `src/styles/globals/index.scss`,
  and `forceColorScheme='light'` in `src/components/config/MantineProvider.tsx`.
- Nothing reads cookies server-side yet (`cookies()` from `next/headers` is unused).

## State Model: Store the Preference, Derive the Mode

These are two different things and must not be conflated:

```typescript
// What the user picked — this is what the cookie stores.
type ThemePreference = 'dark' | 'light' | 'system';

// What actually renders — derived: the preference itself if explicit, otherwise whatever the
// browser's `prefers-color-scheme` media query says.
type ThemeMode = 'dark' | 'light';
```

The constraint driving the whole design: **the server can never know the system setting**.
`prefers-color-scheme` exists only in the browser, so resolution is split by preference:

1. **Explicit preference (cookie is `light` or `dark`).** The root layout reads the cookie
   server-side and renders `<html data-theme='dark'>` directly. The server HTML is correct from the
   first byte — zero flash of the wrong theme.
2. **System preference (cookie is `system` or absent).** The server renders no attribute, and a tiny
   inline blocking script in `<head>` resolves it before first paint.

```tsx
// In the root layout: rendered in <head> only when the cookie is 'system' or absent. Because the
// script is inline and synchronous, it runs before anything paints — no flash.
const ResolveSystemThemeScript = (
  <script
    dangerouslySetInnerHTML={{
      __html: `document.documentElement.dataset.theme = window.matchMedia(
        '(prefers-color-scheme: dark)').matches ? 'dark' : 'light';`,
    }}
  />
);
```

Because this script mutates the attribute before React hydrates, `<html>` needs
`suppressHydrationWarning`. While the preference is `system`, a client component also attaches a
`matchMedia('(prefers-color-scheme: dark)')` `change` listener so the site follows a live OS switch
(for example, macOS auto-switching at sunset).

## Persistence: The Cookie and the Toggle

The toggle is a small client component. It writes the cookie and flips the attribute in the same
tick, so the switch is instant with no server round-trip — the cookie exists only so the _next_ full
page load renders correctly server-side:

```typescript
const applyThemePreference = (preference: ThemePreference, resolved: ThemeMode): void => {
  // Not httpOnly — the client must be able to write it. One year, site-wide.
  document.cookie = `theme=${preference}; path=/; max-age=31536000; SameSite=Lax`;
  document.documentElement.dataset.theme = resolved;
};
```

The `next-themes` library implements this same pattern and is a fine shortcut, but it persists to
localStorage rather than a cookie, so the server always renders theme-less and relies on the inline
script even for explicit preferences. The hand-rolled version is roughly 60 lines total and gets
cookie-aware SSR for free, which fits how much infrastructure this repo already owns.

## Styling: Swap Tokens, Not Usages

This determines whether dark mode costs a week or an afternoon. There are two mechanisms, used in a
specific ratio.

### Primary Mechanism: Semantic Tokens Become CSS Custom Properties

Redefine the existing semantic Tailwind colors as variables that flip with the attribute. Values are
stored as RGB channel triplets so Tailwind's opacity modifiers keep working:

```scss
:root,
[data-theme='light'] {
  // Replaces `color-scheme: only light`; also themes native scrollbars and form controls.
  color-scheme: light;
  --color-app-background: 251 251 251; // #fbfbfb
  --color-body: 81 81 81; // #515151
  --color-border: 222 226 230; // #dee2e6
  --color-title: 17 24 39; // #111827
}

// Dark values here are illustrative placeholders — the real ones are style-guide design work.
[data-theme='dark'] {
  color-scheme: dark;
  --color-app-background: 19 20 23;
  --color-body: 182 188 196;
  --color-border: 51 56 63;
  --color-title: 241 243 245;
}
```

Then `src/tailwind/colors.ts` points the semantic names at the variables instead of hex:

```typescript
// Correct: the `<alpha-value>` / channel-triplet form keeps opacity modifiers like `text-body/50`
// working.
export const ColorTheme = {
  colors: {
    body: 'rgb(var(--color-body) / <alpha-value>)',
    title: 'rgb(var(--color-title) / <alpha-value>)',
  },
};

// Disallowed: a plain `var()` over a hex value renders, but silently breaks every opacity
// modifier, because Tailwind cannot inject the alpha channel into an opaque hex value.
export const BrokenColorTheme = {
  colors: {
    body: 'var(--color-body)',
  },
};
```

The payoff: every existing `text-body`, `bg-app-background`, and `border-border` usage in the app
themes itself with **zero edits** — and so does every SCSS `theme('colors.app-background')` call,
since those resolve to the same variable. A font color that differs between modes needs exactly two
lines in the token file and nothing anywhere else. This token layer is also what the rebrand style
guide wants to exist anyway: the brand lives in one file rather than smeared across usages.

### Secondary Mechanism: `dark:` Variants for Structural Exceptions

Tailwind's dark mode strategy changes from `media` to the attribute the plumbing controls, so
`dark:` responds to the _resolved_ theme rather than the raw OS setting:

```typescript
// In `src/tailwind.config.ts`:
const config = {
  darkMode: ['selector', '[data-theme="dark"]'],
};
```

Reserve `dark:` for one-off cases where dark mode wants a genuinely different treatment — a shadow
that becomes a border, an image swap — not for routine color flips:

```tsx
// Correct: a structural difference, not a palette difference.
<div className='shadow-md dark:shadow-none dark:border dark:border-border' />;

// Disallowed: a routine color flip repeated per usage is a missing semantic token — define the
// token once and use `text-body` (or a new token) instead.
<span className='text-gray-700 dark:text-gray-200' />;
```

### Mantine

`MantineProvider` stops forcing `forceColorScheme='light'` and instead receives the resolved scheme
(or uses Mantine v7's `colorSchemeManager`), so its internal CSS variables flip in sync with the
site's.

## Order of Attack

Mirrored as work items in [backlog.md](./backlog.md):

1. **Tokenize** — move the semantic colors to CSS variables with light values only. Pure refactor,
   no visual change; flushes out raw-hex stragglers that bypass the semantic palette.
2. **Plumbing** — cookie, layout attribute, inline resolver script, `matchMedia` listener, toggle
   component.
3. **Dark values** — author the dark palette for the token set (the actual design work of the
   rebrand; see [open-questions.md](./open-questions.md)).
4. **Sweep** — find the structural exceptions needing `dark:`, and bring Mantine in sync.

Steps 1 and 2 are mechanical and independent of the rebrand's palette decisions.
