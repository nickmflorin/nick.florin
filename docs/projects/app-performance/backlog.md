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

- [x] Capture the baseline: save the server-rendered HTML (`curl`/view-source) for `/dashboard`,
      `/resume/experience`, and one `/projects/*` page, plus a Lighthouse run, so the after-state
      has something to be compared against.
- [x] Scope `ClerkProvider` to the authenticated areas (`/admin/*`, `/sign-in`) and remove the
      `ClerkLoading`/`ClerkLoaded` gate entirely. Public pages ship no Clerk JS.
- [x] Refactor the shell components off client-side Clerk on public pages: `Sidebar` and `SiteMenu`
      currently call `useUser`. Auth-derived UI (the admin nav item, user menu content) comes from
      the server (`auth()` in server components, passed down) or renders a public fallback, without
      layout shift.
- [x] Statically import `MantineProvider`, `NavigationProvider`, `NavMenuProvider`,
      `UserProfileProvider`, and `DrawersProvider` in `ClientConfig` (drop `next/dynamic` and
      `ssr: false`). `TourProvider` stays split (conditional mounting lands in Phase 2).
- [x] Verify: server HTML now contains real page content for all three captured routes; no
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
- [x] Bring skeleton loading states to every non-dashboard page, with the same fidelity bar the
      dashboard now meets (skeletons dimensionally match the content they stand in for, so the swap
      does not shift layout) — implemented 2026-08-08:
  - [x] `/resume/experience` and `/resume/education` — replace the generic `<Loading />` fallbacks
        (both the `loading.tsx` files and the in-page `Suspense` fallbacks) with timeline-shaped
        skeletons: commit-line bullets plus `ResumeModelPageTile`-shaped tile skeletons. Three
        `loading.tsx` files and both `Suspense` fallbacks now render `ResumeTimelineSkeleton`.
  - [x] `/projects/*` — audit the per-project `loading.tsx` files and replace generic spinners with
        page-shaped skeletons (title/description blocks, section headings, and `ProjectImage`-sized
        placeholders so the large screenshots reserve their space). All four render
        `ProjectPageSkeleton`, driven by a per-page `sections` descriptor.
  - [x] `/admin/*` — verify the `@table` slot fallbacks (control-bar placeholder + `tbody` loading)
        still hold up now that the table bodies are statically imported, and upgrade them to
        row-shaped skeletons where they are still spinner-based. All twelve were spinner-based
        (`<Loading component='tbody' />`) and now use `ConnectedDataTableBodySkeleton`, which reads
        `visibleColumns`/`rowsAreSelectable`/`rowsHaveActions` off `useDataTable()`. The control-bar
        placeholders were already correct; `admin/educations/@table/loading.tsx` was importing the
        _courses_ placeholder and was fixed.
  - [x] Reuse the dashboard's fidelity fixes where applicable (`DescriptionSkeleton` line metrics,
        `iconSize`-matched icon placeholders) rather than re-deriving per page. `Skeleton`,
        `DescriptionSkeleton`, `RepositoryTileSkeleton`, `ResumeModelHeaderScaffold` (with its
        per-breakpoint `ImageSizes`), `CommitTimeline`/`TimelineIcon` and the generic table body
        components were all reused; one primitive was added (`SkeletonLineOffset`, the `my-[2px]`
        that lifts a font-sized bar to the line box text actually occupies).

**Open:** the description and detail _line counts_ for the resume tiles and project sections are
estimated from the fixture prose (`roles.yaml`, `degrees.yaml`, `projects.json`) at the ~884px
content width, not measured against live content. Every other dimension is derived from the real
components, typography scale, and SCSS. If the live DB content differs materially from the fixtures,
those count props are the one place to adjust.

- [x] Tour: skip mounting `TourProvider` (and its chunk) when the tour cookie says the tour has been
      seen — implemented 2026-08-05 by scoping the provider to the tour UI itself (`Tour` gate →
      client-only `TourRoot` → `TourProvider` + `TourFlow`), removing it from `ClientConfig`
      entirely. See [decisions.md](./decisions.md).
