# Project Status

_Last updated: 2026-08-03_

## Phase

**Phase 1 — Research & Discussion (with structural stubs).** Phase 0 (discovery & foundation setup)
is complete. The repo-structure and renderer questions are now decided (in-app port, React, no
monorepo — see [decisions.md](./decisions.md)) and the document-route shell is stubbed in the app.
The generation pipeline is now built and working. Still groundwork mode otherwise: **no
schema/modeling work yet** — the remaining Research & Discussion items in [backlog.md](./backlog.md)
(`Detail.shortDescription`, sync design, LinkedIn feasibility) are worked as concrete tasks:
research → written recommendation → discussion → entry in [decisions.md](./decisions.md).

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

Also newly open, all raised 2026-08-03 while building the model rehearsal and all detailed in
[context/open-questions.md](./context/open-questions.md): the **fixture format and round-trip
design** (blocker for any fixture work — format, optional identity fields, destructive-change
confirmation), **contextual representation of labels and content** (generalizing `shortLabel` past
two contexts, and letting one record render as several strings), **per-medium display configuration
beyond visibility**, and **competency categorization** (whether the legacy `Skill` category fields
come forward, and whether a category and a sidebar group are the same thing).

Three of those cluster: `Detail.shortDescription`, contextual representation, and per-medium display
are the same question at three granularities, and settling them separately would leave three
mechanisms for one idea.

Remaining Research & Discussion items in parallel: `Detail.shortDescription` (**blocker** for the
schema), LinkedIn feasibility, GitHub sync design, syndication modeling. Schema/modeling work
remains deferred (see decision dated 2026-08-02 in [decisions.md](./decisions.md)).

## Blockers / Waiting On

- Research items conclude in a discussion with Nick before any decision is recorded — nothing gets
  decided unilaterally.
