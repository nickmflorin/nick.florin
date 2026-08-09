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

## 2026-08-09 — Skeletons approximate; they never query to become exact

**Decision:** A loading skeleton reserves the shape of what it replaces only as far as that shape is
derivable for free — from the components it stands in for, the typography scale, and the stylesheet.
It never reads data in order to be accurate, and it is not expected to model a page in full. The
`/projects/*` skeletons in particular model a prefix of each page (GreenBudget 2 of 3 top-level
sections, ToolTrack 3 of 6, Website 2 of 4) and flatten prose/media interleaving into all prose then
all media; both are accepted, not defects to be fixed.

**Why:** A skeleton exists so that the page can be painted before its data arrives. A skeleton
accurate enough to require that data would have to wait for it, which forfeits the only thing it is
for. Past that point, fidelity trades against the very latency the fallback was introduced to hide.
The reserved height being approximately right is what prevents the shift that matters; the residual
reflow below the modeled prefix costs less than a round trip would.

**Alternatives considered:** Deriving the counts from the rendered content — rejected, it makes the
fallback depend on the data. Measuring the real page once and hard-coding exact per-page geometry —
rejected, it is a second copy of the layout that drifts silently the moment the copy changes, which
is precisely what the 2026-08-09 re-derivation had to repair after a prose rewrite.

---

## 2026-08-05 — The show-more link is an overlay on the clamped text, not a flow element

**Decision:** `WithShowMore` no longer decides the link row's _existence_ from the truncation
measurement. While collapsed, the link is absolutely positioned over the end of the description's
last visible line with a gradient fade masking the text beneath (the Instagram/YouTube "… more"
pattern); the post-mount `ResizeObserver` measurement toggles only its visibility, which has no
layout consequence. Expanded state (always a user action, never first paint) renders "Show less" in
normal flow beneath the text.

**Refinement (same day):** the overlay is additionally hover-gated so it is _never_ present at first
paint (the initial appear-then-retract flash was still visible on non-truncated text): truncation
now initializes `false` in `useControlledTypographyVisibility`, and once the measurement confirms
truncation the link reveals on hover or focus of the description (`group-hover`/`focus-within`, with
an opacity transition). Hover-incapable (touch) devices show the confirmed link outright via
`@media (hover: none)`, since they can never hover it into view.

**Why:** Truncation is a rendered-layout fact the server cannot compute, so the server must assume
it — and any solution where the measurement's answer affects layout shifts the page after hydration.
An overlay owns no vertical space, so the answer cannot move anything, and no blank row is reserved
(the objection to the interim reserved-row fix).

**Alternatives considered:** Reserving the link's row and toggling `invisible` (implemented first;
rejected for its spacing/rhythm cost on non-truncated descriptions). Data-driven truncation
(LinkedIn/Twitter-style character budgets, SSR-exact but heuristic near the wrap boundary) — viable
fallback if the overlay proves fiddly. CSS `scroll-state()` container queries (pure-CSS overflow
detection) — Chromium-only (~68.5% support, no Safari/Firefox), revisit later.

**Follow-ups:** the fade is hard-coded `from-white`; it should become a surface token if
descriptions ever render on non-white backgrounds or a dark theme lands. If the clamp's native
ellipsis doubles up visually with the fade, suppress it and let the fade carry that meaning.

## 2026-08-05 — The dashboard layout is a deterministic grid: viewport decides sizes, content never does

**Decision:** The dashboard's flex layout (content-driven sizing bounded by min/max ranges —
`min-w-[652px]`, `xl:max-w-[1000px]`, `min-h-[200px]`, `grow`) was replaced with a CSS grid whose
tracks are fixed per breakpoint: at `xl`+ the grid fills the viewport-derived content area with
fixed fractional columns (`2fr 1fr 1fr`) and per-column row fractions (`3fr 2fr` / `2fr 3fr`); below
`xl` every module has a fixed pixel height (`420px`; chart `560px`/`440px`) and the page scrolls.
Module frames carry `min-h-0 min-w-0 overflow-hidden` and module content scrolls internally at every
breakpoint. Requirement set by the developer: module sizes must be deterministic for a given
viewport — known at first paint, responsive across viewports, and independent of the content inside
adjacent modules.

**Why:** With flex distribution, every streamed slot re-negotiated sizes with its siblings (skeleton
→ content → chart mount produced multi-step layout jumps on wide screens). Fixed tracks make it
structurally impossible for content to move a module border, which also obsoletes skeleton-height
matching for the dashboard: fallbacks render inside frames that cannot resize.

**Alternatives considered:** Matching every slot's skeleton dimensions to its streamed content
(fragile — content heights vary with data) was superseded by this approach for the dashboard.

**Refinement (2026-08-05, same day):** the education/repositories column uses
`fit-content(50%) minmax(0, 1fr)` instead of `2fr 3fr` — the education module's content is short and
stable, and the fixed fraction left dead space beneath its last item while repositories scrolled.
This is the one deliberate content-dependency in the grid: the shared row edge settles where
education's content ends (capped at half the column), which is acceptable because the education
slot's skeleton renders the same tile count as the real data, so the streamed swap barely moves it.

## 2026-08-05 — `next/dynamic` is not used in server components; static imports replace it

