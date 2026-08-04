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

## 2026-08-04 — `isHighlighted` stays a boolean: dashboard presence, subordinate to website syndication

**Decision:** `isHighlighted` on the new models (`Competency`, `Role`, `Degree`, and the successor
of any other legacy model carrying `highlighted`) remains a plain boolean with a single meaning:
whether the record appears on the website's dashboard page. It is subordinate to syndication — it
has meaning only when the record actually syndicates to the `WEBSITE` channel (`isVisible: true`
and `WEBSITE` not excluded). For a record withheld from the website the flag is simply inert: never
read, not an anomaly, and nothing (including the data-cleanup warnings) treats it as one. It does
not become per-channel display configuration.

**Why:** The flag has exactly one consumer — the dashboard parallel-route slots fetch with
`filters: { highlighted: true }` — and a boolean answers that consumer completely. Folding it into
the open per-medium display-configuration question would generalize a mechanism with a single,
working use. Making it subordinate to syndication preserves the invariant that syndication alone
decides channel presence; `isHighlighted` only curates within the website channel, never into it.

## 2026-08-04 — Fixture format: YAML, one file per model, authoring shape

**Decision:** The new-model content fixtures are YAML files, one per model, in
`src/documents/resume/fixtures/`: `competencies.yaml`, `companies.yaml`, `schools.yaml`,
`profile.yaml`, `roles.yaml`, `degrees.yaml` and `resume-sheets.yaml` (a competency group belongs
to exactly one sheet, so groups nest inside the sheets file). The settled details:

1. **YAML as the serialization format.** The content is prose-dominant, and YAML's folded scalars
   store a paragraph as wrapped plain lines, so a one-word edit diffs as prose rather than as one
   enormous escaped JSON line. YAML also carries comments, and the `yaml` package (now a pinned
   devDependency) can rewrite a document by mutating values in place should comment preservation
   ever be needed on a machine rewrite.
2. **One file per model, not one file per record.** Array position within a file derives the
   Prisma `order` value (see 3), and separate per-record files have no inherent order, which would
   reintroduce explicit `order:` fields or a manifest. Scoped diffs — the per-record layout's main
   draw — already fall out of YAML's line-based prose. Revisit only if a file becomes unwieldy.
3. **Fixtures store the authoring shape, not the normalized shape.** `order` is implied by array
   position; fields carrying their default are omitted entirely (`isVisible: true`,
   `excludedChannels: []`, `false`-valued flags, `null`s); relations are slug references; enum
   values are the SCREAMING_SNAKE strings that become Prisma enum identifiers verbatim, so no
   mapping layer sits between fixture, zod schema and Prisma.
4. **Slug is the correlation key.** Database identity (`id`, `createdAt`, `updatedAt`) surfaces
   only as metadata — an optional `meta:` block that the first push writes back and a newly
   authored record simply omits — while sync correlation relies on slugs above all else.
   Content-node slugs, derived from titles by normalization today, become **sticky**: stamped into
   the fixture once generated, so a later title edit never silently changes identity into a
   delete-plus-create.
5. **Comments stay minimal.** The explanatory comments in the TS data modules mostly do not carry
   over — the YAML and the Prisma schema make them redundant. Anything that must survive a machine
   rewrite belongs in a `notes:` data field, which round-trips as data; each generated file
   otherwise carries only a three-line provenance banner.
6. **Prettier is the canonical formatter.** `pnpm resume:fixtures` ends with a Prettier pass over
   the fixtures (mirroring the `fixtures:jsonify:prod` → `fixtures:format` precedent), so emitter
   style never disagrees with a committed file.
7. **The TS data modules are the bootstrap and the interim source of truth.**
   `src/scripts/emit-resume-fixtures.ts` (`pnpm resume:fixtures`) emits the fixtures from
   `src/documents/resume/data/`; until the sync tooling lands, content edits happen in the data
   modules and are re-emitted. The data modules retire together with the old fixture layout once
   the Prisma migration is complete, at which point the YAML files become the authored surface.