- [x] **Smooth the drawer close animation** — fixed 2026-08-06. The close was not janky so much as
      absent: `SkillsFilterDropdownMenu` rendered `PortalDrawerWrapper` behind a `drawerIsOpen ?`
      ternary, so closing unmounted the wrapper — and the `AnimatePresence` inside it — in the same
      commit, and `AnimatePresence` cannot animate its own unmount. The wrapper now stays mounted
      and only its children toggle (rendering nothing until hydrated, so the portal's
      `document.getElementById` container stays off the server), which also brings the
      `contextDrawerId` takeover path through the same animation instead of blinking it away. The
      context-drawer path was already correct and was left alone. Separately, the undamped
      `{ bounce: 0, type: 'spring' }` transition became two explicitly-timed ones — a 250ms
      decelerating entrance and a shorter 200ms accelerating exit — which applies to every drawer.
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

- [x] **Restructure the filters trigger/popover** — implemented 2026-08-05 in
      `SkillsFilterDropdownMenu`: a plain, SSR'd `ChartFilterButton` renders at first paint; the
      first click flips local state to lazily mount `SkillsFilterPopover` with the new pass-through
      `initiallyIsOpen` prop so it opens on mount (no second click); hover/focus on the button kicks
      the chunk load via a module-scope `loadSkillsFilterPopover`, and the `dynamic()` `loading`
      fallback renders a disabled `ChartFilterButton` so the button never flashes away while the
      chunk resolves. One addition to the design: the popover's own inner
      `dynamic(() => import('Popover'))` became a static import, because the module is now only
      fetched on intent and a nested lazy chunk would have rendered the trigger as `null` (the exact
      flash being removed) while it resolved. The mobile drawer branch was unchanged.
- [x] **Sidebar/nav presence must not depend on the User-Agent viewport seed** (diagnosed and fixed
      2026-08-06): when the UA-seeded viewport band disagreed with the real width — devtools device
      emulation, a desktop browser resized narrow, iPads with desktop UAs — the server rendered the
      wrong navigation variant and the client corrected it ~1s after paint, mounting (or removing)
      the rail late and pushing the entire content area sideways (mid-correction frames looked like
      overlapping modules). Fixed in `LayoutNavigation`: both variants render unconditionally and
      CSS decides — the rail hides at `max-[450px]` (mirroring `MobileNavigationCutoff`, as
      `LayoutMenuButton` already does) and the slide-out menu renders nothing until the cutoff-gated
      hamburger opens it. `Sidebar` also became a static import so the rail is never a lazily-loaded
      hydration ancestor. Verified headlessly: mobile-UA at 677px now paints the 60px rail in the
      first frame with no subsequent horizontal shift, and 390px keeps the rail `display: none`
      throughout. Trade-off: phones now download the small sidebar chunk and carry its hidden DOM.
- [x] **Audit and align the other floating triggers to the same convention** — "the trigger renders
      eagerly and server-side; the floating content is a lazily-loaded chunk fetched on intent and
      mounted open" — done 2026-08-06:
  - `CompaniesSchoolsDropdownMenu` **turned out to be dead code**: all of its files have zero
    importers anywhere in `src/`, so it reaches no page and is tree-shaken out of every bundle. The
    recorded defect (the whole floating, trigger included, behind `ssr: false`) was therefore real
    but had no user-facing cost, and the "resume pages" attribution was wrong — `/resume/experience`
    renders only `ExperienceTimeline`. Aligned anyway, at the developer's direction, so the module
    is ready if it is ever wired up: a new `CompaniesSchoolsTrigger` is shared between the eager
    pre-mount render and the popover-anchored one, a new client `CompaniesSchoolsMenu` owns the
    trigger and lazily mounts the floating with a new `isInitiallyOpen` pass-through on first click
    (preloading the chunk on hover/focus), and the now-redundant `DynamicCompaniesSchoolsFloating`
    was removed. `index.tsx` carries a docstring recording that nothing currently renders it. Not
    runtime-verifiable for the same reason it is dead.
  - Already conforming (trigger outside the lazy module): `ClientSiteDropdownMenu` (eager
    `IconButton`, lazy `SiteMenu`), `UploadResumeDropdownMenu` (eager `DropdownMenu` + trigger, lazy
    `UploadResumeMenu` content behind the open toggle).
  - `Tooltip` lazily imports `Popover` _without_ `ssr: false`, so tooltip triggers still SSR —
    acceptable as-is; note the chunk is a lazy ancestor of the trigger during hydration, which has
    been benign because the chunk is tiny.
