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
- [x] **(blocker)** `Detail.shortDescription` disposition — resolved 2026-08-04 (see decisions.md):
      one variant table (owner + field + context) serving prose and labels alike, committed as the
      direction but built only when the first third context arrives; `shortX` columns remain the
      fast path meanwhile. No longer blocks anything.
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
- [x] **(blocker for the fixture work)** Fixture format and round-trip design — resolved 2026-08-04
      (see decisions.md): YAML, one file per model in `src/documents/resume/fixtures/`, authoring
      shape (array position derives `order`, defaults omitted, slug references, Prisma enum
      identifiers), slugs as the correlation key with `id`/`createdAt`/`updatedAt` carried as an
      optional `meta:` block written back by the first push, and sticky generated node slugs. The
      third coupled decision — how a destructive change is surfaced (the diff-style confirmation
      flow) — remains open and is covered by the fixture ⇄ DB sync design item above.
- [x] Contextual representation of labels and content — resolved 2026-08-04 together with
      `Detail.shortDescription` (see decisions.md): same variant table, same timing. The
      channel-vs-surface keying and the set-of-strings-per-context questions are recorded in the
      decision as design inputs for when the table is built.
- [ ] Per-medium display configuration beyond visibility — see
      [context/open-questions.md](./context/open-questions.md). Syndication answers whether a record
      appears on a channel and nothing about how it is displayed there. Decide whether display
      config lives on per-medium presentation models (the `Resume*` precedent) or as per-channel
      configuration on the shared records. Already settled outside this item (2026-08-04, see
      decisions.md): `isHighlighted` stays a plain boolean meaning dashboard presence, subordinate
      to website syndication.
- [ ] Competency categorization — see [context/open-questions.md](./context/open-questions.md). The
      2026-08-04 lean became a decision on 2026-08-09 (see decisions.md): the legacy
      `Skill.categories` / `programmingLanguages` / `programmingDomains` are **held out of the
      JSON→YAML port**, and the skills audit doubles as the design pass for the successor
      categorization scheme — schema fields, codecs, YAML shape and ported values all follow from
      it. Still open alongside it: whether a bucket and a `ResumeCompetenciesGroup` are the same
      thing, in which case the sidebar groups become derivable rather than authored. The legacy
      columns stay on `Skill` untouched in the interim.
- [x] Settle the disposition of every legacy model not yet redefined — **decided 2026-08-11** (see
      decisions.md): `Project`, `Repository` and `Course` all **carry over intact** with additive
      membership (Competency m2m, `channels`, bindings/fixtures; `Course` additionally gains a
      nullable `degreeId` re-parent, and `ContentOwnerType.PROJECT` waits until the website wants
      rich project content). Implementation is its own item under Data Modeling, sequenced after the
      channels-allowlist inversion.
- [ ] **(tentative, added 2026-08-11)** Research whether nested competency hierarchies make sense —
      competencies grouped as children under other competencies (e.g. specific tools under a parent
      practice). As part of the same research, investigate the broader competency-system
      improvements that keep coming up: more granular control of which competencies are shown for
      individual content items and nested content items, and the ability to turn competencies off
      for roles/degrees or content items **on a per-medium basis** (the per-owner/per-association
      granularity the 2026-08-10 association-merge amendment deferred — subsumes the design half of
      the competency-pill display-controls item in Data Modeling). Overlaps the competency
      categorization item above: a hierarchy may be the bucketing/tagging mechanism that question is
      waiting for, so the two should be researched together rather than decided separately.
- [ ] GitHub-driven content sync design: the deterministic flows (projects, job info, skills) and
      the Claude-assisted skill-inference flow.

## Data Modeling

- [x] **(done 2026-08-11)** Invert syndication from an
      exclusion list to an allowlist: `excludedChannels: SyndicationChannel[]` becomes
      `channels: SyndicationChannel[]` on **every** syndicated model, defaulting to `[]` — a newly
      created record syndicates **nowhere** until channels are explicitly granted. Reverses the
      permissive-default shape the discovery notes recorded. Touches: the parallel Prisma models
      (migration), the fixture codecs/bindings (`channelsField` semantics), the TS data modules and
      emitter, the resolution cascade in `normalize.ts`/`syndication.ts` (exclusion inheritance
      becomes allowlist intersection — the cascade rule needs a rethink), and a data migration of
      all authored values (current implicit "everywhere" becomes explicit channel grants so nothing
      visibly changes at flip time).
