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

- [x] **(blocker)** Repo/app structure for automated resume generation — resolved 2026-08-03: port
      into this app, no monorepo, resume-gen retires at parity (see decisions.md).
- [x] **(blocker)** Astro vs. React for the resume renderer — resolved 2026-08-03: React Server
      Components in this app (see decisions.md).
- [ ] **(blocker)** PDF pipeline research — direction set 2026-08-03 (v1 is a local script printing
      the served sheet routes with a TS-native merge; deployed on-demand route later), but the
      tooling choice still needs a spike: Playwright vs. puppeteer-core + `@sparticuz/chromium`, and
      the merge library (`pdf-lib`). Today's pipeline is a macOS-hardcoded Chrome CLI + pypdf merge
      and cannot run on Vercel.
- [ ] **(blocker)** `Detail.shortDescription` disposition — the one open question in resume-gen's
      `docs/content-model.md` that changes the schema shape (candidate: a `ContentVariant` table
      keyed by node + channel, which would also solve per-medium content overrides generally).
- [ ] Syndication modeling beyond Detail-replacement: how do the other new/parallel models — `Role`
      (succeeds `Experience`), `Degree` (succeeds `Education`), `Competency` (succeeds `Skill`) —
      and `Project`, `Repository`, `Company`, `School` participate in channels (owner-level
      `Syndicated` fields, per-channel ordering, presentation config like sheets/competency bars)?
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
- [ ] Design the `Competency` model — the parallel successor to `Skill` (added 2026-08-02; named
      2026-08-02, see decisions.md). Requirements:
  - More control and output configurability than the current `Skill` model.
  - Same visibility flags as `Role`/`Degree` get in the new model (the `Syndicated` shape:
    `visible` + `excludedChannels[]`).
  - Short label and full label (vs. today's single `label`).
  - Links to other models the same way the current `Skill` does (m2m to `Role`, `Degree`, Course,
    Project, Repository, and the Detail successor `ContentNode`/`NestedContentNode`).
  - Years-of-experience metric (like today's `experience`/`calculatedExperience`), **plus** a
    bucketed familiarity enum that becomes the primary metric going forward — values from
    resume-gen's `Proficiency` type: `FAMILIAR | PROFICIENT | ADVANCED | EXPERT`.
- [ ] Design the `Role` and `Degree` models — parallel successors to `Experience` and `Education`
      (added 2026-08-02, see decisions.md). resume-gen's `Role`/`Degree` types are the starting
      point; decide whether `ContentOwnerType` enum values follow the rename
      (`EXPERIENCE | EDUCATION` → `ROLE | DEGREE`) before the content model lands, since
      resume-gen's target schema currently uses the old names.
- [ ] Model resume sidebar sections (a PDF/HTML-resume-only concept) as a distinct model with
      `name`, `slug`, and competencies — where each `Competency` carries an **optional FK** pointing
      at its resume sidebar section (added 2026-08-02). Maps to resume-gen's `SidebarSection`
      (bars/pills groupings in `src/data/skills.ts`).
- [ ] Replace display-string fields from resume-gen types with real modeling on the way in:
      `dates`/`location` as columns, `logo` → `Company`/`School` relations.
- [ ] Rationalize visibility defaults across existing models (`Company`/`School` have no flag;
      `Project`/`Repository` default hidden; others default visible).
- [ ] Model the remaining presentation constructs (`Sheet` pagination, pill vs. bar rendering) per
      the syndication-modeling research outcome — sidebar sections themselves are covered by the
      item above.
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

_The repo-structure and renderer decisions are made (2026-08-03, see decisions.md); remaining items
are gated only on the PDF-pipeline spike where noted._

- [x] Stub the in-app document shell (done 2026-08-03): moved all existing routes into a `(site)`
      route group (URLs unchanged); added the `(document)` route group with its own bare root layout
      importing only the new `src/styles/document/index.scss` stub; allocated `/documents/resume`
      and `/documents/resume/[sheet]` pages rendering stub components in `src/documents/resume/`;
      protected `/documents(.*)` via the Clerk admin matcher in `src/proxy.ts`. No styles, types,
      modeling or functionality yet.
- [x] Spike: verify the app's PostCSS/Tailwind pipeline does not process the document SCSS in a way
      that reintroduces preflight on document routes (done 2026-08-03, config-level: the global
      PostCSS chain is `tailwindcss` v3 + `autoprefixer`; the v3 plugin only transforms its own
      directives, and preflight enters only via the site's own Tailwind entry, which never loads on
      document routes. Runtime confirmation happens the first time the dev server renders
      `/documents/resume`).
- [x] Port the document styles from resume-gen (done 2026-08-03): full tree in
      `src/styles/document/` (`_variables`, `_fonts`, `_base`, `_page`, `_sidebar`, `_skills`,
      `_pills`, `_role`, `_education`, `_dev-header`), values verbatim but restructured as idiomatic
      SCSS per the 2026-08-03 style-organization decision; Mona Sans vendored at
      `public/fonts/mona-sans/`; `body.stacked` adapted to a `.stacked` wrapper; stub components now
      render `.stacked`/`.page` shells so sheet geometry is verifiable. Standalone `sass` compile
      passes; not yet verified in the running app.
- [ ] Verify the document styles in the running app: `/documents/resume` shows the stacked gray
      backdrop with one white 8.5in × 11in sheet, fonts load, and the site's styles are absent from
      the document routes (and vice versa).
- [ ] Port the resume rendering (Sheet/Role/Education/Sidebar/SkillBar/Pills components) into
      `src/documents/resume/` as React Server Components.
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
