# Backlog

The ordered list of work items, organized into phases. The phases are sequenced so that the
highest-impact changes land and are verified first; later phases build on a restored SSR baseline.
Check items off as they land (`[x]`), and add new items as they come up. All previously
decision-gated items were unblocked by the 2026-08-04 decisions (see
[decisions.md](./decisions.md)).

Implementation happens on a dedicated branch, not `master`.

## Phase 1 — Restore SSR of Page Content

The two shell fixes from [findings.md](./findings.md) #1–2, with Clerk handled per the Option B
decision: scoped to authenticated routes, not merely un-gated.

- [ ] Capture the baseline: save the server-rendered HTML (`curl`/view-source) for `/dashboard`,
      `/resume/experience`, and one `/projects/*` page, plus a Lighthouse run, so the after-state
      has something to be compared against.
- [ ] Scope `ClerkProvider` to the authenticated areas (`/admin/*`, `/sign-in`) and remove the
      `ClerkLoading`/`ClerkLoaded` gate entirely. Public pages ship no Clerk JS.
- [ ] Refactor the shell components off client-side Clerk on public pages: `Sidebar` and `SiteMenu`
      currently call `useUser`. Auth-derived UI (the admin nav item, user menu content) comes from
      the server (`auth()` in server components, passed down) or renders a public fallback, without
      layout shift.
- [ ] Statically import `MantineProvider`, `NavigationProvider`, `NavMenuProvider`,
      `UserProfileProvider`, and `DrawersProvider` in `ClientConfig` (drop `next/dynamic` and
      `ssr: false`). `TourProvider` stays split (conditional mounting lands in Phase 2).
- [ ] Verify: server HTML now contains real page content for all three captured routes; no
      hydration-mismatch warnings in the console; admin UI still appears for a signed-in admin;
      sign-in and the admin CMS still work; tour, drawers, and toasts still function. Record results
      in [status.md](./status.md).

## Phase 2 — Eliminate Remaining Flicker

- [x] Dashboard chart initial paint: fetch the default-filter skills dataset in the `@chart` server
      page and pass it as SWR `fallbackData` (decided 2026-08-04; implemented 2026-08-05). The
      `@chart` loading fallback also reserves the chart's exact fixed height (shared
      `SkillsBarChartHeightClassNames` constant), fixing the dashboard's module-height jumps during
      streaming.
- [x] Dashboard layout made deterministic (2026-08-05): fixed grid tracks per breakpoint, module
      content scrolls internally, content can never resize a module — supersedes skeleton-height
      matching for the dashboard (see [decisions.md](./decisions.md)). Visual tuning of the chosen
      fractions/heights (`1.5fr 1fr 1fr` at `xl`+, `3fr 2fr`/`fit-content(50%) minmax(0,1fr)` column
      rows) is open to developer review.
- [ ] Bring skeleton loading states to every non-dashboard page, with the same fidelity bar the
      dashboard now meets (skeletons dimensionally match the content they stand in for, so the swap
      does not shift layout):
  - [ ] `/resume/experience` and `/resume/education` — replace the generic `<Loading />` fallbacks
        (both the `loading.tsx` files and the in-page `Suspense` fallbacks) with timeline-shaped
        skeletons: commit-line bullets plus `ResumeModelPageTile`-shaped tile skeletons.
  - [ ] `/projects/*` — audit the per-project `loading.tsx` files and replace generic spinners with
        page-shaped skeletons (title/description blocks, section headings, and `ProjectImage`-sized
        placeholders so the large screenshots reserve their space).
  - [ ] `/admin/*` — verify the `@table` slot fallbacks (control-bar placeholder + `tbody` loading)
        still hold up now that the table bodies are statically imported, and upgrade them to
        row-shaped skeletons where they are still spinner-based.
  - [ ] Reuse the dashboard's fidelity fixes where applicable (`DescriptionSkeleton` line metrics,
        `iconSize`-matched icon placeholders) rather than re-deriving per page.
- [x] Tour: skip mounting `TourProvider` (and its chunk) when the tour cookie says the tour has been
      seen — implemented 2026-08-05 by scoping the provider to the tour UI itself (`Tour` gate →
      client-only `TourRoot` → `TourProvider` + `TourFlow`), removing it from `ClientConfig`
      entirely. See [decisions.md](./decisions.md).
- [x] Page-scroll bands size to content (2026-08-05, generalized same day from the mobile-only
      version): fixed module frames and internal scrolling now exist **only at `xl`+**, where the
      grid fits the viewport. In every band where the page scrolls (below `xl` — two-column and
      stacked alike), modules size to their content: no nested scrollbars, no forced module scroll,
      no dead space inside fixed tracks.

## Phase 2b — Chart Filters View & Popovers Generally (added 2026-08-05)

- [x] **Hydration/runtime error in the chart filters popover** — resolved 2026-08-05: the select
      inputs' default clear icon (`Input.tsx`'s `clearIcon = { name: 'xmark' }`, default regular
      style) was only registered as solid. `xmark` added to the regular registry, and
      `getIconDefinition` made forgiving (cross-style substitution, then a bland fallback icon, both
      logged) so a registry miss can never crash a subtree again.

**Research findings (2026-08-05, not yet implemented)** — how the filters popover actually loads
today, established by reading the floating primitives:

- The popover's _content_ already mounts only while open: `PopoverContentWrapper` renders its
  children only when `isOpen && !isDisabled`. The form — and therefore its burst of select SWR
  requests — is **not** mounted eagerly; the fetches fire on open. The eager costs are different:
  (a) the `SkillsFilterPopover` chunk (form + selects) downloads at hydration, and (b) the **filter
  button itself lives inside the `ssr: false` popover module** on desktop, so the button is absent
  at first paint and pops in after hydration + chunk load.
