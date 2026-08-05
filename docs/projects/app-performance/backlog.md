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

- [ ] Dashboard chart initial paint: fetch the default-filter skills dataset in the `@chart` server
      page and pass it as SWR `fallbackData` (decided 2026-08-04).
- [ ] Replace the resume pages' generic `<Loading />` fallbacks with layout-matching skeletons
      (timeline-shaped, like the dashboard slots' tile skeletons).
- [ ] Tour: skip mounting `TourProvider` (and its chunk) when the tour cookie says the tour has been
      seen (decided 2026-08-04).

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

Committed 2026-08-04 (see [decisions.md](./decisions.md)); its own phase because it touches
`src/components/icons/` and every icon call site.

- [ ] Inventory every icon name and style (solid/brands/etc.) used across the app.
- [ ] Replace the kit-backed icon components with bundled, server-rendered SVGs
      (`@fortawesome/react-fontawesome` tree-shaken imports or inline SVGs), preserving the
      name-based `icon={{ name: '...' }}` API via a map of imported definitions.
- [ ] Remove the kit `<script>` from the `(site)` layout and the `FONT_AWESOME_KIT_TOKEN`
      environment dependency.
- [ ] Verify icons are present in the server HTML at first paint (no post-load swap).

## Phase 6 — Final Verification

- [ ] Re-run Lighthouse/Speed Insights across the audited routes and record the final before/after
      comparison in [status.md](./status.md).
