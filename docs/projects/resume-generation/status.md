# Project Status

_Last updated: 2026-08-02_

## Phase

**Phase 1 — Research & Discussion.** Phase 0 (discovery & foundation setup) is complete: both repos
are mapped, project context is established, and the backlog is seeded. We are now in groundwork
mode: **no schema or implementation work yet** — the Research & Discussion items at the top of
[backlog.md](./backlog.md) (repo structure, Astro vs. React, PDF pipeline,
`Detail.shortDescription`, sync design, LinkedIn feasibility) come first and are worked as concrete
tasks: research → written recommendation → discussion → entry in [decisions.md](./decisions.md).

## Done

- 2026-08-02: Project context scaffolding created and moved to `docs/projects/resume-generation/`
  (`README.md`, `status.md`, `decisions.md`, `backlog.md`, `context/`).
- 2026-08-02: Both repos explored and mapped: [context/current-app.md](./context/current-app.md) and
  [context/resume-gen.md](./context/resume-gen.md).
- 2026-08-02: Backlog seeded from discovery findings, organized by domain:
  [backlog.md](./backlog.md).

### Key discovery findings

- **The new content model design already exists** in resume-gen's `docs/content-model.md`: a target
  Prisma schema (`ContentNode`/`NestedContentNode` replacing `Detail`/`NestedDetail`), a
  field-by-field migration table, and a 6-step migration plan. Step 1 (resume-gen's own data) is
  done; steps 2–6 (landing it in this app) are not.
- Distribution flags ended up as `visible: boolean` + `excludedChannels: SyndicationChannel[]`
  (exclusion list, permissive default) — not per-medium booleans like `isLinkedInVisible`.
- resume-gen's model layer (`src/data/*.ts`, `src/lib/*.ts`) has zero Astro coupling and its
  components have no client JS — the React port is near-mechanical. The PDF pipeline (headless
  Chrome CLI + pypdf, macOS-hardcoded) is the real porting decision.
- This app has no LinkedIn integration (just a URL string) and no resume generation of any kind
  (PDFs are manually uploaded to Vercel Blob). GitHub integration is create-only.
- The existing `jsonify` (DB → JSON, prod only) / `seed` (JSON → empty DB) pair is the prior art for
  the required bidirectional fixture sync.

## In Progress

- Nothing actively in progress.

## Next Up

Work through the Research & Discussion section of [backlog.md](./backlog.md), starting with the four
**(blocker)** items:

1. Repo/app structure for automated resume generation (monorepo? separate app? this app?).
2. Astro vs. React for the resume renderer.
3. PDF pipeline options (deployable vs. local-only script).
4. `Detail.shortDescription` disposition.

Schema and implementation work is deliberately deferred until these are decided (see decision dated
2026-08-02 in [decisions.md](./decisions.md)).

## Blockers / Waiting On

- Research items conclude in a discussion with Nick before any decision is recorded — nothing gets
  decided unilaterally.
