# Backlog

The running list of things that need to be addressed, organized by domain. Check items off as they
land (`[x]`), and add new items to the appropriate domain section as they come up (create a new
section if none fits). Research and discovery are concrete task items here, not just implementation
work — most implementation is **gated** on them. When a research item concludes, record the outcome
in [decisions.md](./decisions.md) (and clear any matching entry in
[context/open-questions.md](./context/open-questions.md)); the unlocked implementation work then
proceeds.

Within a section, keep rough priority order (top = sooner). Tag items that block others with
**(blocker)**.

> **Current stance (2026-08-02):** Groundwork only. No schema implementation yet — the Research &
> Discussion items come first.

## Research & Discussion

These are worked like any other task: gather the options, write up a recommendation with trade-offs,
discuss together, then record the outcome in `decisions.md`.

- [ ] **(blocker)** Repo/app structure for automated resume generation: keep everything in this
      single Next.js app, break into a monorepo (e.g. Turborepo with a shared content package), or
      keep a separate generator app. Research what each means for deploys, dependency weight, and
      the fixture-driven iteration loop.
- [ ] **(blocker)** Astro vs. React for the resume renderer: ditch Astro and port to React
      (near-mechanical — resume-gen has no client JS), or keep resume-gen as-is longer. Tied to, but
      distinct from, the repo-structure question.
- [ ] **(blocker)** PDF pipeline research: options for generating the PDF in a deployable way
      (puppeteer-core + `@sparticuz/chromium`, Playwright, a render service, or keeping a local-only
      script). Today's pipeline is a macOS-hardcoded Chrome CLI + pypdf merge and cannot run on
      Vercel. Includes: does browser-based printing even need to run in the deployed app, or is a
      local/CI script acceptable for v1?
- [ ] **(blocker)** `Detail.shortDescription` disposition — the one open question in resume-gen's
      `docs/content-model.md` that changes the schema shape (candidate: a `ContentVariant` table
      keyed by node + channel, which would also solve per-medium content overrides generally).
- [ ] Syndication modeling beyond Detail-replacement: how do `Experience`, `Education`, `Project`,
      `Repository`, `Skill`, `Company`, `School` participate in channels (owner-level `Syndicated`
      fields, per-channel ordering, presentation config like sheets/skill bars)?
- [ ] Fixture ⇄ DB sync design: incremental vs. full dump/reload, conflict handling, id/slug
      stability across environments (resume-gen's deterministic path ids vs. this app's uuids), and
      whether fixtures become the canonical editing surface for Claude-driven iteration.
- [ ] LinkedIn API feasibility: what profile-update surfaces are actually available (official API
      access model, scopes, approval process) — determines how much LinkedIn syndication can be
      automated vs. assisted.
- [ ] GitHub-driven content sync design: the deterministic flows (projects, job info, skills) and
      the Claude-assisted skill-inference flow.

## Data Modeling

_Gated on the Research & Discussion items above — no schema work until those are settled._

- [ ] Land the new content model (`ContentNode`, `NestedContentNode`, syndication enums) in
      `schema.prisma` as parallel models — steps 2–6 of the migration plan in resume-gen's
      `docs/content-model.md`.
- [ ] Replace display-string fields from resume-gen types with real modeling on the way in:
      `dates`/`location` as columns, `logo` → `Company`/`School` relations.
- [ ] Rationalize visibility defaults across existing models (`Company`/`School` have no flag;
      `Project`/`Repository` default hidden; others default visible).
- [ ] Model the sidebar/presentation constructs (`SkillBar` proficiency levels, pill sections,
      `Sheet` pagination) per the syndication-modeling research outcome.
- [ ] Port resume-gen's cascade resolution (`normalize.ts`, `syndication.ts`) into this app's model
      layer — remember channel eligibility is not a row predicate (`WHERE visible = true` is wrong;
      resolution happens in application code).

## Fixtures & DB Sync

- [ ] Implement the bidirectional fixture ⇄ DB sync per the research outcome.
- [ ] Add fixtures for the new content models once they exist.
- [ ] Add a dev-DB `jsonify` script to `package.json` (only `jsonify-prod` exists today). Not gated
      — small standalone improvement.
- [ ] Close fixture coverage gaps: `Detail`/`Experience`/`Education`/`Course` exist only nested
      inside `companies.json`/`schools.json`; `Resume` has no fixture at all.

## Resume Generation

_Gated on the repo-structure, Astro-vs-React, and PDF-pipeline research above._

- [ ] Port the resume rendering (Sheet/Role/Education/Sidebar/SkillBar/Pills components) per the
      renderer decision.
- [ ] Implement the deployable PDF pipeline per the research outcome.
- [ ] Expose generation as a programmatic script that can run against fixture files (no DB).
- [ ] Expose generation in the browser (button → on-the-fly PDF from live DB content).
- [ ] Single-file HTML artifact generation (the emailable `resume.html` equivalent).
- [ ] Revisit hand-assigned pagination (`Sheet`/`pages.ts`) — keep manual, or automate fit detection
      (resume-gen clips overflow silently; nothing checks it).

## Content

_Not gated — these live in resume-gen today and can proceed anytime._

- [ ] Update the Craft role end date (still `Oct 2024 - Present` in resume-gen; last day was
      2026-07-31).
- [ ] Content rewrite against resume-gen's `content/feedback.md` (not started; the model-porting
      pass deliberately changed no wording).
- [ ] Substantiate or drop the "TTI ~60% / LCP ~50%" claim (flagged in resume-gen's
      `content/craft-portfolio.md`).

## Integrations

- [ ] Implement LinkedIn syndication per the feasibility research.
- [ ] Upgrade the GitHub integration: `syncRepositories` only creates missing repos, never updates
      existing rows; response is cast, not validated; client bypasses the shared `HttpClient`.
- [ ] Implement the GitHub → content sync flows per the design research.

## UI Adoption (later phases)

- [ ] Adopt new models in the public site (`src/app/resume/` timelines, dashboard) once the data
      foundation is stable.
- [ ] Migrate the Admin CMS to the new models — **explicitly last**; it stays on old models but must
      keep building.
- [ ] Retire `Detail`/`NestedDetail` and the old visibility booleans once nothing reads them.

## Tooling / Infrastructure

- [ ] Account for schema-evolution taxes when adding new models: `prisma-client.ts` needs manual
      enum re-exports; `patch-generated-client.mjs` must survive Prisma codegen changes.
