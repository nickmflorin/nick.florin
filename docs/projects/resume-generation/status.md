# Project Status

_Last updated: 2026-08-11_

## Phase

**Phase 2 — Data Management (begun 2026-08-04).** Phase 0 (discovery & foundation setup) and Phase 1
(research & discussion, with structural stubs) are complete — the generation pipeline is built and
working. This phase's charter is [data-management.md](./data-management.md): Prisma models for the
new schema, YAML fixture files, and the scripts that move content between the two. The fixture
format is decided (YAML — see [decisions.md](./decisions.md)) and the YAML fixtures exist; per the
reordered sequencing, the Prisma schema work comes next. The remaining Research & Discussion items
in [backlog.md](./backlog.md) (`Detail.shortDescription`, sync/destructive-change design, LinkedIn
feasibility) are still worked as concrete tasks: research → written recommendation → discussion →
entry in [decisions.md](./decisions.md).

## Done

- 2026-08-02: Project context scaffolding created and moved to `docs/projects/resume-generation/`
  (`README.md`, `status.md`, `decisions.md`, `backlog.md`, `context/`).
- 2026-08-02: Both repos explored and mapped: [context/current-app.md](./context/current-app.md) and
  [context/resume-gen.md](./context/resume-gen.md).
- 2026-08-02: Backlog seeded from discovery findings, organized by domain:
  [backlog.md](./backlog.md).
- 2026-08-03: Repo-structure and renderer decisions made (in-app port, React, no monorepo;
  `/documents/resume` under a separate `(document)` root layout, auth-gated, UI in
  `src/documents/`).
- 2026-08-03: Document shell stubbed: `(site)`/`(document)` route-group split (URLs unchanged), stub
  pages and components, style-entry stub, Clerk protection for `/documents(.*)`. No styles, types or
  functionality yet.
- 2026-08-03: Document styles ported from resume-gen into `src/styles/document/` per the
  style-organization decision (disjoint trees, no Tailwind, idiomatic SCSS); Mona Sans vendored at
  `public/fonts/mona-sans/`; PostCSS/preflight spike passed at config level; stub components render
  `.stacked`/`.page` shells. Standalone `sass` compile passes; in-app render not yet verified.
- 2026-08-03: Generation pipeline decision superseded the served-routes approach: browserless static
  HTML via `renderToStaticMarkup` + programmatic `sass`, headless Chrome strictly as a file-to-file
  print converter, `pdf-lib` merge. Script pipeline prioritized over in-app embedding.
- 2026-08-03: Renderer and content ported from resume-gen: pure React components in
  `src/documents/resume/components/` (Sheet, Role, Education, Sidebar, SkillBar, Pills, DevHeader,
  ResumeDocument, ResumeDocumentSheet), content types/libraries/data copied to
  `src/documents/resume/{data,lib}/` (content frozen at resume-gen commit `bb6f5fd`), logos vendored
  at `public/documents/logos/`, pages wired with `generateStaticParams`. Not yet verified in a
  running app or compile (per the no-auto-verification rule).
- 2026-08-03: Generation script built and working end to end: `pnpm resume:generate` in
  `src/scripts/generate-resume/`, with per-phase variants (`:html`, `:pdf`, `:artifact`) and a
  `--steps` argument. All three phases verified by running them — the emitted sheets render with the
  correct fonts, logos and skill-bar fills, and the PDF is three pages at exactly 8.5in x 11in.
- 2026-08-03: Module-scope constants convention adopted (PascalCase, not `SCREAMING_SNAKE_CASE`);
  documented in the code-quality rules and applied across `src/documents/resume/` and
  `src/scripts/generate-resume/`.
- 2026-08-04: Fixture format decided — YAML, one file per model, authoring shape, slugs as the
  correlation key with an optional `meta:` identity block and sticky node slugs (see
  [decisions.md](./decisions.md)) — and the YAML fixture files established in
  `src/documents/resume/fixtures/` (`competencies`, `companies`, `schools`, `profile`, `roles`,
  `degrees`, `resume-sheets`), emitted from the TS data modules by `pnpm resume:fixtures`
  (`src/scripts/emit-resume-fixtures.ts`; `yaml` pinned as a devDependency; Prettier is the
  canonical fixture formatter). The sequencing in [data-management.md](./data-management.md) was
  reordered so the YAML definitions precede the Prisma work.
