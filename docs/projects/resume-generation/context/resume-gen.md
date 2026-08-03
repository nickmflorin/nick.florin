# Context Map: `resume-gen` Repo

_Snapshot taken 2026-08-02 (repo at branch `develop`, commit `bb6f5fd`). Verify against the repo
before relying on details — it changes fast._

Repo: `~/repos/resume-gen`. Astro 6 static site that renders the resume as three fixed 8.5in × 11in
"sheets" and produces three artifacts: per-sheet HTML pages, a single self-contained `resume.html`,
and a merged PDF. Created 2026-08-01; 8 commits as of this snapshot.

## Headline Finding

**The new content model design already exists there.** `docs/content-model.md` (~400 lines) in
resume-gen carries a paste-ready target Prisma schema (`ContentNode`, `NestedContentNode`), a
field-by-field migration table mapping this app's existing `Detail`/`NestedDetail` models onto the
new ones, invariants Postgres can't enforce, a cascade spec, a 6-step migration plan, and
rejected-alternative rationale. Step 1 (converting resume-gen's own data to the model) is done;
steps 2–6 (landing it in this app) are not. **One open schema question flagged there:** what to do
with `Detail.shortDescription` — one candidate answer (a `ContentVariant` table keyed by
node+channel) changes the shape of `ContentNode`.

## The Content Model (`src/data/types.ts`)

Written explicitly as the seed of a Prisma schema (enum values are SCREAMING_SNAKE to become Prisma
enum identifiers; `?` in model types means Prisma `null`).

- **Enums:** `SyndicationChannel` (`LINKEDIN | WEBSITE | RESUME`), `ContentOwnerType`
  (`EXPERIENCE | EDUCATION`), `NodeKind` (`SUMMARY | CONTENT`), `NodeType`
  (`PARAGRAPH | NUMBERED_LIST | BULLETED_LIST`), `TitleLayout` (`INLINE | STACKED`).
- **Visibility/distribution** is NOT `isVisible`/`isLinkedInVisible` booleans. It is the
  `Syndicated` interface: `visible: boolean` (master switch, cascades down, descendants can't
  re-enable) + `excludedChannels: SyndicationChannel[]` (exclusion list; `[]` = publish everywhere —
  permissive default, so adding a channel is a new enum value, not a migration).
- **Two-level content tree:** `ContentNode` (has polymorphic `ownerId`/`ownerType`, `kind`, nullable
  `type`, `children`) → `NestedContentNode` (real FK `parentId`; the absence of `type`/`children` on
  nested nodes structurally enforces "lists contain only paragraphs" and caps depth at 2). Both
  share `id`, per-parent-unique `slug`, HTML `title`/`content` (content = one paragraph max),
  explicit `order`, nullable `titleLayout`, `skills: string[]` (slugs).
- **Three type families:** authoring `*Input` types (humans write these; mechanical fields omitted)
  → model types → `Resolved*` types (post-cascade; deliberately distinct so unresolved trees can't
  render).
- **Presentation types** (explicitly not syndicated): `Role`, `Degree`, `SkillBar`/`Proficiency`,
  `SidebarSection` (bars|pills), `Sheet` (hand-assigned pagination), `MainBlock`.

### Known schema gaps for the DB port

- `Role.dates`/`location` are plain display strings, not date columns.
- `logo` is a bare filename; `Role`/`Degree` have no company/school FK (should map to existing
  `Company`/`School` models in this app).
- Audit columns (createdAt/By etc.) intentionally absent from the TS model but present in the target
  Prisma schema.

## Content Data & Libraries

- Content lives in plain TS modules under `src/data/`: `experience.ts` (10 roles), `education.ts` (3
  degrees), `skills.ts` (10 sidebar sections), `profile.ts`, `pages.ts` (3 `Sheet`s = the manual
  pagination). No JSON, no Astro collections. Copy is authored as template literals with inline
  HTML.
- `src/lib/normalize.ts` — authoring → model: slugify/unique-slug per parent, deterministic
  path-style ids (`craft/leadership/rubrics`, stable across builds — NOT uuids), throws on invariant
  violations.
- `src/lib/syndication.ts` — the cascade, sole authority: `permits = visible && !excluded`; mask
  top-down, prune bottom-up (nodes with no content and no surviving children drop; owners never drop
  from pruning). **Key consequence: channel eligibility is not a row predicate —
  `WHERE visible = true` is wrong; must resolve in application code.**
- The machinery is built but unexercised: currently zero nodes set `visible`, `excludedChannels`, or
  `titleLayout` explicitly.

## Rendering & PDF Pipeline

- Components are Astro but contain **no client JS, no islands** — plain TS model layer has zero
  Astro imports. Porting to React Server Components is near-mechanical (`set:html` →
  `dangerouslySetInnerHTML`; `getStaticPaths` → `generateStaticParams`).
- Pages: `index.astro` (all sheets stacked — source of the single-file artifact) and `[sheet].astro`
  (one standalone doc per sheet — what the PDF renderer prints).
- Print approach: `@page { size: Letter; margin: 0 }`, fixed-size `.page` divs with
  `overflow: hidden` (**clips, never reflows** — pagination is hand-assigned data), vendored Mona
  Sans variable font, `print-color-adjust: exact`.
- Pipeline (`npm run dist` = build → artifact → pdf):
  1. `astro build` + `scripts/postbuild_relativize.py` (rewrites root-absolute URLs so `file://`
     loading works; fails if any remain).
  2. `scripts/build_artifact.py` → single self-contained `build/output/resume.html` (everything
     inlined/data-URI'd).
  3. `scripts/build_pdf.py` → headless Chrome (**hardcoded macOS Chrome path**) `--print-to-pdf` per
     sheet, merged with `pypdf` in a cached venv → `build/output/Resume-<timestamp>.pdf`. No
     puppeteer/playwright.
- **Porting decision:** in Next.js the PDF step becomes puppeteer-core/`@sparticuz/chromium` or
  Playwright hitting served per-sheet routes; the relativize script becomes unnecessary.

## Known Stale/Pending Items in resume-gen

- Craft role still reads `Oct 2024 - Present`; actual last day was 2026-07-31.
- Content rewrite against `content/feedback.md` not started (porting pass changed no wording).
- "TTI ~60% / LCP ~50%" claim flagged as unsubstantiated in `content/craft-portfolio.md`.
- `content/improvements.md` is referenced by its PROJECT.md/CONTEXT.md but doesn't exist (only
  `feedback.md` does).