**Why:** The fixture format has to satisfy four pulls at once — machine-writable (DB pull),
machine-readable (DB push), pleasant for Claude to iterate on without a database, and readable in
a git diff — and prose-heavy content is where JSON fails the last two hardest. Authoring shape
was chosen over normalized shape because the fixtures are an editing surface first: explicit
`order` columns are renumbering noise a human will get wrong, while array order cannot be wrong.

**Alternatives considered:** JSON (round-trips cleanly and the existing machinery exists, but no
comments and paragraph edits diff as one line); TypeScript modules (best authoring ergonomics, but
not machine-writable in any principled way); a TS-authoring/JSON-sync hybrid (a pull can only
update the generated artifact, leaving the authored TS stale — two sources of truth inside the
fixture layer itself); Markdown with YAML frontmatter (per-node syndication flags and identity
cannot attach to markdown sections, so the frontmatter swallows the document); JSON5/JSONC
(comments, but the prose problem remains and no mature comment-preserving writer); per-record
files (rejected per 2 — deletion visibility is the sync tool's diff output instead).

## 2026-08-03 — Generation script implementation details

**Decision:** Settles the details left open when the browserless-pipeline decision below was made,
now that the script is built and working (`pnpm resume:generate`, in
`src/scripts/generate-resume/`):

1. **Chrome is located by candidate path, not by `puppeteer-core`.** A `CHROME_PATH` environment
   variable wins if set; otherwise the standard macOS and Linux install locations are probed in
   order. `puppeteer-core`'s locator was rejected because it resolves browsers that _it_ downloaded,
   which would mean adding a dependency and a browser download to find a Chrome that is already
   installed.
2. **Assets are emitted under a single `assets/` directory** beside the pages, and every reference
   to them is relative. The stylesheet's root-absolute `url()` targets are resolved against
   `public/`, copied in under the same path, and rewritten by dropping the leading slash; the
   components' asset URLs are pointed at the same directory through `DOCUMENT_ASSET_BASE_PATH`. Both
   are then verified: an emitted page carrying a root-absolute `src`/`href` fails the run, which is
   the TypeScript equivalent of resume-gen's `postbuild_relativize.py` straggler check.
3. **Pages are derived from `Sheets`, not globbed off disk.** resume-gen globbed `page-*.html` and
   sorted numerically to keep page 10 from landing before page 2; deriving the list from the content
   removes the filename-sorting concern entirely.
4. **React's automatic image preload hints are stripped from the emitted markup.** Nothing an
   emitted page references is fetched over a network, so the hints save nothing, and leaving them in
   would make the single-file artifact inline every image a second time.
5. **`tsx` and `pdf-lib` are now pinned devDependencies.** `tsx` was previously invoked through
   `npx` without being installed, which silently broke every script that used it.
6. **Next's `core-web-vitals` ESLint preset is switched off across `src/documents/` and
   `src/scripts/generate-resume/`** in `eslint.config.mjs`, via a `NonNextFiles` override whose rule
   list is derived from the preset so it cannot drift. The preset is composed in without a `files`
   restriction, so it otherwise applies everywhere — and its advice is precisely what the purity
   constraint forbids: `no-img-element` argues for `next/image` in components that may not import
   it, and `no-head-element`/`no-css-tags` argue against the document shell the generation script
   must emit itself. Suppressing it per line would have meant a disable directive on every image.

**Why:** These were the last unresolved details of an otherwise settled design; recording them keeps
the reasoning attached to the code rather than to a single session.

## 2026-08-03 — Generation is a browserless static pipeline; the app routes are a second consumer

**Decision:** Supersedes the "printing the served sheet routes" portion of the earlier
repo-structure decision (below). The generation script mirrors resume-gen's build architecture,
translated to TypeScript, and does NOT depend on a running app, a session, or browser automation:

1. **HTML (pure Node, no browser):** a `tsx` script renders the document components from
   `src/documents/resume/` with `renderToStaticMarkup` from `react-dom/server`, compiles
   `src/styles/document/index.scss` with the `sass` API, and emits static files (`page-N.html`,
   stacked `index.html`, assets) using relative URLs from the start — no equivalent of resume-gen's
   `postbuild_relativize.py` is needed. The single-file `resume.html` artifact is a TS port of
   `build_artifact.py` (inline CSS, data-URI assets, fail hard on unresolvable refs).
2. **PDF (Chrome as a pure print engine):** headless Chrome `--print-to-pdf` per emitted
   `page-N.html` file — exactly resume-gen's converter — merged with `pdf-lib` (replacing pypdf and
   the Python venv). The binary is located portably (`puppeteer-core` locator or `CHROME_PATH`
   override) instead of a hard-coded macOS path. Browserless HTML-to-PDF libraries were rejected:
   the styles depend on Chrome-grade flexbox/variable-font/`@page` support, and
   `@react-pdf/renderer`-style libraries would be a second renderer, breaking the single source of
   truth.
