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
- 2026-10-03: Stage 1 opened as draft PR #5. Stage 2 (deterministic commands) written on the same
  branch: hard filters and triage, the daily budget with pacing and cooldowns, run start and finish,
  the profile digest with derived years of experience, resume provenance captured at HTML emission
  and carried into each PDF, `jobs resume approve`, and deny rules keeping approval from agents.
  `tsc`, ESLint and cspell clean; all 23 unit suites (272 tests) pass; `jobs profile digest`, the
  JSON error path and a full `resume:generate` run verified against the real environment.
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
2. **Deterministic commands** — done 2026-10-03.
3. **Browser, setup and discovery**, split so nothing touches LinkedIn before preferences exist:
   - 3a — done 2026-10-03: the `job-search-browser` server, `~/job-search/` and its README, and
     `jobs search url`.
   - 3b — done 2026-10-03: the setup machinery, and the setup itself, run with Nick, which wrote
     `preferences.yaml` (with generated searches, rewritten as query phrases on 2026-10-04) and
     `answers.yaml` to the private data directory.
   - 3c — in progress 2026-10-04: signed into LinkedIn in the dedicated profile; a first live
     session read the recommendations and one search, triaging the recommendations (6 rejected, 1
     survivor) within 3 page views, and its findings reshaped discovery (see the 2026-10-04
     decision). The discovery procedure is in the `job-hunt` skill; the next step is a full run
     through it.
4. **Judgment and orchestration** — the `job-screener` agent, the rest of the orchestrating skill
   (per-run confirmation, review queue) and the guardrail rules. End to end through the review
   queue, before anything touches a form.
5. **Applying** — Easy Apply filling, external-posting classification and answer packets, cover
   letters.
6. **Learning** — search yield tracking, review reasons and proposed preference edits.
