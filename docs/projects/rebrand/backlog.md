# Backlog

## Theming & Dark Mode

The architecture behind these items is written up in [theming.md](./theming.md). The first two items
are mechanical and independent of the rebrand's palette decisions; the third is design work that
depends on the style guide.

- [ ] Tokenize the semantic Tailwind colors (`body`, `title`, `border`, `app-background`, `primary`,
      …) as CSS custom properties with light values only — a pure refactor with no visual change,
      which also flushes out raw-hex stragglers that bypass the semantic palette.
- [ ] Theme preference plumbing: `theme` cookie, server-side `data-theme` attribute in the root
      layout, inline resolver script for the system preference, `matchMedia` change listener, and
      the toggle component itself.
- [ ] Author the dark values for the token set (depends on the rebrand palette — see
      [open-questions.md](./open-questions.md)).
- [ ] Sweep for structural exceptions needing `dark:` variants; switch Mantine off
      `forceColorScheme='light'` and sync its color scheme with the resolved theme.

## Style Guide & Visual Identity

_Not yet scoped. Items will be added as the rebrand's design direction takes shape._
