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
