# Project Status

_Last updated: 2026-10-03_

## Phase

**Phase 0 — Design (2026-10-02 to 2026-10-03), complete.** All ten design questions are settled and
recorded in [decisions.md](./decisions.md); [open-questions.md](./open-questions.md) is empty.
Nothing has been built yet. Phase 1 is the v1 build.

## Done

- 2026-10-02: Project folder created; registered in `docs/index.md`. Decided: the tooling is
  committed here with personal data outside the repository; a human submits every application;
  external applications are staged by applicant tracking system; private data lives in iCloud Drive;
  preferences split into hard filters and soft signals; Claude derives the searches and learns
  preferences from review.
- 2026-10-03: Stage 1 (foundations) written on `job-applications/foundations`: `JOBS_DATA_DIR` in
  the typed environment, the data-directory resolver and its outside-every-repository guard, the
  preferences, answers and ledger schemas, the ledger storage port and YAML adapter, and unit tests
  for each under `src/__tests__/unit/scripts/job-search/`. Verified the same day: `tsc`, ESLint and
  cspell clean, all unit suites passing, and the configured `JOBS_DATA_DIR` resolved end to end
  against the real environment. The `answers.yaml` shape was approved.
- 2026-10-03: Decided: the data folder moves to `job-search/ai/`; setup fills only missing fields
  and each run confirms or overrides; fit scoring by a Sonnet agent with tunable thresholds; daily
  limits and pacing enforced by the cli; the ledger is YAML files behind a storage port; a dedicated
  Chrome profile at `~/job-search/profiles/chrome`; cover letters only where the form asks; v1
  attaches one explicitly approved resume. Phase 0 complete.

## In Progress

- Nothing yet.

## Next

The v1 build, in dependency order (items in [backlog.md](./backlog.md)):

1. **Foundations** — done 2026-10-03.
2. **Deterministic commands** — the `jobs` command group: hard filters, dedupe, the daily budget and
   cooldown, the profile digest, `jobs resume approve` (with the provenance sidecar in
   `resume:generate`).
3. **Browser and discovery** — the `job-search-browser` server; LinkedIn recommendations and
   generated searches, read in two passes; logged-out detection.
4. **Judgment and orchestration** — the `job-screener` agent, the orchestrating skill (setup,
   per-run confirmation, review queue) and the guardrail rules. End to end through the review queue,
   before anything touches a form.
5. **Applying** — Easy Apply filling, external-posting classification and answer packets, cover
   letters.
6. **Learning** — search yield tracking, review reasons and proposed preference edits.