- 2026-08-04: Parallel Prisma schema landed and migrated (see [decisions.md](./decisions.md)): the
  new-model enums and the `Competency`, `Role`, `Degree`, `ContentNode`, `NestedContentNode`,
  `ProfileAboutParagraph`, `ProfileHighlight`, `ProfileContactEntry`, `ResumeSheet` and
  `ResumeCompetenciesGroup` models in `schema.prisma`, transcribed from the rehearsal types;
  additive `slug`/`logoFileName`/`handle`/`photoFileName` columns and reverse relations on
  `Company`/`School`/`Profile`; migration `20260804145452_parallel_content_models` applied to the
  dev database (no drift); client regenerated. The legacy `Degree` enum was renamed `DegreeType`
  (metadata-only `ALTER TYPE` — Postgres shares the type namespace between enums and table row
  types), with the site's seven reference sites mechanically renamed and the new enums added to the
  `prisma-client.ts` re-export list.
- 2026-08-04: Transfer architecture landed in `src/database/content/` (see
  [decisions.md](./decisions.md)): field codecs (validation-only zod schemas + paired
  decode/encode), `RecordCodec`/`PrismaCodec` around a canonical form, one `ContentBinding` class
  per aggregate for all seven entities, the `ContentStore` port with `YamlFixtureStore` and
  `PrismaContentStore` adapters, a dependency-ordered registry, and set-level validation (duplicate
  slugs, cross-references, entity invariants). Verified by round-tripping all seven real fixture
  files: `parse(serialize(x))` deep-equals `x` for every entity, zero validation issues. Database
  writes are create-only; the sync engine (diff, updates, confirmation, script entry point) is the
  next layer. Found and logged: implicit m2m relations lose authored competency ordering (backlog).
- 2026-08-04: Open-question walkthrough (paused partway, resumable): settled destructive-change
  safety (deletes + non-empty overwrites confirm per-batch with a `--yes` bypass and an eventual
  navigable terminal diff viewer; conflicts atomic in v1), sync parity (no soft delete between
  source and target — hard delete with confirmation; `isVisible` is authored state only), and
  per-context text (one variant table for prose + labels, built when the first third context
  arrives). Still unaddressed, in walkthrough order: per-medium display configuration, the
  `competenciesVisible`/pill-syndication flag shape, syndication participation of
  `Project`/`Repository`/`Company`/`School` + `Competency`'s legacy m2m links, the competency
  bucketing/tagging design, resume delivery to readers, LinkedIn feasibility, and GitHub sync
  design.
- 2026-08-04: Slug authoring made optional across the transfer layer (see
  [decisions.md](./decisions.md)): bindings derive a missing slug from the entity's natural name at
  parse time (deterministic, so fixture-only generation and the sync push always agree),
  serialization writes it back (sticky), and `parse` returns a `ParsedRecord` with the slug
  guaranteed. `ResumeSheet` slugs stay required (filename, no natural name). Competency ordering
  also decided the same day: derived per surface (prioritized + `createdAt`; sidebar via the
  generation-time spacing optimization), never stored — pull queries emit competency lists in
  deterministic slug order.
- 2026-08-04: `isHighlighted` semantics decided (see [decisions.md](./decisions.md)): stays a plain
  boolean meaning presence on the website's dashboard page, subordinate to `WEBSITE` syndication —
  inert for records that do not syndicate there. Documented on the rehearsal types
  (`src/documents/resume/data/types.ts`); excluded from the open per-medium display-configuration
  question. Profile field renames also landed: `aboutParagraphs` → `about`, `contactEntries` →
  `contacts` (types, data, renderer, emitter, fixtures).

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