3. **Hard constraint this imposes:** the document components must stay pure — semantic HTML +
   classNames only; no `next/font`, `next/image`, server actions, or any Next-coupled API — so the
   same components serve both the standalone script and the app routes. The in-app `(document)`
   routes are the live preview / future on-demand surface, not a dependency of the script. The
   render-token auth bypass idea is deferred until deployed on-demand generation.
4. **Priority:** getting this script pipeline working outranks embedding the resume in the app.
   Content comes from fixture data modules first; the DB slots in later behind the same content
   source.

**Why:** The script must be deterministic and self-contained (file-in → file-out), matching how
resume-gen's `dist` flow worked. What made that flow clean was not the absence of a browser
(resume-gen used headless Chrome too) but the absence of a running app and automation framework —
Chrome is used strictly as a file-to-file print converter.

## 2026-08-03 — Document style organization: disjoint trees, no Tailwind, idiomatic SCSS

**Decision:** Document styles live in `src/styles/document/` as a second, fully disjoint tree next
to the site styles — one styles root, two trees, mirroring the `(site)`/`(document)` route-group
split. Standing rules: (1) no cross-imports between the trees in either direction, even at the cost
of duplicating a value — the document's values are print-tuned constants, not shared theme tokens;
(2) no Tailwind syntax (`@tailwind`, `@apply`, `theme()`) anywhere in the document tree —
resume-gen's `@theme static` block becomes a plain `:root` custom-property block in
`_variables.scss` with identical variable names; (3) resume-gen's global element selectors
(`html`/`body` in `_base.scss`) port as-is, relying on route-group isolation rather than defensive
class wrappers; (4) Mona Sans is vendored at `public/fonts/mona-sans/` (with its OFL license) and
declared only in the document tree, `font-display: block` preserved for print fidelity. Values port
verbatim, but the SCSS is restructured idiomatically (nesting, `&`-suffix patterns, maps) rather
than kept diff-identical to resume-gen, and comments are rewritten to this repo's comment and
line-length rules. One behavioral adaptation: resume-gen's `body.stacked` browsing-view hook becomes
a `.stacked` wrapper element rendered by the stacked page, since a per-page body class is not
available from a shared root layout.

**Why:** Route-group CSS loading gives structural isolation; the standing rules keep it from eroding
(a shared partial or site token change must never reflow the printed sheets). Idiomatic SCSS was
chosen over byte-level parity with resume-gen because the tree is the long-term home of these styles
and repo conventions win over temporary diff-ability.

## 2026-08-03 — Resume generation lives in this app; no monorepo

**Decision:** Resume generation is ported into this Next.js app as a self-contained feature area. No
monorepo, no shared package, no separate generator app. The renderer is React (Server Components);
`~/repos/resume-gen` stays untouched as the working reference until the in-app version reaches
parity, then retires. Its content is frozen once the in-app renderer starts, so parity has a fixed
target. PDF generation v1 is a local script (headless browser printing the served sheet routes,
TS-native merge); the deployed on-demand route comes later once content is DB-backed.