- [x] **Fix the frozen selects / stray clear icon on first popover open** (diagnosed and fixed
      2026-08-05): until a data-backed select's SWR response arrived, three separate mechanisms made
      it inert — `SelectPopover` hard-disabled its `Popover` when `isReady === false`,
      `DataSelectBase` disabled the input while `modelValue === NOTSET`, and
      `ClientEducationSelect`/`ClientExperienceSelect` passed `isLocked={isLoading}`. The third of
      those was misdiagnosed and the selects stayed frozen; see the entry below. The same pre-data
      window showed a stray clear `xmark` because `NOTSET` failed `DataSelectInput`'s
      `showPlaceholder` check. Fixed by: (a) treating `NOTSET` as placeholder-visible in
      `DataSelectInput`; (b) an `isAwaitingData` state in `DataSelectBase`
      (`isReady === false && isInputLoading`) that lifts the popover and input gates while the data
      is visibly loading — the menu shows its loading indicator when opened pre-data — while
      preserving the hard gates for not-ready states with no loading signal; (c) un-tying `isLocked`
      from `isLoading` in the two selects the filter form uses; and (d)
      `preloadSkillsChartFilterData()` — SWR `preload` of the educations/experiences keys — fired on
      the filter trigger's hover/focus/click so the data is cached or in flight before the form
      mounts.
- [x] Follow-up to the select fix — done 2026-08-06: the other six data-backed selects
      (`ClientCourseSelect`, `ClientSkillsSelect`, `ClientSchoolSelect`, `ClientProjectSelect`,
      `ClientRepositorySelect`, `ClientCompanySelect`) were aligned with the same pattern, so
      `isLocked` is no longer tied to `isLoading` in any data-backed select.
- [x] **The selects were still frozen on first open, permanently** — root cause found and fixed
      2026-08-08. The symptom the earlier fixes never addressed: on the first open after a page
      load, the two data-backed selects were inert **indefinitely** — no spinner, no error, the
      placeholder showing — and only became interactive after the popover was closed and reopened.
      Browser instrumentation established that the data path is healthy: both preloaded requests
      resolve (10 experiences, 3 educations), `error` stays `undefined`, and `isLoading` goes
      `false`. The freeze is entirely downstream of the data.

  The cause is a latched effect in `src/components/input/select/hooks/use-data-select.ts`.
  `modelValue` initializes to `NOTSET` whenever `isReady` is `false`, and the only thing that
  computes it afterwards was an effect keyed on `[isReady]` alone. For asynchronously loaded data
  the two inputs it needs never arrive in the same pass:

  1. Data undefined → `isReady === false`. `useSelect` initializes its value to `NOTSET`;
     `useDataSelect` initializes `modelValue` to `NOTSET`.
  2. Data arrives → `isReady` flips to `true`, so both effects re-run. `useSelect`'s effect sets the
     value, but the value read by `useDataSelect`'s effect in that same pass is **still** `NOTSET`,
     so its `value !== NOTSET` guard fails and it does nothing.
  3. The value is now set, but `isReady` did not change, so the effect never runs again.
     `modelValue` stays `NOTSET` for the lifetime of the select.

  `DataSelectBase` disables the input on `modelValue === NOTSET && !isAwaitingData`, and
  `isAwaitingData` is false once loading ends — hence permanently inert, with no loading or error
  signal to explain it. Reopening works because the remount finds the data cached, so `isReady` is
  `true` on the first render and the `useState` initializer computes `modelValue` synchronously.

  Fixed by keying the effect on `[isReady, value, modelValue]` and guarding it on
  `modelValue === types.NOTSET`. The guard confines it to initialization, so a `value` prop rebuilt
  on each render cannot drive a render loop through `setValue` — and it leaves the effect's behavior
  after initialization exactly as it was.

