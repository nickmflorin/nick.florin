# Open Questions

Unresolved questions that need discussion before (or during) the implementation phases. When one is
settled, record the outcome in [decisions.md](./decisions.md), clear it here, and unblock the gated
items in [backlog.md](./backlog.md).

**No questions are open.** All six original questions were resolved on 2026-08-04 — Clerk scoping
(Option B), FontAwesome (migrate), caching tier (cross-request for both fetches), image formats
(pre-convert to WebP/AVIF), chart initial data (server-fetched `fallbackData`), and tour loading
(skip when seen). The seventh and last — chart filters as URL-driven state with server-side
fetching, added 2026-08-06 — was resolved 2026-08-09: the chart's filters stay client-state, and
URL-driven filter state moves to the skills-enhancements project's master skills page, where it
carries real user value. See [decisions.md](./decisions.md) for each outcome and its reasoning.
