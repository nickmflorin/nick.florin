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
- [x] **(blocker)** PDF pipeline research — resolved 2026-08-03 (superseding the earlier
      served-routes direction): generation is a browserless-HTML static pipeline
      (`renderToStaticMarkup` + programmatic `sass` → static files), with headless Chrome used
      strictly as a file-to-file `--print-to-pdf` converter and `pdf-lib` for the merge — no running
      app, no browser automation (see decisions.md). The remaining detail — how the Chrome binary is
      located portably — was settled 2026-08-03 when the script was built: candidate paths with a
      `CHROME_PATH` override, no `puppeteer-core` dependency.
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
- [ ] **(blocker for the fixture work)** Fixture format and round-trip design — see
      [context/open-questions.md](./context/open-questions.md). Covers three coupled decisions: what
      file format the fixtures live in (JSON round-trips but authors badly; TypeScript authors well
      but does not machine-write), how `id`/`createdAt`/`updatedAt` are carried optionally so a
      newly authored record lets Prisma populate them while a pulled one keeps what it had, and how
      a destructive change is surfaced. The candidate for the last is a diff-style flow that prints
      the change set and requires confirmation for deletions and overwrites unless a flag opts out.
- [ ] Contextual representation of labels and content — see
      [context/open-questions.md](./context/open-questions.md). Generalizes the `label`/`shortLabel`
      split beyond two contexts, and asks how one record can render as several strings in a context
      (the three `Accessibility` competencies are the motivating case). Should be settled together
      with `Detail.shortDescription` above, since both are the same problem at different
      granularity.
- [ ] Per-medium display configuration beyond visibility — see
      [context/open-questions.md](./context/open-questions.md). Syndication answers whether a record
      appears on a channel and nothing about how it is displayed there. Decide whether display
      config lives on per-medium presentation models (the `Resume*` precedent) or as per-channel
      configuration on the shared records.
- [ ] Competency categorization — see [context/open-questions.md](./context/open-questions.md).
      Whether to carry the legacy `Skill.categories` / `programmingLanguages` / `programmingDomains`
      forward onto `Competency`, collapse them into one tagging mechanism, or model categories as
      their own table — and whether a category and a `ResumeCompetenciesGroup` are the same thing,
      in which case the sidebar groups become derivable rather than authored.
- [ ] GitHub-driven content sync design: the deterministic flows (projects, job info, skills) and
      the Claude-assisted skill-inference flow.

## Data Modeling

_Gated on the Research & Discussion items above — no schema work until those are settled._

- [x] Merge duplicate competencies (done 2026-08-03): 144 records down to 133. What made this
      lossless was giving the two surfaces different labels — the sidebar (a little over 200px wide)
      renders `shortLabel ?? label` while main-column role chips render `label` — so a competency
      can read `Nx` in a sidebar pill and `Monorepo (Nx)` on a chip from one record. Merged:
      `SASS`/`SCSS` into `SASS / SCSS`; `SSR` into `SSR / RSC`; `Django / DRF` into
      `Django REST Framework`; `Nx`/`Nx Monorepo`/`Monorepo (Nx, lerna)` into `Monorepo (Nx)`;
      `CI/CD` into `CI/CD Pipeline Design`; `pnpm` into `pnpm workspaces`; `Bundle Analyzer` into
      `Bundle Analysis`; `Component Development` into `Component Architecture`. `AWS S3 / EC2` was
      **split** into `AWS S3` plus a new `AWS EC2` rather than merged. Left distinct by decision:
      the three `Accessibility` variants (the `WCAG` and `axe-core` tokens are worth keeping
      scannable), `Django` and `Django Channels`, `AWS` vs `AWS Lambda`, `React` vs `React Native`,
      `Redux` vs `Redux-Sagas`, and the category labels `Testing (RTL, Jest, Playwright)` and
      `Unit / Integration / E2E`.
- [ ] **(immediate follow-up to the types migration)** Assign proficiencies.
      `Competency.proficiency` is nullable because only 24 of the 145 had a level authored — those
      were the sidebar bars. The remaining 121 appeared only as pills or role chips and were never
      rated. A competency rendered in a `BARS` group must have one, which is currently an
      application-level invariant rather than a schema constraint.
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

- [ ] Implement the bidirectional fixture ⇄ DB sync per the research outcome, including the optional
      identity fields, the merge strategy when both sides changed, and the destructive- change
      confirmation flow with a flag to bypass it for scripted runs.
- [ ] Add fixtures for the new content models once they exist.
- [ ] Add a dev-DB `jsonify` script to `package.json` (only `fixtures:jsonify:prod` exists today).
      Not gated — small standalone improvement.
- [ ] Close fixture coverage gaps: `Detail`/`Experience`/`Education`/`Course` exist only nested
      inside `companies.json`/`schools.json`; `Resume` has no fixture at all.

## Resume Generation