- [x] **The `locked()` mixin targeted the wrong selector list** — fixed 2026-08-08. Found while
      investigating the above; a real defect, but **not** the cause of the freeze. `locked()` in
      `src/styles/partials/mixins/_index.scss` was a copy-paste of `loading()` and applied itself to
      `$loading-selectors`, so `[data-attr-locked="true"]` had no effect on an input at all while
      `[data-attr-loading="true"]` carried the `pointer-events: none !important`. That inverts the
      premise the 2026-08-05 fix was written against — its comments claimed "locked removes pointer
      events" — though since the freeze outlives the loading window, this was never what the user
      was hitting.

  Fixed by pointing `locked()` at `$locked-selectors`, and by exempting `.select` from the loading
  gate in `src/styles/globals/components/input/input.scss` — a select has to be openable mid-load
  because its menu is where the loading state lives. Every other input stays inert. The inverted
  premise is corrected in the eight `Client*Select` comments.

  Note that fixing `locked()` makes `isLocked` live for the first time across menus, tables, buttons
  and inputs. Nothing passes `isLocked={isLoading}` any more, so no select regresses, but other
  `isLocked` call sites that have been silently interactive will now correctly become inert.

- [x] **`ClientEducationSelect` menu clipped in the filters popover** — fixed 2026-08-08. It was the
      one select in `SkillsChartFilterForm` without `isInPortal`, so its menu was clipped by the
      popover's `overflow-y-auto`.

- [ ] **Debounce filter form changes** (added 2026-08-05, developer request): apply select changes
      to the chart only after a debounce threshold (they currently fire a refetch per change), and
      flush any pending changes when the popover closes. Interacts with the URL-driven-filters
      question in [open-questions.md](./open-questions.md) — if filters move to the URL, the
      debounce becomes "batch locally, flush to the URL".
- [ ] **Filters popover select-data performance** — deferred 2026-08-06 (investigation item): the
      trigger's hover/focus/click preload now warms the SWR keys, which covers the popover's own
      needs in practice; revisit the promise-streaming pattern below together with the URL-driven
      filters question in [open-questions.md](./open-questions.md), since both reshape the same data
      flow. Original investigation: the React 19 promise-streaming pattern — the `@chart` server
      page starts these fetches **without awaiting** and passes the promises as props across the
      client boundary; the popover's selects `use()` them inside a `Suspense` boundary so the data
      resolves in the background (started at request time, ahead of any interaction) and is awaited
      only when the popover actually opens. Considerations: promise props must be started
      per-request (no module-level caching), rejected promises need an error boundary in the
      popover, and the win should be measured against simply prefetching the SWR keys on trigger
      hover/focus (a much smaller change that composes with the restructure above).

## Phase 3 — Unblock Route Streaming (Caching)

Cross-request caching with CMS revalidation for both fetches (decided 2026-08-04).

- [x] Inventory the CMS mutation actions that can change the cached data — done 2026-08-06. Resume
      side: upload/update/delete. Project side: `createProject`, `updateProject`, `deleteProject`,
      `deleteProjects`, `showProjects`, `hideProjects`, `highlightProjects`, `unhighlightProjects` —
      all eight invalidate, including the two highlight toggles, which the navigation does not
      actually read. Over-invalidating on a rare admin action costs one query; maintaining an
      exclusion list costs a correctness bug the first time the projection changes.
- [x] `/projects/*` layout — done 2026-08-06, using `updateTag` rather than `revalidateTag`, whose
      Next 16 signature now requires a cache-life profile. The layout's per-request `fetchProjects`
      call became `getNavigationProjects` (`src/actions/projects/get-navigation-projects.ts`): an
      `unstable_cache` read tagged `navigation-projects` with a 1h safety TTL, projected down to the
      four fields the navigation and the slug reconciliation actually use (`name`, `shortName`,
      `slug`, `visible`). The projection is deliberately free of `Date` fields, so unlike the resume
      and profile reads it needs no superjson round trip through the JSON-serializing cache. Every
      `/projects/*` route previously paid a blocking database round trip in its layout before
      rendering.