- **Legacy prod data port (JSON → YAML), decided 2026-08-09 via an eight-flag walkthrough** (all
  outcomes in [decisions.md](./decisions.md)): the legacy JSON seed fixtures (confirmed current with
  production) port additively into the YAML fixtures — scope limited to aggregates with successor
  bindings (`Project`/`Repository`/`Course` deferred, their successor design is the next task after
  the port); taxonomy fields held out for the skills audit to redesign; legacy prose merged by
  compare-then-selectively-add with `RESUME`-excluded nodes; `visible: false` → `isVisible: false`
  (one record: the USLege.ai role); no timestamps authored — the sync push gains a requirement to
  seed `createdAt` from legacy counterparts. `Detail.highlighted` / `Detail.shortDescription`
  verified empty across all prod details (nothing ports). Sequencing: **skills audit first**, then
  the port, then byte-equivalence verification of the generated documents. The audit is **done**
  (2026-08-09, eight-stop grouped walkthrough — see decisions.md): the full 158-skill translation
  table lives in [context/legacy-skill-mapping.md](./context/legacy-skill-mapping.md) (67 direct, 31
  folds, 44 new competencies, 13 confirmed drops — as amended 2026-08-10, nine drops reinstated).
  The successor categorization scheme is **still undesigned** — the audit settled membership only.

  **Port execution is underway (2026-08-10).** The route is JSON → TS data modules →
  `pnpm resume:fixtures` → YAML, because the data modules remain the operative source: they retire
  only when the resume can be generated from the Prisma models populated from the YAML fixtures.
  Landed so far, each verified by regenerating the fixtures and diffing the emitted HTML against a
  pre-change baseline (byte-identical both times): the full competency port (133 → 177 records — the
  44 audit additions plus legacy `description`/`experience`/`isHighlighted`/`isPrioritized`
  enrichment on existing records; fold merges OR flags and take the largest experience, and the
  legacy `experience: 0` sentinel is treated as unset), and the USLege.ai company + hidden role
  (`content.isVisible: false`, 14 mapped competency refs, legacy description as its summary). The
  generated-from-data-modules banner was removed from the emitted YAML (emitter no longer writes
  it). The profile field-gap check landed the one additive value (`middleName`); the remaining
  profile conflicts (`intro` vs the authored about paragraphs, legacy `displayName`) belong to the
  prose pass.

  **The association merge also landed (2026-08-10, superseding the same-day deferral — see
  decisions.md):** the syndication cascade now filters every competencies list through `permits()`
  (so chips render only on channels the competency allows), the 44 resume-invisible catalog records
  carry `excludedChannels: [RESUME]`, and all eleven legacy experience + three education skill lists
  are merged into their owners' competencies lists via the mapping table. Verified: the only
  generated-output change is chips (page 1 unchanged, page 2 +117, page 3 +33 — the accepted
  temporary difference; zero non-chip diffs).

  **The prose-comparison pass is complete (2026-08-10, see decisions.md):** ten descriptions and the
  Craft/Northbeam trees proved verbatim-identical to authored content; seven divergent legacy items
  ported as `RESUME`-excluded website nodes (Corsha technical contributions, Nirveda Rebuild,
  Saracen Diff Reporting, Atlantic Accounts API, Rock Creek's three applications); seven superseded
  items were confirmed skipped; `profile.intro` and the JHU `note` ported as unrendered scalars;
  authored `displayName` retained. Generated output verified byte-identical after the prose port.

  **The port is COMPLETE (2026-08-10).** Final chip policy settled by amendment (see decisions.md:
  associations are sacred, chips are expendable — eleven old non-sidebar competencies globally
  `RESUME`-excluded, 55 exclusions total, `django` exempt via its "Django / DRF" sidebar
  representation), and the accepted chip growth forced one pagination rebalance: Saracen moved from
  the page-2 sheet to the top of page-3 (`pages.ts`), restoring all eleven roles across the three
  sheets. The regenerated PDF was reviewed and approved by Nick. Every piece of prod data with a
  home in the new model has moved; the deliberate exceptions remain `Project`/`Repository`/`Course`
  (awaiting model disposition), the skill taxonomy (awaiting the categorization design), and the
  association merge's per-owner chip granularity (with the pill-display-controls backlog item).

- **2026-08-11 sweep — channels inversion + carried-over model membership (see decisions.md):**
  `excludedChannels` → `channels` allowlist (default `[]` = syndicates nowhere) across the schema
  (data-preserving migration `20260811181344`, applied; client regenerated), the document layer
  (explicit owner grants; nodes inherit and may only narrow), and the transfer layer
  (`stampContentTreeChannels` resolves inheritance at parse). `Project`/`Repository`/`Course` are
  now full members: `channels` + competency m2ms + `Course.degreeId` in the same migration, data
  modules generated from the legacy prod JSON through the audit mapping (24 repositories, 4
  projects, 24 courses; hidden records carry no channels), three new fixture files, three new
  bindings in the registry with `Company`-style link-don't-fabricate push semantics. All ten
  entities parse the fixture set with zero validation issues; the emitted resume HTML stayed
  byte-identical through the whole sweep. Proficiency buckets also landed earlier the same day
  (24 → 35 rated, estimated from experience years, signed off with adjustments). The
  `Project`/`Repository`/`Course` exception noted above is thereby closed; the remaining
  deliberate exceptions are the skill taxonomy and per-owner chip granularity.

## Next Up

Priority (decided 2026-08-03): **get the standalone generation script working before finishing the
in-app embedding.** The pipeline design is settled — browserless static HTML via
`renderToStaticMarkup` + programmatic `sass`, then headless Chrome as a file-to-file
`--print-to-pdf` converter merged with `pdf-lib` (see decisions.md). In order:

1. ~~Port the rendering components as pure React~~ (done 2026-08-03).
2. ~~Port resume-gen's content types/libraries and data modules~~ (done 2026-08-03).
3. ~~Build the generation script: static HTML emission, PDF conversion, single-file artifact~~ (done
   2026-08-03).
4. Verify the document render in the running app (`/documents/resume`). The script proves the
   components and styles are correct; what remains unverified is Next's own handling of them —
   route-group style isolation and font serving from `public/`.
5. Compare the generated PDF against resume-gen's output for parity, then retire resume-gen.

Newly open, and worth settling before any more generation work: **how a generated resume actually
reaches a reader** (see [context/open-questions.md](./context/open-questions.md)). The original
sketch assumed server-side PDF generation on demand; two cheaper candidates are now on the table —
browser-native printing of the in-app view, and serving a pre-generated artifact through the
`Resume`/Vercel Blob path that already exists. The answer determines whether server-side Chromium is
ever needed at all.

In the data-management phase itself, next in the reordered sequencing (see
[data-management.md](./data-management.md)): the Prisma models and migration landed 2026-08-04, so
what remains is updating agent-facing context so content edits keep the TS data modules and the YAML
fixtures in parity, and then the sync scripts (zod schemas on every boundary, slug-based
update-vs-delete recognition, stdout logging for v1) that move the fixture content into the new
tables.

Also open, raised 2026-08-03 while building the model rehearsal and detailed in
[context/open-questions.md](./context/open-questions.md): **destructive-change confirmation** (the
one piece of the fixture question left open by the 2026-08-04 format decision), **contextual
representation of labels and content** (generalizing `shortLabel` past two contexts, and letting one
record render as several strings), **per-medium display configuration beyond visibility**, and
**competency categorization** (whether the legacy `Skill` category fields come forward, and whether
a category and a sidebar group are the same thing).

Three of those cluster: `Detail.shortDescription`, contextual representation, and per-medium display
are the same question at three granularities, and settling them separately would leave three
mechanisms for one idea.

Remaining Research & Discussion items in parallel: `Detail.shortDescription` (**blocker** for the
schema), LinkedIn feasibility, GitHub sync design, syndication modeling. Schema/modeling work
remains deferred (see decision dated 2026-08-02 in [decisions.md](./decisions.md)).

## Blockers / Waiting On

- Research items conclude in a discussion with Nick before any decision is recorded — nothing gets
  decided unilaterally.