- The primitives already support the fix: `useFloating` accepts `initiallyIsOpen` (and a controlled
  `isOpen`), and `Popover` forwards its config through `usePopover` to `useFloating` — no new
  floating capability is required.

- [ ] **Restructure the filters trigger/popover** (design ready, unimplemented): render a plain,
      SSR'd `ChartFilterButton` at first paint; the first click flips local state to lazily mount
      `SkillsFilterPopover` with a new pass-through `initiallyIsOpen` prop so it opens on mount (no
      second click); preload the chunk on the button's hover/focus (module-scope import kick, as the
      chart chunk does); give the `dynamic()` a `loading` fallback that renders a disabled
      `ChartFilterButton` so the button never flashes away while the chunk resolves. The mobile
      drawer branch already follows this shape (state-gated, on-open chunk) and needs no change.
- [ ] **Audit and align the other floating triggers to the same convention** — "the trigger renders
      eagerly and server-side; the floating content is a lazily-loaded chunk fetched on intent and
      mounted open" :
  - `CompaniesSchoolsDropdownMenu` (`DynamicCompaniesSchoolsFloating`, resume pages): the whole
    floating **including its trigger button** is `ssr: false` — same late-trigger defect as the
    filters button. Its disabled-button `loading` fallback is a good precedent for the fallback
    pattern, but it only covers chunk resolution, not SSR.
  - Already conforming (trigger outside the lazy module): `ClientSiteDropdownMenu` (eager
    `IconButton`, lazy `SiteMenu`), `UploadResumeDropdownMenu` (eager `DropdownMenu` + trigger, lazy
    `UploadResumeMenu` content behind the open toggle).
  - `Tooltip` lazily imports `Popover` _without_ `ssr: false`, so tooltip triggers still SSR —
    acceptable as-is; note the chunk is a lazy ancestor of the trigger during hydration, which has
    been benign because the chunk is tiny.
- [ ] **Filters popover select-data performance** — the on-open burst of SWR requests (educations,
      experiences, categories, …). Investigate the React 19 promise-streaming pattern: the `@chart`
      server page starts these fetches **without awaiting** and passes the promises as props across
      the client boundary; the popover's selects `use()` them inside a `Suspense` boundary so the
      data resolves in the background (started at request time, ahead of any interaction) and is
      awaited only when the popover actually opens. Considerations: promise props must be started
      per-request (no module-level caching), rejected promises need an error boundary in the
      popover, and the win should be measured against simply prefetching the SWR keys on trigger
      hover/focus (a much smaller change that composes with the restructure above).

## Phase 3 — Unblock Route Streaming (Caching)

Cross-request caching with CMS revalidation for both fetches (decided 2026-08-04).

- [ ] Inventory the CMS mutation actions that can change the cached data: project
      create/update/delete/visibility (nav) and resume upload/update/delete (menu).
- [ ] `/projects/*` layout: cache the nav/slug-validation `fetchProjects` call with
      `unstable_cache` + `revalidateTag`, revalidated by the project mutations.
- [ ] Header `SiteDropdownMenu`: cache the resumes query the same way, revalidated by the resume
      mutations.

## Phase 4 — Bundle & Payload

- [ ] `GreenBudget`: remove `'use client'` from the page component (push the forcing hook into a
      leaf), matching the `Website` page's server-component pattern.
- [ ] Trim server→client serialization on project pages: pass only the fields the components read
      instead of the full project record with relations.
- [ ] Project images: pre-convert the `public/projects/` PNGs to WebP/AVIF (decided 2026-08-04) and
      update the `ProjectImage` call sites.
- [ ] Project images: `priority` only on the first above-fold image per page; lazy-load the rest.

## Phase 5 — FontAwesome Migration

Committed 2026-08-04 and **pulled forward the same day** (see [decisions.md](./decisions.md)) —
restoring SSR surfaced a kit-vs-hydration race that made this urgent.

- [x] Inventory every icon name and style used across the app (52 names: 43 regular, 5 solid, 4
      brands; verified no dynamically-constructed names exist).
- [x] Replace the kit-backed icon components with bundled, server-rendered SVGs: typed per-style
      registries in `src/components/icons/registry.ts` (Pro packages at 6.7.2), an in-house SVG
      render in `FontAwesomeIcon`, and `IconName` derived from the registry keys.
- [x] Remove the kit `<script>` from the `(site)` layout.
- [x] Verify icons are present in the server HTML at first paint (no post-load swap) — confirmed via
      curl on the dev server.
- [ ] Retire `FONT_AWESOME_KIT_TOKEN` from the environment config (no longer read anywhere).
- [ ] Ensure `FONT_AWESOME_AUTH_TOKEN` is present in the Vercel/CI build environment — installs now
      pull `@fortawesome/pro-*` packages from the Pro registry.
- [ ] Manual browser check: icon rendering parity across the app (sizes, colors, admin tables,
      toggled icons) and confirmation the hydration error is gone.

## Phase 6 — SSR Viewport Seeding (added 2026-08-04, done with Phase 1)

- [x] Port the craft repo's User-Agent viewport seeding: middleware header, representative device
      widths, `ScreenSizeProvider` context, and `useScreenSizes` seeding with width-derived
      breakpoints. Verified: mobile User-Agent receives the mobile nav in server HTML; desktop
      receives the sidebar.

## Phase 7 — Final Verification

- [ ] Re-run Lighthouse/Speed Insights across the audited routes and record the final before/after
      comparison in [status.md](./status.md).