- [x] Header `SiteDropdownMenu` + `ProfileSection` — done 2026-08-06: `getPrimaryResume`
      (`src/actions/resumes/get-primary-resume.ts`) and `getProfile` now read through
      `unstable_cache` (tags `primary-resume` / `profile`, 1h safety TTL), storing superjson payload
      strings so `Date` fields survive the JSON-serializing cache
      (`serializeForCache`/`deserializeFromCache` in `src/api/serialization.ts`). The resume
      mutations (upload/update/delete) call `revalidateTag('primary-resume')`. The header's Suspense
      fallback is now a dimensionally-matched `HeaderSkeleton` (was `null`, which made the header
      content "disappear and reappear" on refresh), and `SiteDropdownMenu` starts the cached read
      before awaiting `auth()`.

## Phase 3b — De-Clerk the Header (added 2026-08-06, developer request)

- [x] Remove auth awareness and Clerk entirely from the header and its dropdown: no sign-in button,
      no org view, no profile popover/hamburger dropdown. Replace with an icon button and a button
      (or two icon buttons) that view/download the primary resume directly. Restrict Clerk usage
      entirely to the admin CMS routes. (Supersedes most of `ClientSiteDropdownMenu`/`SiteMenu`; the
      cached `getPrimaryResume` read carries over.) Implemented 2026-08-08: new server component
      `SiteResumeActions` (view button + download icon button) in the header and the slide-out
      `SiteMenu`, which is now server-rendered; `SessionClerkProvider` unmounted from `AppConfig`,
      so no `(site)` route pulls clerk-js. Twelve components/providers/hooks deleted.

**Resume selection made resilient (2026-08-08).** The header actions were rendering nothing because
no resume in the database carries `primary: true` — a pre-existing condition, not a regression: the
deleted `SiteDropdownMenu` read the same `getPrimaryResume()` behind the same `resume ? … : null`
guard and would have shown an empty menu body too. `getPrimaryResume` now orders by
`[{ primary: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }]` and takes the first, so the flag is
an override rather than a requirement and the most recent resume stands in when nothing is flagged.
It returns `null` only when no resumes exist at all.

**Follow-up opened by this change — there is now no sign-out anywhere in the app.** `SignOutButton`
was only ever rendered in the site menu, and the item above did not ask for a replacement.

- [ ] **Later — restore a sign-out affordance.** Deferred 2026-08-08 (developer decision: not needed
      for now). Deliberately not scheduled against any phase; pick it up when the admin CMS is next
      worked on. It needs a new tab component, a registry icon, and a `ClerkProvider` on `/admin/*`,
      which is why it is not a one-line addition. Nothing is broken in the meantime: session refresh
      is handled server-side by `clerkMiddleware`, so the CMS works without clerk-js, and signing
      out can be done through Clerk directly.

**Collateral:** the site tour hard-depended on the removed dropdown (it clicked
`#site-dropdown-menu-button` and ran a `MutationObserver` for `#site-dropdown-menu-resume-item`).
`use-tour.ts` is now a presence check on `#site-resume-actions`, with the observer, `waitingForTour`
state, and the 1s/2s timeouts removed; `TourProvider`'s first step retargeted with new copy.

## Phase 4 — Bundle & Payload

- [x] `GreenBudget`: remove `'use client'` from the page component (push the forcing hook into a
      leaf), matching the `Website` page's server-component pattern. Done 2026-08-08 — no hook
      needed moving; the forcing hooks already lived in the leaf `Disclaimer.tsx`, so the directive
      was vestigial and was dragging the whole GreenBudget subtree into the client bundle.
- [x] Trim server→client serialization on project pages: pass only the fields the components read
      instead of the full project record with relations. Done 2026-08-08 — new
      `src/actions/projects/get-page-project.ts` (modeled on `get-navigation-projects.ts`) replaces
      the four pages' shared `include: { repositories: true, skills: true }` read: project columns
      12→3, repositories 11→3, and skills 20→3. Skills were the real cost, being the only relation
      that crosses into a client component. `convertToPlainObject` dropped from all four pages.