- [x] **(done 2026-08-11)** Implement the carried-over models' membership (decided
      2026-08-11, see decisions.md): additive migration giving `Project`/`Repository`/`Course` a
      `Competency` m2m and `channels`, plus `Course.degreeId` (nullable, populated from the
      education ↔ degree correspondence); bindings and one fixture file per model (`projects.yaml`,
      `repositories.yaml`, `courses.yaml`) with slug refs; then port the prod data (4 projects, 22
      repositories, ~24 courses) with skill links translated through
      [context/legacy-skill-mapping.md](./context/legacy-skill-mapping.md).

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
- [x] Assign proficiencies from experience years — **done 2026-08-11** for every competency the
      approach can reach: the 11 unrated competencies carrying a legacy `experience` value were
      bucketed by the year→bucket pattern calibrated on the already-rated set and signed off by Nick
      with adjustments (CSS 10y → ADVANCED, Django 10y → EXPERT, Responsive Design 8y → ADVANCED,
      Matlab/Redux-Sagas 5y → ADVANCED, Bash/Clerk/React Native 2y → PROFICIENT, R 2y → FAMILIAR
      (academic, like C++), AWS Lambda/Vue 1y → FAMILIAR). Rated: 24 → 35. The remaining 142 unrated
      competencies have no years to estimate from and stay null — every `BARS`-group member is
      rated, so the application invariant holds; rating the long tail (or deriving years via
      `calculatedExperience` once role dates back them) is future content work, not a blocker.
- [x] Land the new content model (`ContentNode`, `NestedContentNode`, syndication enums) in
      `schema.prisma` as parallel models (done 2026-08-04: migration
      `20260804145452_parallel_content_models`, applied to the dev database — see decisions.md).
- [ ] Correlate content and sub-content to competencies (added 2026-08-04). `ContentNode` and
      `NestedContentNode` already carry a competencies relation in the rehearsal types, but the
      correlations are not authored anywhere yet. A content or sub-content node must be able to tag
      the specific competencies it relates to — and tagging is available **only** on the content
      items of a `Role` or `Degree`, never on other prose rows (profile about paragraphs,
      highlights, contact entries).
- [ ] Add competency-pill display controls to every model with associated competencies (added
      2026-08-04): a `competenciesVisible` flag toggling whether the pills render at all, plus a
      competencies syndication-channels enum array controlling which mediums the pills render on.
      Applies uniformly to `ContentNode`, `NestedContentNode`, `Role`, `Degree` and any other
      competency-bearing model — the pills' visibility is controllable both overall and
      per-syndication, independently of the owning record's own syndication. No longer gates the
      association merge — that landed 2026-08-10 via competency-level channel exclusion with the
      syndication cascade filtering chip lists (see decisions.md). This item remains for the
      **per-owner granularity** it would add: a shared competency chipping on one role but not
      another, which the competency-level mechanism cannot express.
