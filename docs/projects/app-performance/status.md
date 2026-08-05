# Project Status

_Last updated: 2026-08-04_

## Phase

**Phase 1 — Restore SSR (started 2026-08-04).** Phase 0 (audit & project setup) is complete and all
six open questions were resolved on 2026-08-04 — see [decisions.md](./decisions.md). Headline
decisions: Clerk is scoped to authenticated routes entirely (Option B), FontAwesome migrates off the
CDN kit (its own phase), layout fetches get cross-request caching, and project images are
pre-converted to WebP/AVIF. Implementation proceeds on a dedicated branch per the
[backlog.md](./backlog.md) phases.

## Done

- 2026-08-04: Performance audit completed across three areas — the layout/provider shell
  (`AppConfig`, `ClientConfig`, root layouts, header/nav), the dashboard parallel routes, and the
  resume + projects routes. Headline findings: the `<ClerkLoaded>` gate makes every route's initial
  HTML a full-screen spinner, and the `ssr: false` dynamic provider chain in `ClientConfig` disables
  SSR for the entire page subtree. Full record in [findings.md](./findings.md).
- 2026-08-04: Project scaffolding created at `docs/projects/app-performance/` and registered in
  `docs/index.md`.
- 2026-08-04: Fix sequencing decided — SSR restoration first; see [decisions.md](./decisions.md).
- 2026-08-04: All six open questions resolved and recorded in [decisions.md](./decisions.md);
  [backlog.md](./backlog.md) restructured accordingly (Option B reshapes Phase 1; the FontAwesome
  migration became Phase 5).
- 2026-08-04: Baseline captured on `perf/restore-ssr` (dev server, anonymous requests): the
  server-rendered HTML for `/dashboard`, `/resume/experience`, and `/projects/greenbudget`
  contained **zero visible text** — no `<main>`, no headings, only the full-screen spinner markup.
- 2026-08-04: Phase 1 landed on `perf/restore-ssr`: Clerk scoped via the session-conditional
  `SessionClerkProvider` (plus a sign-in-layout provider for the signed-out sign-in flow), the
  `ClerkLoading`/`ClerkLoaded` gate removed, the five cheap providers statically imported in
  `ClientConfig` (`TourProvider` stays split, now without `ssr: false`), `Sidebar`/`SiteMenu`
  refactored off client-side Clerk (server-threaded `isSignedIn`; `SignInButton` is a plain link),
  and `useScreenSizes` made SSR-safe (desktop-assumed fallback corrected pre-paint on mount, which
  the newly server-rendered `LayoutNavigation` surfaced).
- 2026-08-04: Phase 1 verified against the dev server (anonymous requests): all three routes now
  render 4k–14k characters of visible text with `<main>`, the sidebar, and all five dashboard
  module headers present in the server HTML; no `@reactour` or Nivo chunks in the initial script
  list; `ClerkProvider` is not rendered for anonymous visitors. A production build compiled and
  type-checked cleanly.

## In Progress

- Phase 1 wrap-up: two verification items remain open (see Next).

## Next

1. **Production-build chunk verification is blocked** on unrelated schema drift: `next build`
   fails during page-data collection because `.env.production` points builds at the remote
   database, which does not yet have the resume-generation migration (`Company.slug`). Until a
   production build passes, the three `@clerk/*` wrapper chunks that appear in the dev script list
   (dev serves the whole static module graph) cannot be confirmed pruned for anonymous visitors.
2. Manual signed-in verification: sign-in flow, the account section of the site menu, sign-out,
   admin CMS, tour/drawers/toasts — best done in a browser session.
3. Cleanup candidates left orphaned by the scoping (not yet removed): `clerkUserIsAdmin` and
   `UserResource` in `src/application/auth/roles.ts`, `src/components/buttons/UserButton.tsx`,
   and `src/components/OrganizationSwitcher.tsx` (no importers).
4. Then Phase 2 of [backlog.md](./backlog.md) (chart `fallbackData`, skeletons, conditional tour).
