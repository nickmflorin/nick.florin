# Decision Log

Every non-trivial decision made on this project gets an entry here, newest first. Each entry records
the decision, the date, the reasoning, and any alternatives that were rejected. This is the file to
consult before re-opening a settled question.

Format:

```
## YYYY-MM-DD — Short decision title

**Decision:** What was decided.
**Why:** The reasoning.
**Alternatives considered:** What was rejected and why (omit if none).
```

---

## 2026-08-04 — Clerk is scoped to authenticated routes (Option B), not just un-gated

**Decision:** `ClerkProvider` moves off the public pages entirely: it wraps only the authenticated
areas (`/admin/*`, `/sign-in`), and the `ClerkLoading`/`ClerkLoaded` gate is removed as part of the
same change. Public pages ship no Clerk JS. The shell components that currently call `useUser`
(`Sidebar`, `SiteMenu`) are refactored so they do not require the provider on public pages —
auth-derived UI state (the admin nav item, the user menu content) comes from the server (`auth()` in
server components) or renders a public fallback.

**Why:** The strongest first-paint outcome for the public pages (resume, projects, dashboard), which
are the pages that matter most for visitors: zero Clerk bytes, zero Clerk CDN dependency.

**Alternatives considered:** Option A (keep `ClerkProvider` app-wide and remove only the gate) was
the smaller, safer diff and was initially recommended as the first step, but it still ships clerk-js
on every public page; the decision was to go straight to the full scoping.

## 2026-08-04 — Dashboard chart gets server-fetched initial data as SWR `fallbackData`

**Decision:** The `@chart` slot's server page fetches the default-filter skills dataset and passes
it to `SkillsChartModule` as SWR `fallbackData`, so the chart paints with the page. Client-side SWR
remains the mechanism for filter changes.

**Why:** Removes the post-hydration chart pop-in (a flicker source). The slot becomes a blocking
server fetch like the other four dashboard slots, which its existing `loading.tsx` skeleton already
mitigates.

**Alternatives considered:** Keeping the chart client-only was rejected; the wasted server fetch
when a user arrives with non-default URL filters was judged an acceptable cost.

## 2026-08-04 — `TourProvider` is skipped entirely once the tour has been seen

**Decision:** When the tour cookie indicates the tour has already been shown, `TourProvider` (and
its `@reactour/tour` chunk) is not mounted at all. It stays a split (dynamic) module for the
first-visit case.

**Why:** Returning visitors — the common case — pay nothing for the tour. The provider tree
differing between first and subsequent visits is acceptable because the tour shows once per visitor.

## 2026-08-04 — FontAwesome migrates off the CDN kit to bundled icons

**Decision:** The FontAwesome kit script is removed and icons migrate to bundled, server-rendered
SVGs (`@fortawesome/react-fontawesome` with tree-shaken imports, or inline SVGs — the concrete
mechanism is settled during implementation). The name-based `icon={{ name: '...' }}` API is
preserved, backed by a map of imported icon definitions. This is its own backlog phase, not a Phase
2 line item, because it touches `src/components/icons/` and every icon call site.

**Why:** Ends the icon pop-in flicker (empty `<i>` tags until the CDN script swaps in SVGs), removes
a render-critical third-party dependency, and ships only the icons actually used instead of the
whole kit.

**Alternatives considered:** Keeping the kit (zero work, flicker remains) and "size it first" (audit
before committing) were both declined; the migration is committed, with the inventory audit
happening as the first step of the migration phase itself.

## 2026-08-04 — Layout-level fetches get cross-request caching with CMS revalidation

**Decision:** Both the `/projects/*` nav fetch and the header `SiteDropdownMenu` resumes query are
cached across requests (`unstable_cache` with `revalidateTag`), with revalidation calls wired into
every CMS mutation action that can change the cached data (project create/update/delete/visibility
for the nav; resume upload/update/delete for the menu). An inventory of those mutation paths is part
of the implementation.

**Why:** Both datasets change essentially never relative to how often they are read; per-request
dedup alone would still pay a database round trip on every page load.

**Alternatives considered:** `React.cache()` per-request dedup only (safe but leaves the win on the
table) and a mixed policy were rejected in favor of cross-request caching for both.

## 2026-08-04 — Project images are pre-converted to WebP/AVIF at the source

**Decision:** The PNG sources in `public/projects/` are pre-converted to modern formats (WebP/AVIF)
rather than relying on removing `isUnoptimized` and letting the Next image optimizer transform them.
`priority` is kept only on the first above-fold image per page; all others lazy-load.

**Why:** Sidesteps whatever prompted the `isUnoptimized` opt-outs (never established) and makes the
served bytes predictable regardless of optimizer behavior or Vercel transformation quotas.

**Alternatives considered:** Investigating the `isUnoptimized` history first, then deciding, was
declined in favor of the approach that works either way.

## 2026-08-04 — Project established; fix order is SSR-first

**Decision:** The audit findings are worked in the phase order laid out in
[backlog.md](./backlog.md): restore SSR (the `ClerkLoaded` gate and the `ssr: false` provider chain)
before any flicker, caching, or bundle work.

**Why:** While those two shell patterns are in place, the server sends no page HTML at all, so no
other first-paint or flicker change is observable or verifiable. The shell fixes are also the
smallest diffs with the largest impact, and every later phase's verification depends on the SSR
baseline they establish.

**Alternatives considered:** Working the findings by route (dashboard, then projects, then resume)
was rejected because every route shares the same shell bottleneck; per-route work first would
optimize pages whose output the browser cannot paint any sooner.