- [x] Project images: pre-convert the `public/projects/` PNGs to WebP/AVIF (decided 2026-08-04) and
      update the `ProjectImage` call sites — **superseded 2026-08-08**. The screen recordings were
      transcoded off animated GIF to `.mp4`/`.webm` (commit `87d31b65`), and the remaining PNGs go
      through `next/image`, which serves WebP from the optimizer by default (`next.config.mjs`
      declares no `images.formats` override). `ProjectImage` now declares its layout width so the
      optimizer can pick a `srcset` entry on merit (commit `f605f402`). Pre-converting the source
      files would not change what the browser receives.
- [x] Project images: `priority` only on the first above-fold image per page; lazy-load the rest —
      done 2026-08-08 (commit `284a4777`).

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
- [x] Retire `FONT_AWESOME_KIT_TOKEN` from the environment config — removed 2026-08-05 from the
      runtime map and validators in `src/environment/index.ts` and from `.env`.
- [x] Ensure `FONT_AWESOME_AUTH_TOKEN` is present in the Vercel/CI build environment — installs now
      pull `@fortawesome/pro-*` packages from the Pro registry. Confirmed 2026-08-08.
- [x] Manual browser check: icon rendering parity across the app (sizes, colors, admin tables,
      toggled icons) and confirmation the hydration error is gone. Confirmed 2026-08-08.

Phase 5 is complete as of 2026-08-08.

## Phase 6 — SSR Viewport Seeding (added 2026-08-04, done with Phase 1)

- [x] Port the craft repo's User-Agent viewport seeding: middleware header, representative device
      widths, `ScreenSizeProvider` context, and `useScreenSizes` seeding with width-derived
      breakpoints. Verified: mobile User-Agent receives the mobile nav in server HTML; desktop
      receives the sidebar.

## Phase 7 — Final Verification

**Dropped 2026-08-08 (developer decision).** The closing Lighthouse/Speed Insights pass will not be
run; the phase is not being deferred, it is out of scope.

- [~] ~~Re-run Lighthouse/Speed Insights across the audited routes and record the final before/after
  comparison in [status.md](./status.md).~~

## Phase 8 — Static Shell: Cache Components & Viewport Seed Removal (added 2026-08-08)

**This is the immediate next phase.** It takes priority over the remaining Phase 2b filters cluster
(debounced filter changes, select-data performance, and the URL-driven filters question), which
stays deferred until this lands.

### Why

`await headers()` in `src/app/(site)/layout.tsx` is the **only** dynamic-API call under `src/app`,
and it forces every route in the `(site)` group — including the fully static project pages — to
render dynamically on every request. It exists to seed `useScreenSizes` with a viewport width
inferred from the User-Agent in `src/proxy.ts`.

Removing it unlocks Next 16's `cacheComponents`, which prerenders cached components into the static
shell. Concretely that ends the header's Suspense fallback flashing on every refresh: the header's
reads are already cached (`getProfile`, `getPrimaryResume`), but caching only shortens the
boundary's life — an `await` still suspends, so `HeaderSkeleton` still flushes. Only prerendering
removes it. The de-Clerk work in Phase 3b is what makes this possible at all: the header now has no
per-request input, so its output is identical for every visitor.

### The seed's real footprint

Established by tracing all 11 `useScreenSizes` call sites. Only **four** produce different server
HTML; the rest are behind `dynamic(..., { ssr: false })`, behind `useIsHydrated()`, or short-circuit
on first render. The navigation already does not read the seed at all — `LayoutNavigation` made the
variants CSS-driven on 2026-08-06, which is the precedent for this whole phase.

| Consumer                                        | Seed drives                                                     | Approach       |
| ----------------------------------------------- | --------------------------------------------------------------- | -------------- |
| `ResumeModelHeader`                             | inline `gap`, `maxWidth: calc()`, avatar `size`, `pl-[…]` class | CSS            |
| `ResumeModelHeaderScaffold`                     | the same, in the skeletons                                      | CSS            |
| `SkillsChartModule`, `SkillsFilterDropdownMenu` | a button `size` prop (`xsmall` vs `small`)                      | CSS            |
| `Disclaimer` (GreenBudget)                      | a structurally different subtree                                | needs a design |

