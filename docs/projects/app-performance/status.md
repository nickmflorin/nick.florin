# Project Status

_Last updated: 2026-08-05_

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
  server-rendered HTML for `/dashboard`, `/resume/experience`, and `/projects/greenbudget` contained
  **zero visible text** — no `<main>`, no headings, only the full-screen spinner markup.
- 2026-08-04: Phase 1 landed on `perf/restore-ssr`: Clerk scoped via the session-conditional
  `SessionClerkProvider` (plus a sign-in-layout provider for the signed-out sign-in flow), the
  `ClerkLoading`/`ClerkLoaded` gate removed, the five cheap providers statically imported in
  `ClientConfig` (`TourProvider` stays split, now without `ssr: false`), `Sidebar`/`SiteMenu`
  refactored off client-side Clerk (server-threaded `isSignedIn`; `SignInButton` is a plain link),
  and `useScreenSizes` made SSR-safe (desktop-assumed fallback corrected pre-paint on mount, which
  the newly server-rendered `LayoutNavigation` surfaced).
- 2026-08-04: Phase 1 verified against the dev server (anonymous requests): all three routes now
  render 4k–14k characters of visible text with `<main>`, the sidebar, and all five dashboard module
  headers present in the server HTML; no `@reactour` or Nivo chunks in the initial script list;
  `ClerkProvider` is not rendered for anonymous visitors. A production build compiled and
  type-checked cleanly.

- 2026-08-04: The restored SSR surfaced a hydration error: the FontAwesome kit script races
  hydration and injects `<svg>` children into server-rendered `<i>` tags. Resolved by pulling the
  Phase 5 FontAwesome migration forward: bundled Pro icon packages, typed registries, in-house SVG
  rendering, kit script removed. Verified via curl: no `kit.fontawesome.com` script, inline SVGs
  present in the server HTML on all checked routes. See [decisions.md](./decisions.md).
- 2026-08-04: The fixed desktop SSR viewport assumption was upgraded to User-Agent-seeded viewport
  state (ported from the craft repo): middleware stamps `x-viewport-device`, the layout maps it to a
  representative width, and `useScreenSizes` seeds from context. Verified: mobile User-Agent gets
  the mobile nav server-rendered; desktop gets the sidebar. See [decisions.md](./decisions.md) and
  Phase 6 in [backlog.md](./backlog.md).

- 2026-08-05: A second hydration error (reported at `Content`) was traced to `TourProvider` being a
  lazily-loaded ancestor of the entire page in `ClientConfig` — page hydration depended on its chunk
  resolving in time. Fixed by scoping the provider to the tour UI itself (`Tour` gate → client-only
  `TourRoot` → `TourProvider` + `TourFlow`), which also implements the Phase 2 skip-when-seen
  decision: dismissed/mobile visitors never download `@reactour/tour`. Verified: the dashboard HTML
  no longer references the reactour chunk at all. See [decisions.md](./decisions.md).

- 2026-08-05: The dashboard hydration error's true mechanism was pinned by its diff: `dynamic()` in
  **server** components emits a Suspense boundary in the server HTML that the client never renders,
  shifting sibling positions (`+ <div class="content">` vs `- <Suspense>`). All RSC `dynamic()`
  sites were converted to static imports (dashboard `Tour`, both resume timelines' `TimelineItem`,
  `CommitTimeline`/`DetailsTimeline`, six admin `@table` bodies). The registry's runtime guard also
  surfaced four icons used in the solid style that the inventory had marked regular (`code-commit`,
  `check`, `eye`, `eye-slash`); added to the solid registry. Both pages re-verified via curl. See
  [decisions.md](./decisions.md).

- 2026-08-05: A third hydration mismatch (same diff position) was the tour gate itself: the
  suppress-tour cookie's name (`nick.florin:suppress-tour`) contains characters that js-cookie
  URL-encodes on write (`:` → `%3A`), so the client found the cookie under the decoded name while
  the server's raw lookup missed it — the two disagreed about whether the tour was suppressed.
  Renamed to the token-safe `nick-florin-suppress-tour` (previously-dismissed visitors see the
  welcome dialog once more, then it re-suppresses under the new name), and `WelcomeDialog` now uses
  the shared `SuppressTourCookie` constant instead of a duplicated string literal.
- 2026-08-05: The RSC-`dynamic()` prohibition was added to the repo rules
  (`.claude/rules/code-quality/react/performance.md` and its `.github/instructions/` parity copy) so
  the pattern cannot silently return.