**Why:** The end state requires generation from the live database on demand, which a static Astro
app cannot do. The port is near-mechanical (resume-gen's model layer has zero Astro imports; its
components have no client JS). A monorepo's shared-package benefit is temporary — it evaporates when
the Astro app retires — while converting this repo's single-package tooling (client patching, ESLint
tooling, env layering, Vercel config) to workspaces is a large diversion.

**Alternatives considered:** Turborepo monorepo with a shared content package (rejected: temporary
benefit, high conversion cost); keeping resume-gen as a separately deployed SSR app (rejected:
recreates two sources of truth). Would revisit monorepo only if the generator becomes an
independently deployable product.

## 2026-08-03 — Document routes: `/documents/resume`, separate root layout, auth-gated, UI in `src/documents/`

**Decision:** The print-form resume lives at `/documents/resume` (stacked browsing view) and
`/documents/resume/[sheet]` (per-sheet printable pages), inside a `(document)` route group with its
own bare root layout — all existing routes moved into a `(site)` route group (URLs unchanged). The
document layout imports only `src/styles/document/index.scss`; site styles enter via `AppConfig` in
the site layout, so isolation is structural in both directions. The routes are protected in
`src/proxy.ts` by the same Clerk admin matcher as `/admin` (auth-only — no environment gating, so
the routes are deployable for the future on-demand PDF feature). Document UI components live in a
dedicated `src/documents/` folder (e.g. `src/documents/resume/`), not under `src/features/`.

**Why:** CSS imported in a root layout only loads for routes under it, which gives complete two-way
style isolation without hacks — required for print fidelity. `/documents/...` was chosen over
`/resume-doc` to namespace future document types, and because sharing the existing `/resume` segment
across two root layouts invites route-resolution conflicts. Auth-gating (rather than dev-only) keeps
the live-preview iteration loop in dev while leaving the routes deployable.

**Decision:** The new parallel models are named as follows: the successor to `Skill` is
**`Competency`** (plural "competencies" — from here on, project discussion says "competencies", not
"skills", when referring to the new modeling); the successor to `Experience` is **`Role`**; the
successor to `Education` is **`Degree`**.

**Why:** The old and new models must coexist during the parallel period, so the new names cannot
collide with existing Prisma models. `Competency` reads naturally in schema and prose, collides with
nothing in either repo, and is semantically broader than `Skill`, fitting the added configurability.
`Role` and `Degree` are already the names of resume-gen's presentation types, so this aligns the two
vocabularies.

**Alternatives considered:** `Capability` (overloaded in software contexts) and `Expertise` (awkward
as a countable row) for the `Skill` successor; `Proficiency` was unavailable — resume-gen already
uses it for the familiarity-bucket enum (`FAMILIAR | PROFICIENT | ADVANCED | EXPERT`).

## 2026-08-02 — Schema/implementation work deferred until research phase concludes

**Decision:** No new Prisma models or implementation work yet, even though resume-gen's
`docs/content-model.md` contains a paste-ready target schema. Research and discussion items (repo
structure, Astro vs. React, PDF pipeline, `Detail.shortDescription`, sync design, LinkedIn
feasibility) are tracked as first-class tasks in the Research & Discussion section of
[backlog.md](./backlog.md) and are worked first: research → written recommendation → discussion with
Nick → decision recorded here. Nothing is decided unilaterally.

**Why:** We are laying groundwork. Several of the open questions (notably repo structure and
`Detail.shortDescription`) change the shape of the schema and the codebase layout; implementing
before they are settled would bake in guesses.

## 2026-08-02 — Project context lives in `docs/projects/resume-generation/`

**Decision:** All persistent working context for this project (status, decisions, codebase maps,
open questions) lives in this repo under `docs/projects/resume-generation/`, committed to git.
(Originally created as a top-level `resume-generation-project/` folder, moved under `docs/projects/`
the same day.)

**Why:** The project spans many sessions over a long period. Context in the repo is versioned,
visible to both the developer and AI sessions, and survives any single conversation. Living under
`docs/` keeps it alongside the repo's other human-readable documentation.