- [x] Design the `Competency` model — landed 2026-08-04 in the parallel schema per the rehearsal
      types (see decisions.md). Remaining from the requirements below: the m2m links to the legacy
      `Course`/`Project`/`Repository` models (deferred to the syndication-modeling research item).
      Original requirements (added 2026-08-02):
  - More control and output configurability than the current `Skill` model.
  - Same visibility flags as `Role`/`Degree` get in the new model (the `Syndicated` shape:
    `visible` + `excludedChannels[]`).
  - Short label and full label (vs. today's single `label`).
  - Links to other models the same way the current `Skill` does (m2m to `Role`, `Degree`, Course,
    Project, Repository, and the Detail successor `ContentNode`/`NestedContentNode`).
  - Years-of-experience metric (like today's `experience`/`calculatedExperience`), **plus** a
    bucketed familiarity enum that becomes the primary metric going forward — values from
    resume-gen's `Proficiency` type: `FAMILIAR | PROFICIENT | ADVANCED | EXPERT`.
- [x] Design the `Role` and `Degree` models — landed 2026-08-04 in the parallel schema per the
      rehearsal types. `ContentOwnerType` values follow the rename (`ROLE | DEGREE`), and the legacy
      `Degree` enum became `DegreeType` to free the model name (see decisions.md).
- [x] Model resume sidebar sections — landed 2026-08-04 as `ResumeCompetenciesGroup` (heading, slug,
      bars/pills display flag, owned by a `ResumeSheet`), with competency membership as a
      **many-to-many** per the rehearsal types, superseding the optional-FK sketch originally
      recorded here (see decisions.md).
- [x] Replace display-string fields from resume-gen types with real modeling on the way in (done
      2026-08-04): `startDate`/`endDate`/`city`/`state` are real columns on `Role`/`Degree`, and
      logos resolve through the `Company`/`School` relations (`logoFileName`).
- [ ] Rationalize visibility defaults across existing models (`Company`/`School` have no flag;
      `Project`/`Repository` default hidden; others default visible).
- [x] Model the remaining presentation constructs — landed 2026-08-04: `ResumeSheet` (hand-assigned
      pagination, `isIntroVisible`) and the bars/pills display flag on `ResumeCompetenciesGroup`.
      Whether presentation modeling generalizes per-medium remains with the syndication-modeling
      research item.
- [ ] Port resume-gen's cascade resolution (`normalize.ts`, `syndication.ts`) into this app's model
      layer — remember channel eligibility is not a row predicate (`WHERE visible = true` is wrong;
      resolution happens in application code).

## Fixtures & DB Sync

- [ ] **(consider before the port executes)** Decide the write-review model for data transformations
      (added 2026-08-10): assemble the complete change set in memory first, then present one full
      diff and walk through the changes at the end — writing nothing until the whole set is reviewed
      — versus walking through changes intermittently and writing each as it is confirmed. Applies
      to the legacy-data port below and generalizes to the sync engine (whose per-batch
      itemized-diff confirmation decision, 2026-08-04, already leans assemble-first).
- [x] Port the legacy prod data (the JSON seed fixtures, confirmed current with production
      2026-08-09) into the YAML fixture layer via the TS data modules — **done 2026-08-10**:
      competencies 133 → 177 with legacy field enrichment; USLege.ai company + hidden role; the full
      association merge under the sidebar-sanctioned chip policy (55 competencies `RESUME`-excluded,
      `django` exempt; associations never removed); the prose-comparison pass (seven website-only
      nodes ported, seven superseded items skipped); `middleName`, `intro` and the JHU `note`
      scalars; and the Saracen pagination rebalance the chip growth required. Final PDF reviewed and
      approved by Nick. All mechanics and rulings are in decisions.md (2026-08-09 → 2026-08-10
      entries); the translation table is
      [context/legacy-skill-mapping.md](./context/legacy-skill-mapping.md).
- [x] **(before the competency port)** Audit the 158 legacy skills — done 2026-08-09 via an
      eight-stop grouped walkthrough (see decisions.md): full mapping recorded in
      [context/legacy-skill-mapping.md](./context/legacy-skill-mapping.md) — 67 direct matches, 31
      folds, 47 → 44 new competencies, 13 confirmed drops (amended 2026-08-10: nine drops
      reinstated). Still outstanding from this item: the successor **categorization scheme** design
      (the audit settled membership, not taxonomy — see the Research & Discussion item).
- [x] Establish the YAML fixture files for the new models (done 2026-08-04): one file per model in
      `src/documents/resume/fixtures/` (`competencies`, `companies`, `schools`, `profile`, `roles`,
      `degrees`, `resume-sheets`), emitted from the TS data modules by `pnpm resume:fixtures`
      (`src/scripts/emit-resume-fixtures.ts`, Prettier as the canonical formatter). Until the sync
      tooling lands the data modules remain the operative source; parity is maintained by
      regenerating.
- [ ] Update project context, skills and agent instructions to require parity between the TS data
      modules and the YAML fixtures whenever content is added, removed or modified in the interim.
- [x] Add zod schemas for the YAML fixtures (done 2026-08-04 as part of the transfer architecture in
      `src/database/content/` — see decisions.md): strict per-entity schemas derived from field
      codecs, duplicate-slug and cross-reference validation over the whole set, entity invariants
      (content-tree shape, remote-role location), verified by round-tripping all seven fixture
      files.
- [ ] Implement the bidirectional fixture ⇄ DB sync per the research outcome, including the merge
      strategy when both sides changed and the destructive-change confirmation flow with a flag to
      bypass it for scripted runs. The structural layer exists (`ContentStore` port with YAML and
      Prisma adapters, dependency-ordered registry, create-only writes); what remains is the sync
      engine itself — diff canonical-vs-canonical, update writes, `meta:`/sticky-slug write-back to
      fixtures after a push, and the script entry point. New requirement (2026-08-09, see
      decisions.md): the push seeds `createdAt` from the legacy counterpart row (competency ↔ skill,
      role ↔ experience, …) rather than `now()`, so derived website ordering survives adoption.
- [x] ~~Preserve authored competency ordering across the m2m relations~~ — resolved 2026-08-04 the
      other way (see decisions.md): competency order is derived, never stored. Website and resume
      body chips sort by `isPrioritized` then `createdAt`; the resume sidebar's pill order comes
      from the generation build step's spacing/size optimization. Fixture competency lists are
      membership sets emitted in slug order.
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
- [ ] When generation is DB-backed, derive competency order at build time per the 2026-08-04
      ordering decision (see decisions.md): sidebar bars/pills via the spacing/size optimization
      step, body chip rows via prioritized-then-`createdAt`. Nothing persists a competency order.
- [ ] **(deliberately last — do not prioritize)** Keep a fixture-only generation mode: once the
      generation script sources content from the database, it must still be able to run from the
      YAML fixture data alone — no database queries — for local development, so the resume output
      can be tested before the fixtures are written to the database (added 2026-08-04).

## Content

_Not gated — these live in resume-gen today and can proceed anytime._

- [ ] Mine all available sources for missing competencies (added 2026-08-10): GitHub history and
      repositories, projects, and any documents Nick provides — generate candidate skills and
      competencies absent from the catalog. Per the catalog principle (decided 2026-08-10, see
      decisions.md), candidates are judged on "was this actually used/learned", never on whether any
      channel would display them; candidates land with Nick's sign-off, not automatically.
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
