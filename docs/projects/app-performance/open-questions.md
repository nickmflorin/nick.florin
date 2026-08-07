# Open Questions

Unresolved questions that need discussion before (or during) the implementation phases. When one is
settled, record the outcome in [decisions.md](./decisions.md), clear it here, and unblock the gated
items in [backlog.md](./backlog.md).

**All six original questions were resolved on 2026-08-04** — Clerk scoping (Option B), FontAwesome
(migrate), caching tier (cross-request for both fetches), image formats (pre-convert to WebP/AVIF),
chart initial data (server-fetched `fallbackData`), and tour loading (skip when seen). See
[decisions.md](./decisions.md) for each outcome and its reasoning.

## 1. Chart filters: URL-driven state with server-side fetching? (added 2026-08-06)

Proposed by the developer while testing the popover restructure: wire the filter form so changes
apply to the URL's search parameters (uncontrolled fields), and let the `@chart` server page derive
its skills fetch from those parameters — replacing the client-side SWR refetch cycle. Points to
weigh before deciding:

- The admin tables already follow this pattern (`use-filters.ts`, filters derived from URL search
  params), so it would make the chart consistent with the rest of the app.
- It composes naturally with debounced application: batch changes client-side, flush to the URL on
  close (or after a threshold), and the RSC refresh re-renders the chart server-side.
- It addresses the chart-data flow, but **not** the select-option loading burst — the selects' own
  educations/experiences/etc. queries still load on popover open and would still need the
  prefetch/eager-open fix.
- Each URL update triggers an RSC round trip for the slot; needs the deterministic skeleton /
  `keepPreviousData`-equivalent story so the chart does not flash to a fallback on every change.

Decision pending — do not implement without explicit confirmation.
