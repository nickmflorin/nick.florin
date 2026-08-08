# Project Status

_Last updated: 2026-08-08_

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

- 2026-08-06: Filters trigger/popover restructured to the "eager trigger, lazy content" convention
  (the Phase 2b design): `SkillsFilterDropdownMenu` renders a plain, SSR'd `ChartFilterButton` at
  first paint; the first click mounts `SkillsFilterPopover` with the new pass-through
  `initiallyIsOpen` prop (opens on mount, no second click); hover/focus preloads the chunk via a
  module-scope `loadSkillsFilterPopover`; the `dynamic()` `loading` fallback renders a disabled
  `ChartFilterButton` so the button never flashes away. The popover's inner lazy `Popover` import
  became static — the module is now fetched on intent only, and a nested lazy chunk would render the
  trigger as `null` while resolving. The mobile drawer branch was unchanged.

- 2026-08-06: Clerk-scoping cleanup landed: deleted the orphaned `src/application/auth/roles.ts`
  (`clerkUserIsAdmin`, `UserResource`), `src/components/buttons/UserButton.tsx`, and
  `src/components/OrganizationSwitcher.tsx` (no importers; the org-role constants remain in use by
  `proxy.ts` and `server-v2.ts`). `FONT_AWESOME_KIT_TOKEN` was retired from
  `src/environment/index.ts` and `.env` (no longer read anywhere since the kit-script removal).

- 2026-08-06: Frozen-selects-on-first-open fixed (the popover's selects ignored clicks and showed a
  stray clear icon until their data arrived, self-resolving on close/reopen via the warm SWR cache).
  Three gates were involved: `SelectPopover`'s `isReady` disable, `DataSelectBase`'s `NOTSET` input
  disable, and `isLocked={isLoading}` (pointer-events removal) in
  `ClientEducationSelect`/`ClientExperienceSelect`. The selects now stay interactive while their
  data loads (menu shows its loading state), `NOTSET` renders the placeholder instead of a phantom
  clearable value, and `preloadSkillsChartFilterData()` warms the educations/experiences SWR keys on
  filter-trigger hover/focus/click. See backlog Phase 2b for the follow-up covering the remaining
  `Client*Select`s.

- 2026-08-06: The "random chart/button flicker" was pinned by browser instrumentation (headless
  Chrome with layout-shift and mutation observers), superseding the earlier HMR hypothesis: every
  cold open of a floating element swapped the nearest route Suspense boundary to its fallback.
  `ConditionalPortal` mounted a `dynamic()`-wrapped `FloatingPortal` only at open time, and in the
  App Router `dynamic()` without a `loading` option renders a bare `React.lazy` with no local
  Suspense boundary — so the suspension escaped to the `@chart` slot and blinked the entire module
  (header actions included) to its skeleton on tooltip/popover opens. Fixed with a static import:
  `@floating-ui/react` was already in the client bundle via the floating hooks, so the lazy wrapper
  saved nothing. Verified headlessly: chart-module DOM mutations per hover went from 8 (fallback
  in/out) to 0, with zero layout-shift entries. The fix is global — every `ConditionalPortal`
  consumer (tooltips, popovers, select menus) stops blinking its surrounding boundary.

- 2026-08-06: The "janky dashboard on mobile screens" report was reproduced and pinned: with a
  mobile User-Agent at a 677px viewport (devtools device emulation), the first paint has no sidebar
  (mobile-seeded layout) and the 60px rail mounts ~1.2s later, shifting every module's position and
  size — the screenshotted "overlapping modules" state is the mid-correction paint. Clean loads at
  677px/900px, desktop→mobile resizes, DPR 2, and cookie-less profiles all measure perfectly (no
  overlap, rows sized to content), so the CSS grid itself is sound; the defect is the JS-gated
  navigation presence keyed off the UA-seeded viewport. Fix direction (pending decision) recorded in
  backlog Phase 2.

- 2026-08-06: The seeded-navigation jank was fixed by making the nav variants CSS-driven
  (`LayoutNavigation` renders both; the rail hides at `max-[450px]`; `Sidebar` statically imported).
  Verified headlessly: the mismatch case (mobile UA at 677px) now paints the rail in the first frame
  with zero horizontal shift; true mobile (390px) keeps it hidden throughout. The remaining
  early→settled deltas at narrow widths are vertical streamed-skeleton swaps, tracked by the
  existing Phase 2 skeleton-fidelity items.

