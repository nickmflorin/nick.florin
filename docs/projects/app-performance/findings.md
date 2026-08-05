# Performance Audit Findings — 2026-08-04

The record of the full performance audit of the application shell, providers, and the dashboard,
resume, and projects routes. Each finding states what was found, why it is a problem, and what the
fix direction is. The final section records what was audited and found to be **fine**, so that
future sessions do not re-litigate it.

Severity reflects expected user-facing impact on first paint, flicker, and payload size.

## Critical

### 1. `<ClerkLoaded>` gates the entire app — the server renders a spinner, not the page

**Where:** `src/components/config/AppConfig.tsx`.

**What was found:** The whole app renders inside `<ClerkLoaded>`, with `<ClerkLoading>` rendering
`<Loading fillScreen isLoading />`. Clerk never "loads" during server rendering, so the initial HTML
for **every** route — public resume pages, project pages, the dashboard — is a full-screen spinner.
Content appears only after clerk-js (an external CDN bundle) downloads and initializes in the
browser.

```tsx
// The shape as found: `children` (the entire app) is unreachable until clerk-js loads client-side,
// so the server-rendered document contains only the spinner.
export const AppConfig = ({ children }: AppConfigProps): JSX.Element => (
  <ClerkProvider afterSignOutUrl={AfterSignOutUrl}>
    <ClerkLoading>
      <Loading fillScreen isLoading />
    </ClerkLoading>
    <ClerkLoaded>
      <CookiesProvider>
        <ClientConfig>{children}</ClientConfig>
      </CookiesProvider>
    </ClerkLoaded>
  </ClerkProvider>
);
```

**Why it is a problem:** First paint of actual content is deferred behind a third-party script on
every page, including pages that need no authentication at all. It is also the primary source of the
observed load flicker: spinner → content pop-in on every navigation that hits the server.

**Fix direction:** Remove `ClerkLoading`/`ClerkLoaded` from `AppConfig` and render `children`
directly under `ClerkProvider`. The only shell components that consume Clerk state are `Sidebar` and
`SiteMenu` (both via `useUser`); each should handle the "session still resolving" state locally
(e.g. render the nav without the admin item until loaded). Whether `ClerkProvider` itself should
also be scoped away from public routes is an open question (see
[open-questions.md](./open-questions.md)); removing the gate does not depend on it.

### 2. Every provider in `ClientConfig` is `dynamic(..., { ssr: false })`, disabling SSR for the whole subtree

**Where:** `src/components/config/ClientConfig.tsx`.

**What was found:** Six providers — `MantineProvider`, `NavigationProvider`, `NavMenuProvider`,
`UserProfileProvider`, `DrawersProvider`, `TourProvider` — are imported with
`dynamic(..., { ssr: false })` and nested one inside the next. A `ssr: false` component is not
rendered on the server, and neither are its children, so **none** of the server-component work the
pages do (dashboard slot fetches, timelines, project pages) produces paintable HTML. The nesting
also makes the providers load as a sequential chunk waterfall on the client: each provider's chunk
must resolve before the next one mounts.

```tsx
// Disallowed: `ssr: false` excludes the provider — and therefore everything nested under it,
// which is the entire page — from the server-rendered HTML. The provider is a trivial context
// wrapper; the dynamic() machinery costs more than the import it defers.
const NavMenuProvider = dynamic(
  () => import('./NavMenuProvider').then(mod => mod.NavMenuProvider),
  { ssr: false },
);

// Correct: a static import server-renders the provider and its subtree; the module is small
// enough that splitting it buys nothing.
import { NavMenuProvider } from './NavMenuProvider';
```

**Why it is a problem:** This single pattern converts the entire RSC application into a
client-rendered one. Combined with finding 1, the page content cannot appear until hydration plus
six sequential dynamic imports complete. It is an anti-optimization: `NavigationProvider`,
`NavMenuProvider`, `UserProfileProvider`, and `DrawersProvider` are trivial `useState`/context
wrappers of a few hundred bytes each — the `next/dynamic` machinery costs more than it saves.

**Fix direction:** Statically import the cheap providers (and `MantineProvider`) in `ClientConfig`
so they server-render. `TourProvider` is the only genuinely heavy one (`@reactour/tour` plus
skill-badge components); keep it split, and preferably load it conditionally — only when the tour
cookie indicates a tour will actually show (see [open-questions.md](./open-questions.md)).

## High

### 3. Flicker sources beyond the shell

- **FontAwesome kit script** (`src/app/(site)/layout.tsx`): icons are `<i>` tags replaced with SVGs
  (`data-auto-replace-svg='nest'`) after an async external CDN script loads. Icons pop in late on
  every cold load. Migrating to `@fortawesome/react-fontawesome` or inline/self-hosted SVGs would
  remove both the flash and the third-party request (decision required — see
  [open-questions.md](./open-questions.md)).