The first two are also the largest shift producers: at `size='large'` the avatar is 72px on a
desktop seed and 42px on a mobile one, so a wrong seed costs ~30px of shift per tile plus the text
column's `calc()` and an 80px→50px padding swing.

### Items

- [ ] Convert `ResumeModelHeader` and `ResumeModelHeaderScaffold` off `useScreenSizes` to Tailwind
      responsive/container variants: `ImageSizes`/`ImageGaps` become utility sets, and
      `maxWidth: calc(100% - Npx - Mpx)` becomes `min-w-0 flex-1`. Both already use container
      queries (`@sm/resume-model-tile:pl-[50px]`), so this finishes a conversion that is half done.
      Highest value — do this first.
- [ ] Replace the `isLessThan('md') ? 'xsmall' : 'small'` button sizing in `SkillsChartModule`,
      `SkillsFilterDropdownMenu` and `SkillsFilterPopover` with responsive classes.
- [ ] Move `SkillsFilterDropdownMenu`'s drawer-vs-popover branch behind hydration and read
      `window.innerWidth` directly. The drawer half is already client-only (`PortalDrawerWrapper`
      returns `null` until hydrated), so once the trigger's `size` is CSS-driven the branch
      contributes nothing to server HTML.
- [ ] Decide and implement the `Disclaimer` approach: render both subtrees and CSS-toggle them
      (costs a duplicated `useState` + `AnimatePresence`), or restructure the collapse to be
      CSS-driven (`line-clamp` plus a `<details>`-style toggle) so one tree serves both widths.
      Requires reading the actual copy before choosing.
- [ ] Delete the seed: `getInitialViewportWidth` in `src/app/(site)/layout.tsx`, the
      `x-viewport-device` header in `src/proxy.ts`, `ViewportSeedWidths`/`ViewportDeviceHeader` in
      `src/application/viewport.ts`, and the `seedWidth` prop threaded through `AppConfig` →
      `ClientConfig` → `ScreenSizeProvider`. `useScreenSizes` then starts from a real measurement.
      The remaining readers (`Tour`'s chunk-download gate, `DrawerWrapper`'s click-outside gate) are
      client-only and post-hydration, so `window` serves them directly.
- [ ] Enable `cacheComponents: true` — **top-level** in `next.config.mjs`, not under `experimental`
      (`experimental.cacheComponents` and `experimental.ppr` are both deprecated in 16.2).
- [ ] Migrate the three `unstable_cache` modules to `"use cache"` + `cacheTag` + `cacheLife`:
      `src/actions/get-profile.ts`, `src/actions/resumes/get-primary-resume.ts`, and
      `src/actions/projects/get-navigation-projects.ts`. The superjson round trip
      (`serializeForCache`/`deserializeFromCache`, which exists only because `unstable_cache`
      JSON-serializes and would return `Date` as a string) and the `React.cache` wrapper both come
      out — `"use cache"` uses React serialization and dedupes within a request already. Existing
      `updateTag` calls in the resume mutations keep working unchanged.
- [ ] Remove the header's Suspense boundary in `src/components/layout/Layout.tsx` and delete
      `HeaderSkeleton`, once the header prerenders into the shell.
- [ ] Verify: `next build` reports the `(site)` routes as prerendered rather than dynamic, and the
      header no longer flashes a skeleton on refresh.

### Escape hatch, if some consumer genuinely needs a pre-paint width

An inline blocking script in `<head>` that stamps the real width onto the root element
(`document.documentElement.dataset.device = …`) is static markup, so it prerenders; it runs before
paint, so nothing flashes; and it reports the **real** viewport rather than a User-Agent guess,
which fixes the failure mode `LayoutNavigation` already documents (device emulation, narrow desktop
windows, tablets with desktop User-Agents). Treat it as a fallback, not the plan — the trace
suggests nothing will need it.

### Cleanup to fold in

`MobileNavigationCutoff = 450` in `src/components/constants.ts` is duplicated as bare `max-[450px]`
literals in `LayoutNavigation.tsx` and `LayoutMenuButton.tsx`. 450px is already the Tailwind `xs`
breakpoint, so `max-xs:` expresses the same thing and cannot drift.