- 2026-08-06: The persistent stacked-view collapse (squashed chart bars tracking window height,
  modules overlapping beneath) was the scroll viewport's flex layout, not the grid: the
  `content__scroll-viewport` is a height-clamped (100% min/max) flex column, so its children were
  eligible to be compressed to the scrollport's own height — gated only by the flex "automatic
  minimum size", which engines resolve differently for grid children (headless Chrome held the
  content size, which is why earlier reproductions measured clean; the developer's browsers
  collapsed it). Proven by forcing `min-height: 0` on the dashboard grid: 2314px → 554px with the
  chart bars at 0px — the exact reported symptom. Fixed with `flex-shrink: 0` on all scroll viewport
  children in `layout.scss` (scroll content must overflow the scrollport, never shrink to it —
  protects every route) plus `shrink-0` on the chart's and skeleton's fixed-height bars rows.
  Verified: with the minimum forced to zero the grid now holds 2314px and the bars 340px.

- 2026-08-06: The header's disappear-and-reappear on refresh was resolved on both ends: the profile
  and primary-resume reads now go through `unstable_cache` (superjson-wrapped so `Date` fields
  survive; tags `profile`/`primary-resume`, with the resume mutations revalidating), and the
  header's Suspense fallback became a dimensionally-matched `HeaderSkeleton` instead of `null`, so
  the residual stream gap paints as a loading header rather than an empty bar. Verified: the initial
  HTML flush carries the skeleton in the header and the streamed content follows.

- 2026-08-06: The Clerk sign-in widget's left-then-center flash was fixed by centering it at the
  page level: `/sign-in` now renders `<SignIn />` inside a full-height flex container
  (`items-center justify-center`), so the widget mounts centered instead of jumping from its in-flow
  top-left position when Clerk's client code takes over.

## In Progress

- The 2026-08-06 batch — filters popover restructure, frozen-selects fix, `ConditionalPortal`
  Suspense-blink fix, button truncation, CSS-driven nav presence, scroll-viewport collapse fix,
  header caching + skeleton, sign-in centering, and the orphan/env cleanups — is committed to
  `master`, along with the drawer exit animation and the `CompaniesSchoolsDropdownMenu` trigger
  alignment.
- The 2026-08-08 batch is **uncommitted in the working tree** on `perf/skeletons`: the de-Clerk'd
  header (Phase 3b), non-dashboard skeletons (Phase 2), and the GreenBudget server-component fix
  plus project-page payload trim (Phase 4). None of it has been type-checked, linted, or run in a
  browser yet.

## Next

1. Review and verify the 2026-08-08 batch: `pnpm tsc`, `pnpm lint`, and a browser pass over
   `/resume/*`, `/projects/*`, `/admin/*`, the header, and the site tour (whose first step was
   retargeted from the removed dropdown onto `#site-resume-actions`).
2. **Decide on sign-out.** De-Clerking the header removed the only sign-out affordance in the app;
   see the follow-up note under Phase 3b in [backlog.md](./backlog.md).
3. **Production-build chunk verification is blocked** on unrelated schema drift: `next build` fails
   during page-data collection because `.env.production` points builds at the remote database, which
   does not yet have the resume-generation migration (`Company.slug`). Until a production build
   passes, the three `@clerk/*` wrapper chunks that appear in the dev script list (dev serves the
   whole static module graph) cannot be confirmed pruned for anonymous visitors. The de-Clerk'd
   header should make this moot for anonymous visitors, but it is still unconfirmed.
4. Manual signed-in verification: sign-in flow, admin CMS, tour/drawers/toasts — best done in a
   browser session. (The account section of the site menu no longer exists.)

Everything else in [backlog.md](./backlog.md) is closed except the Phase 2b filters cluster —
debounced filter changes, the select-data performance investigation, and the URL-driven filters
question in [open-questions.md](./open-questions.md) — which the developer has deferred and does not
want started. Phase 5 is complete; Phase 7 (the closing Lighthouse pass) was dropped 2026-08-08.
