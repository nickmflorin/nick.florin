# Open Questions

Unresolved questions that need discussion before (or during) the implementation phases. When one is
settled, record the outcome in [decisions.md](./decisions.md), clear it here, and unblock the gated
items in [backlog.md](./backlog.md).

## 1. How far should Clerk be scoped back?

Removing the `<ClerkLoaded>` gate (findings.md #1) is settled in direction and does not require a
decision. The open question is whether to go further:

- **Option A — keep `ClerkProvider` app-wide, remove only the gate.** Smallest change. The provider
  itself is cheap on the server; clerk-js still loads on public pages but no longer blocks anything.
  The `Sidebar`/`SiteMenu` `useUser` calls keep working everywhere.
- **Option B — scope `ClerkProvider` to authenticated areas** (e.g. an `/admin` + `/sign-in`
  route-group layout). Public pages ship no Clerk JS at all. Requires the shell components that call
  `useUser` to tolerate rendering outside the provider (or an admin-aware shell variant), and the
  header's user button needs a public fallback.

Option A first is the safe sequencing; B is a candidate follow-up once A is verified. Needs a
decision only if B is wanted.

## 2. FontAwesome: keep the kit script or migrate?

The kit script is an external CDN request that swaps `<i>` tags for SVGs after load — icon pop-in on
every cold visit (findings.md #3). Options:

- Keep the kit (no work, flicker remains, third-party dependency remains).
- Migrate to `@fortawesome/react-fontawesome` with tree-shaken imports, or vendored inline SVGs.
  Removes the flash and the CDN request, but the icon component layer (`src/components/icons/`) is
  built around the kit's name-based API, so this is a real migration, not a swap.

Needs sizing and a decision; not a blocker for the shell fixes.

## 3. Caching policy for layout-level fetches

Findings.md #4 (`/projects/*` nav fetch) and #7 (header resumes query) want caching, but the policy
interacts with the admin CMS:

- `React.cache()` — per-request dedup only. Safe, zero staleness risk, smallest win.
- `unstable_cache` / precomputation with `revalidateTag`/`revalidatePath` wired into the CMS
  mutation actions — cross-request win, but every mutation path that can change the cached data must
  revalidate it, or the nav/menu goes stale.

Needs a decision on which tier each fetch gets, and an inventory of the mutation actions that would
need revalidation calls.

## 4. Why is `isUnoptimized` set on some `ProjectImage`s?

Findings.md #5 wants the Next image optimizer (or pre-converted WebP/AVIF assets) serving the
project screenshots. Some instances explicitly opt out via `isUnoptimized`, and the reason is not
recorded — possibly an optimizer artifact on certain PNGs, possibly Vercel image-transformation
quota. The reason must be established before removing the flag, or the same regression returns.

## 5. Dashboard chart: server-fetched initial data?

Findings.md #3 proposes fetching the default-filter skills dataset in the `@chart` server page and
passing it as SWR `fallbackData`. Trade-off: the chart paints with the page, but the `@chart` slot
becomes a blocking server fetch like the other four slots (mitigated by its `loading.tsx`), and the
fetch is wasted when the user has non-default filters in the URL. Needs a yes/no.

## 6. When should the tour load at all?

`TourProvider` (`@reactour/tour` + skill badges) currently mounts for every user on every page. The
tour is presumably shown once per visitor (cookie-tracked). If so, the provider — not just its chunk
— could be skipped entirely when the cookie says the tour has been seen, at the cost of the provider
tree differing between first and subsequent visits. Needs confirmation of the intended tour behavior
before restructuring.