**Decision:** Every `dynamic()` call that lived in a **server** component was converted to a static
import: the dashboard layout's `Tour`, `TimelineItem` in both resume timelines, `Timeline` in
`CommitTimeline`/`DetailsTimeline`, and the six admin `@table` body wrappers. The error's hydration
diff identified the mechanism precisely: in an RSC, `dynamic()` wraps the component in a
`PreloadChunks` + `Suspense` layer whose boundary markers land in the server HTML; on the client the
module resolves synchronously, no boundary renders, sibling positions shift, and React reports a
mismatch at the next sibling (observed as `+ <div className="content ...">` vs `- <Suspense>` under
the dashboard layout).

**Why:** In server components `dynamic()` buys nothing — a client component imported by an RSC is
automatically code-split per route — and costs this mismatch class. `dynamic()` remains correct
_inside client components_ (the chart, drawers, dialogs, the tour subtree), where it performs real
intra-route splitting.

**Consequence worth keeping:** the registry's runtime guard immediately caught a real bug during
verification — `TimelineIcon` requests `code-commit` in the `solid` style, which the inventory had
attributed to `regular`; `check`, `eye`, and `eye-slash` had the same dual-style usage. All four
were added to the solid registry.

## 2026-08-05 — The tour provider is scoped to the tour UI, not the application

**Decision:** `TourProvider` no longer wraps the page tree in `ClientConfig`. Its only context
consumer is the dashboard's tour UI, so it mounts there instead: `Tour` is a gate (suppress cookie +
screen size, both deterministic between the server render and the client's first render) that
renders a client-only (`ssr: false`) `TourRoot`, which mounts `TourProvider` around `TourFlow` (the
former `Tour` body). This also implements the earlier skip-when-seen decision: a visitor who
dismissed the tour, or a mobile visitor, never downloads the `@reactour/tour` chunk.

**Why:** Keeping the provider as a lazily-loaded ancestor of the whole page made every page's
hydration depend on that chunk resolving before React hydrates the boundary — when it lost the race,
React reported hydration mismatches at the page content (observed in `Content`). A lazy boundary
that wraps no page content cannot cause that class of error, and `ssr: false` is justified there
because the subtree is interactive tour UI only.

**Alternatives considered:** Keeping the provider app-wide but statically imported would fix the
hydration race while putting `@reactour/tour` and the tour's step content in the main bundle for
every visitor; rejected.

## 2026-08-04 — FontAwesome migration (Phase 5) pulled forward and executed in-house

**Decision:** The FontAwesome migration was executed immediately on `perf/restore-ssr` rather than
waiting its turn in the phase order, because restoring SSR surfaced a hydration error the kit script
cannot avoid: with real `<i>` tags now in the server HTML, the async kit script races React's
hydration, and whenever it wins it injects `<svg>` children into DOM React is about to hydrate. The
replacement renders SVGs in React from typed per-style registries
(`src/components/icons/registry.ts` — 43 regular, 5 solid, 4 brands definitions from
`@fortawesome/pro-regular-svg-icons`, `pro-solid-svg-icons`, and `free-brands-svg-icons` at 6.7.2),
keeping the kit's `<i class="icon"><svg/></i>` markup shape so the existing icon SCSS applies
unchanged. `IconName` is now derived from the registry keys, so an unregistered icon name is a
compile error. No `@fortawesome/react-fontawesome` dependency was added — the SVG render is ~15
lines against the definition tuple.

**Why:** Fixes the hydration error at its root, removes the render-critical CDN dependency,
eliminates icon pop-in (icons are in the server HTML at first paint), and obsoletes the
double-render `display: none` icon-toggle workaround documented in
`src/styles/globals/components/icons/index.scss` (React re-renders the SVG when the icon prop
changes, which the kit's injected SVGs never did).

**Alternatives considered:** Deferring the kit script until after hydration (a ~15-line stopgap that
restores the pre-SSR status quo, pop-in included) was offered and declined in favor of the terminal
fix.

**Deployment note:** Installing dependencies now requires `FONT_AWESOME_AUTH_TOKEN` (the Pro
registry token already configured in `.npmrc`) to be present at install time — including in
Vercel/CI build environments. `FONT_AWESOME_KIT_TOKEN` is no longer used at runtime and can be
retired from the environment config.

## 2026-08-04 — SSR viewport state is seeded from the request User-Agent (ported from craft)

**Decision:** The fixed desktop assumption briefly used to make `useScreenSizes` SSR-safe was
replaced with the craft repo's approach: the middleware infers a coarse device class
(desktop/mobile/tablet) from the request User-Agent via Next's `userAgent` helper and stamps it on a
forwarded request header (`x-viewport-device`); the `(site)` layout maps the class to a
representative width (1440/390/820 — `src/application/viewport.ts`); `ScreenSizeProvider` seeds a
context with it; and `useScreenSizes` initializes from that context, deriving the breakpoint with
the new width-based `getBreakpointFromWidth`. The server render and the client's first render use
the same seed (no hydration mismatch), and the mount-time resize listener replaces it with the real
window measurements pre-paint.

**Why:** Mobile devices now get the mobile chrome (nav variant) server-rendered instead of a
desktop-assumed render corrected after hydration — verified by curling with an iPhone User-Agent (no
sidebar in the HTML) versus a desktop one (sidebar present).

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