- **Dashboard chart fetches client-side** (`src/features/skills/components/SkillsChartModule.tsx`):
  the `@chart` slot's data comes from a SWR `useSkills()` call after hydration, so the chart area
  renders a loader and pops in. The initial (default-filter) dataset could be fetched in the
  `@chart` server page and passed as SWR `fallbackData`, painting the chart with the page while
  keeping client-side refetch on filter changes.
- **Generic loading fallbacks**: the resume pages' `loading.tsx`/`Suspense` fallbacks are a bare
  `<Loading />` spinner rather than layout-matching skeletons, so content jumps when it streams in.
  (The dashboard slots already do this well with tile skeletons.)

### 4. `/projects/*` layout blocks every project page on an uncached fetch

**Where:** `src/app/(site)/projects/layout.tsx`.

**What was found:** The layout awaits `fetchProjects` (admin visibility, `strict: true`, all
projects) on every request purely to build the tab navigation and validate hard-coded slugs. Each
project page then separately queries its own project with `repositories` and `skills` included.

**Why it is a problem:** The nav data changes essentially never, yet it gates streaming of every
`/projects/*` page on a database round trip.

**Fix direction:** Cache the nav fetch — `React.cache()` for per-request dedup at minimum;
`unstable_cache` (or a precomputed structure) for cross-request caching, with revalidation wired to
the admin CMS mutations. The caching policy is an open question because it interacts with how CMS
edits propagate (see [open-questions.md](./open-questions.md)).

### 5. Project images: multi-megabyte PNGs, `priority` on every instance

**Where:** `public/projects/` (31 PNGs, 128KB–3.3MB) rendered via
`src/features/projects/components/ProjectImage.tsx`.

**What was found:** Every `ProjectImage` sets `priority`, several set `isUnoptimized` (shipping the
raw PNG), and the largest assets are 2.3–3.3MB. `priority` disables lazy loading and marks the image
for eager preload — applied to every image on a page, it front-loads megabytes of below-fold
content.

**Why it is a problem:** Likely the single largest byte-count cost in the app. Eagerly loading all
images competes with above-fold content for bandwidth on exactly the pages that are otherwise
static.

**Fix direction:** `priority` only on the first above-fold image per page; lazy-load the rest.
Convert sources to WebP/AVIF or drop `isUnoptimized` so the Next image optimizer serves modern
formats (need to first establish why `isUnoptimized` was set — see
[open-questions.md](./open-questions.md)).

## Medium

### 6. `GreenBudget` is a client component for purely static content

**Where:** `src/features/projects/components/pages/GreenBudget/index.tsx`.

**What was found:** The component carries `'use client'`, so all of its section components ship as
client JS, and the full project record — including `repositories` and `skills` relations — is
serialized into the RSC payload to cross the boundary. The `Website` page renders the same
composition as a server component, proving the pattern works without the directive.

**Fix direction:** Remove `'use client'` (pushing whatever hook forced it into a leaf component),
and pass only the fields the page actually reads across any remaining client boundary rather than
the whole record.

### 7. Header `SiteDropdownMenu` queries the database on every page render

**Where:** `src/features/site/components/SiteDropdownMenu.tsx`.

**What was found:** The server component queries the resumes table (for the resume-download menu
item) on every render of the site header, i.e. every page load.

**Fix direction:** Same caching treatment as finding 4 — `React.cache()` at minimum, with
cross-request caching revalidated by the resume upload/update actions.

## Audited and Fine — Do Not Re-litigate

- **Dashboard route structure** (`src/app/(site)/dashboard/`): five parallel route slots, each with
  its own server fetch and a layout-matching skeleton `loading.tsx`. The slot fetches are
  independent (no waterfall between them). Once SSR is restored (findings 1–2), this route streams
  progressively exactly as intended.
- **Nivo chart splitting**: `SkillsBarChartView` is behind `next/dynamic` (so `@nivo/bar` is its own
  chunk) and the tooltip is split further with `ssr: false`. Correct as-is.
- **Fonts**: Inter via `next/font/google` with `display: 'swap'` and subsetting. No changes needed.
- **Analytics**: Vercel Analytics and Speed Insights are lightweight and placed correctly in the
  `(site)` layout.
- **`(document)` layout** (`src/app/(document)/layout.tsx`): deliberately bare — no providers, no
  Clerk, isolated document stylesheet. Nothing to do; do not add providers to it.
- **Server/client boundary placement**: the conceptual split (server `AppConfig`/`CookiesProvider`
  above a single client `ClientConfig` boundary) is sound; only the `ssr: false` loading strategy
  inside it (finding 2) is the problem.
- **Admin table bodies** are already dynamically imported per resource.
- **`react/lazy` vs `next/dynamic`**: the codebase uses `next/dynamic` exclusively and consistently.