- 2026-08-05: The dashboard's module-height jumps during load (short skeletons → streamed content →
  chart mounting, with flex re-distribution on a wide screen) were fixed by implementing the chart
  `fallbackData` decision: the `@chart` page server-fetches the default-filter skills and seeds SWR,
  so the fixed-height chart container and legend are in the server HTML at first paint; the `@chart`
  loading fallback now reserves the same height via the shared `SkillsBarChartHeightClassNames`
  constant. Verified via curl: the chart container and height class are present in the server HTML.

- 2026-08-05: The dashboard layout was rebuilt as a deterministic grid per the developer's
  requirement: fixed fractional tracks at `xl`+ filling the viewport-derived content area, fixed
  pixel module heights below `xl`, internal scrolling everywhere — module sizes are known at first
  paint and cannot be changed by content in the module or its neighbors. Supersedes skeleton-height
  matching for the dashboard. See [decisions.md](./decisions.md).

- 2026-08-05: The show-more link under clamped descriptions was the last first-paint mover: the
  server must assume truncation, and the post-mount measurement was deleting the link row for
  fully-visible text (one line of shift per tile). Fixed by overlaying the link on the last clamped
  line (gradient fade, visibility-only toggle) — measurement can no longer affect layout. Chosen
  over the interim reserved-row fix (spacing cost) and data-driven truncation; see
  [decisions.md](./decisions.md). Also fixed alongside the deterministic grid: tile flex compression
  (`[&>*]:shrink-0`) and scrollbar-width reflow (`scrollbar-gutter: stable`) in the module scroll
  areas. Refined same-day: the overlay is hover-gated (touch devices show it outright), so the link
  is never present at first paint at all — verified in the server HTML (all 18 overlays
  `invisible`).

- 2026-08-05: The chart module's spinner → legend-alone → legend-vanishes → chart sequence was
  unified behind a single `SkillsBarChartSkeleton` (deterministic placeholder bars + legend chips,
  sized by the shared height constant): the slot's streaming fallback, the chunk-loading fallback,
  and the view's pre-mount render all show the identical skeleton, and the chart and legend then
  appear together in one commit (`SkillsBarChartView` is mount-gated). The
  `DynamicLoading`/`DynamicLoader` spinner machinery was removed from the chart module; the
  education/repositories column also switched to `fit-content(50%) minmax(0,1fr)` so education hugs
  its content and repositories absorbs the remainder. Verified: first-paint HTML contains the
  skeleton and neither the legend nor the chart container.

- 2026-08-05: Skeleton-fidelity and chart-readiness pass: the chart's overlay spinner is gated on
  `isRefetching` (SWR reports `isLoading` while revalidating the server-seeded fallback on mount,
  which doubled up with the skeleton); the chart chunk is kicked off at module evaluation (in
  parallel with hydration) instead of on first render; the chart skeleton gained an axis gutter, 24
  plateaued bars, and dot-plus-label legend chips; `DescriptionSkeleton` lines grew from 8px to 12px
  (real text lines occupy ~20px, so every tile skeleton was systematically short); the repository
  skeleton icon now matches the real 28px; condensed-tile title/subtitle skeleton proportions were
  corrected; and the educations slot skeleton only gives its first tile a description, mirroring the
  real data (relevant because that module's row is content-fitted).

## In Progress

- Phase 1 + pulled-forward Phase 5 + Phase 6 + the tour restructure + the RSC-`dynamic()`
  conversion + the tour-cookie rename are implemented and dev-verified on `perf/restore-ssr`, **all
  uncommitted** pending the developer's review (explicit hold).

## Next

1. **Production-build chunk verification is blocked** on unrelated schema drift: `next build` fails
   during page-data collection because `.env.production` points builds at the remote database, which
   does not yet have the resume-generation migration (`Company.slug`). Until a production build
   passes, the three `@clerk/*` wrapper chunks that appear in the dev script list (dev serves the
   whole static module graph) cannot be confirmed pruned for anonymous visitors.
2. Manual signed-in verification: sign-in flow, the account section of the site menu, sign-out,
   admin CMS, tour/drawers/toasts — best done in a browser session.
3. Cleanup candidates left orphaned by the scoping (not yet removed): `clerkUserIsAdmin` and
   `UserResource` in `src/application/auth/roles.ts`, `src/components/buttons/UserButton.tsx`, and
   `src/components/OrganizationSwitcher.tsx` (no importers).
4. Then Phase 2 of [backlog.md](./backlog.md) (chart `fallbackData`, skeletons, conditional tour).