_All three generation decisions are made (2026-08-03, see decisions.md): in-app port, React
renderer, browserless static pipeline with Chrome as a file-to-file print converter. Priority within
this section: the standalone generation script outranks the in-app embedding — the document
components must stay pure (no Next-coupled APIs) so they serve both._

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
- [ ] Verify the document render in the running app: `/documents/resume` shows the full stacked
      resume (all sheets with real content) on the gray backdrop, fonts load, and the site's styles
      are absent from the document routes (and vice versa).
- [x] Port the resume rendering into `src/documents/resume/components/` (done 2026-08-03): Sheet,
      Role, Education, Sidebar, SkillBar, Pills, DevHeader plus the top-level ResumeDocument
      (stacked view) and ResumeDocumentSheet (single printable sheet) — all pure React (semantic
      HTML + classNames, `dangerouslySetInnerHTML` for the HTML content, no Next-coupled APIs).
      Pages wired: `/documents/resume` renders the stack; `/documents/resume/[sheet]` resolves from
      `SHEETS` with `generateStaticParams` + `notFound()`. Logos/photo/icons vendored at
      `public/documents/logos/`; `lib/assets.ts` base path is overridable via
      `DOCUMENT_ASSET_BASE_PATH` for relative-URL static emission.
- [x] Port resume-gen's content types and resolution libraries (done 2026-08-03): `types.ts`,
      `normalize.ts`, `syndication.ts` and all data modules (`profile`, `experience`, `education`,
      `skills`, `pages`) copied into `src/documents/resume/{data,lib}/` — unchanged relative import
      structure, Prettier-clean as copied, content frozen as of resume-gen commit `bb6f5fd`.
      TypeScript only — no Prisma models.
- [x] Build the static HTML emission script (`pnpm resume:generate:html`, phase 1, done 2026-08-03):
      renders the sheets with `renderToStaticMarkup`, compiles the document SCSS with the `sass`
      API, and emits `page-N.html`/stacked `index.html`/`assets/` with relative URLs, failing the
      run if any root-absolute reference survives.
- [x] Build the PDF step (`pnpm resume:generate:pdf`, phase 2, done 2026-08-03): headless Chrome
      `--print-to-pdf` per emitted sheet, merged with `pdf-lib`, into a timestamped
      `Resume-<Mon>-<DD>-<YYYY>-<h:mm><am|pm>.pdf`. Chrome is located by candidate path with a
      `CHROME_PATH` override. Verified: three pages, each exactly 8.5in x 11in.
- [x] Build the single-file HTML artifact step (`pnpm resume:generate:artifact`, done 2026-08-03):
      TS port of resume-gen's `build_artifact.py` — inlines the stylesheet, its fonts and every
      image as data URIs, and fails hard both on an unresolvable reference and on any surviving
      pointer to a sibling file.
- [ ] Compare the generated PDF against resume-gen's output for parity, then retire resume-gen (the
      content is frozen at `bb6f5fd`, so the target does not move).
- [ ] **(blocker for the rest of this group)** Decide how a generated resume actually reaches a
      reader — see [context/open-questions.md](./context/open-questions.md). Three candidates:
      server-side generation on demand, browser-native printing of an in-app view, or serving a
      pre-generated artifact. They are not mutually exclusive, and the third is mostly built
      already.
- [ ] Automate the existing upload path: have `pnpm resume:generate` hand its PDF to `uploadResume`
      rather than requiring a manual upload through the admin CMS. The `Resume` model, the Vercel
      Blob integration and the `primary` flag all exist today — this closes the loop with no new
      infrastructure and no server-side Chromium.
- [ ] Make the generated filename sortable before anything selects "the newest" by name.
      `Resume-Aug-03-2026-5:12pm.pdf` does not sort lexicographically by date (abbreviated month
      name, non-padded hour) and the colon is illegal on Windows and awkward in a URL. An ISO-8601
      stem (`Resume-2026-08-03T17-12.pdf`) sorts correctly and travels anywhere.
- [ ] Add a download control to `/documents/resume`, once the delivery question is settled. The
      cheap version is `window.print()` against the stacked view, which already carries
      `@page { size: Letter; margin: 0 }` and `print-color-adjust: exact`; the honest version serves
      a canonical artifact so that what a reader receives is what was reviewed.
- [ ] Only if server-side generation wins: replace the Chrome CLI spawn in
      `src/scripts/generate-resume/pdf.ts` with `puppeteer-core` + `@sparticuz/chromium`, driving
      one browser instance instead of one process per sheet, and ensure the fonts, logos and
      compiled stylesheet reach the function bundle (`outputFileTracingIncludes`, or precompiled at
      build time). This is also where a render-token auth bypass in `src/proxy.ts` would come back
      into scope — though feeding the inlined single-file artifact to `page.setContent` avoids
      serving a route to the printer at all.
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
