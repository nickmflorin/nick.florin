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
