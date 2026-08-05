# Backlog

The ordered list of work items, organized into phases. The phases are sequenced so that the
highest-impact, lowest-risk changes land and are verified first; later phases build on a restored
SSR baseline. Check items off as they land (`[x]`), and add new items as they come up. Items gated
on an entry in [open-questions.md](./open-questions.md) are tagged **(needs decision)**.

Implementation happens on a dedicated branch, not `master`.

## Phase 1 — Restore SSR of Page Content

The two shell fixes from [findings.md](./findings.md) #1–2. Small diffs, outsized impact; nothing
else in this project is verifiable until these land, because no other change affects what HTML the
server sends while these two patterns are in place.

- [ ] Capture the baseline: save the server-rendered HTML (`curl`/view-source) for `/dashboard`,
      `/resume/experience`, and one `/projects/*` page, plus a Lighthouse run, so the after-state
      has something to be compared against.
- [ ] Remove `ClerkLoading`/`ClerkLoaded` from `AppConfig`; render `children` directly under
      `ClerkProvider`.
- [ ] Handle the session-resolving state locally in the Clerk consumers (`Sidebar`, `SiteMenu`):
      render the nav without the admin item (and the menu without user content) until `useUser`
      reports loaded, without layout shift when it resolves.
- [ ] Statically import `MantineProvider`, `NavigationProvider`, `NavMenuProvider`,
      `UserProfileProvider`, and `DrawersProvider` in `ClientConfig` (drop `next/dynamic` and
      `ssr: false`).
- [ ] Keep `TourProvider` split; leave conditional loading to Phase 2 **(needs decision** —
      open-questions.md #6**)**.
- [ ] Verify: server HTML now contains real page content for all three captured routes; no
      hydration-mismatch warnings in the console; auth-gated UI degrades gracefully signed-out and
      signed-in; tour, drawers, and toasts still function. Record results in
      [status.md](./status.md).

## Phase 2 — Eliminate Remaining Flicker

- [ ] Dashboard chart initial paint: fetch the default-filter skills dataset in the `@chart` server
      page and pass it as SWR `fallbackData` **(needs decision** — open-questions.md #5**)**.
- [ ] Replace the resume pages' generic `<Loading />` fallbacks with layout-matching skeletons
      (timeline-shaped, like the dashboard slots' tile skeletons).
- [ ] Tour: skip mounting `TourProvider` when the tour cookie says it has been seen **(needs
      decision** — open-questions.md #6**)**.
- [ ] FontAwesome icon pop-in: size and decide the migration away from the kit script **(needs
      decision** — open-questions.md #2**)**. Implementation may become its own phase if the
      migration is chosen.

## Phase 3 — Unblock Route Streaming (Caching)

- [ ] Decide the caching tier for layout-level fetches **(needs decision** — open-questions.md
      #3**)**, including the inventory of CMS mutation actions that must revalidate.
- [ ] `/projects/*` layout: cache the nav/slug-validation `fetchProjects` call per the decision.
- [ ] Header `SiteDropdownMenu`: cache the resumes query per the decision, revalidated by the resume
      upload/update/delete actions.

## Phase 4 — Bundle & Payload

- [ ] `GreenBudget`: remove `'use client'` from the page component (push the forcing hook into a
      leaf), matching the `Website` page's server-component pattern.
- [ ] Trim server→client serialization on project pages: pass only the fields the components read
      instead of the full project record with relations.
- [ ] Project images: `priority` only on the first above-fold image per page; lazy-load the rest.
- [ ] Project images: establish why `isUnoptimized` is set **(needs decision** — open-questions.md
      #4**)**, then either drop it or pre-convert the PNG sources to WebP/AVIF.

## Phase 5 — Follow-ups (candidate, not committed)

- [ ] Scope `ClerkProvider` away from public routes entirely **(needs decision** — open-questions.md
      #1, Option B**)**.
- [ ] Re-run Lighthouse/Speed Insights across the audited routes and record the final before/after
      comparison in [status.md](./status.md).
