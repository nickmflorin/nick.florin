# Open Questions

Unresolved questions that need discussion or a decision. When one is resolved, move the outcome to
[decisions.md](../decisions.md) and delete it from here.

## How a generated resume reaches a reader

`pnpm resume:generate` produces the artifacts, but nothing connects them to anyone reading the site.
The original sketch assumed a button that generates a PDF server-side on demand. That is now one of
three candidates, and it is the most expensive of them. They are not mutually exclusive.

### 1. Server-side generation on demand

A route renders the document and returns a PDF per request, from live database content.

The HTML half already works anywhere: `renderToStaticMarkup` plus the `sass` API is pure Node, the
`pdf-lib` merge is pure JavaScript, and the temporary directory handling already targets the only
writable path a serverless function has. The blocker is narrow and known — `pdf.ts` spawns a Chrome
binary off the filesystem, and no such binary exists in a deployed serverless runtime.

Closing it means `puppeteer-core` + `@sparticuz/chromium`, a large addition to the function bundle,
a multi-second cold start while Chromium decompresses, and raised memory and duration limits. Two
further traps: `public/` is served by the CDN and is not necessarily present on the function's
filesystem, so the fonts and logos the pipeline reads need to be traced into the bundle; and
compiling SCSS per request is wasteful when it could be precompiled at build time.

Worth it only if generation genuinely has to happen per request against live data. Nothing yet
requires that.

### 2. Browser-native printing of an in-app view

`/documents/resume` already renders the stacked document, and the document stylesheet already
carries `@page { size: Letter; margin: 0 }`, fixed-size `.page` elements with `break-after: page`,
and `print-color-adjust: exact`. A `window.print()` button would therefore produce a correct
document today, with no server infrastructure at all, from the same components — the single source
of truth is preserved for free.

The cost is control. Output depends on the reader's browser and their choices in the print dialog:
header and footer injection is on by default in some browsers, `@page` margins can be overridden,
and font rasterization differs across engines. It also requires a human at a keyboard, so it cannot
feed an automated flow, and it produces no canonical file — there is no guarantee that what a
recipient ends up with is what was reviewed.

Best understood as a convenience on top of a canonical artifact rather than a replacement for one.

### 3. Serving a pre-generated artifact

Generation stays where it is — a local command, or later a scheduled job — and the app serves the
most recent output.

**This is largely built already.** The `Resume` Prisma model, the Vercel Blob integration in
`src/actions/resumes/` (`upload-resume.ts`, `fetch-resumes.ts`, `update-resume.ts`,
`delete-resume.ts`) and the `primary` flag exist today; PDFs are simply uploaded by hand through the
admin CMS. Automating that upload from the end of `pnpm resume:generate` closes the loop with no new
infrastructure, no Chromium in the deployment, and an explicit review step before anything becomes
`primary`.

A folder of date-stamped files is the same idea with weaker guarantees. If it is chosen anyway, note
that `public/` is readable at build time but not reliably at request time on a serverless host, so
the "newest" file has to be resolved at build time or recorded in a manifest. And selecting the
newest by filename requires the filename to sort — see the backlog item on moving the generated stem
to ISO 8601.

### What to settle

Whether the canonical artifact is a file produced ahead of time and reviewed (3), or a response
generated per request (1), with (2) layered on either as a convenience. The answer determines
whether server-side Chromium is ever needed at all.

## `Detail.shortDescription` disposition — resolved 2026-08-04

See the per-context text decision in [decisions.md](../decisions.md): one variant table (owner +
field + context) serving prose and labels alike, built when the first third context arrives;
`ContentNode` deliberately carries no `shortDescription` column and nothing waits on this.

## Syndication modeling beyond Detail-replacement

resume-gen's `docs/content-model.md` fully designs the `Detail`/`NestedDetail` →
`ContentNode`/`NestedContentNode` replacement, including the `Syndicated` shape (`visible` +
`excludedChannels[]`). Still undesigned: how the other new/parallel models (`Role`, `Degree`,
`Competency` — successors to `Experience`, `Education`, `Skill`; see decisions.md 2026-08-02) and
`Project`, `Repository`, `Company`, `School` participate in channels, per-channel ordering, and
whether presentation constructs (sheets/pagination, competency bars, pill sections) are content or
per-medium presentation config.

## Fixture ⇄ DB sync semantics

Both directions are required (DB → fixture exists via `fixtures:jsonify:prod`, prod-only and
full-dump; fixture → DB exists only as a full reload into an empty DB via `prisma:seed`). The
fixtures are also meant to be the surface Claude iterates on without a database running, which is
what makes this more than a seeding concern.

**Format and round-tripping identity — resolved 2026-08-04** (see the fixture-format entry in
[decisions.md](../decisions.md)): YAML, one file per model in `src/documents/resume/fixtures/`,
authoring shape with defaults omitted, slugs as the correlation key. Database identity (`id`,
`createdAt`, `updatedAt`) is carried as an optional `meta:` block that the first push writes back
and a newly authored record omits, and generated content-node slugs are stamped into the fixture
once created (sticky), so a title edit never changes identity. The fixtures are bootstrapped from
the TS data modules by `pnpm resume:fixtures`, which is also the interim parity mechanism.

**Destructive-change safety — resolved 2026-08-04** (see decisions.md): destructive = deletions plus
any change to a non-empty value; confirmation is per-batch with one itemized git-style diff and a
`--yes` bypass, growing into a navigable terminal viewer (summary line per change, arrow keys to
reveal each diff); conflicts are atomic per record in v1, with field-level merge deferred.

## LinkedIn & GitHub integration scope

LinkedIn syndication and GitHub-driven skill/content discovery are stated goals. No LinkedIn
integration exists today (just a URL string on `Profile`). Not yet scoped: which LinkedIn API
surfaces are actually available for profile updates, and what the deterministic vs. Claude-assisted
GitHub sync flows look like. The existing GitHub client is create-only and does not validate API
responses.

## Contextual representation of labels and content — resolved 2026-08-04 (direction)

Resolved together with `Detail.shortDescription` above — see the per-context text decision in
[decisions.md](../decisions.md). Two design details are recorded there as deferred to the variant
table's build: channel-vs-surface keying, and one record rendering as a set of strings per context
(the three `Accessibility` competencies case).

## Per-medium display configuration beyond visibility

Syndication currently answers one question — _does this appear on this channel_ — and nothing about
_how_. But how a record is displayed is genuinely per-medium: a competency group renders as bars on
the resume and might render as a sorted list on the website; pagination exists only on the printed
page; a role might show four content nodes on the resume and all nine on the site.

Open: whether display configuration lives on the presentation models (as `ResumeSheet` and
`ResumeCompetenciesGroup` do today, prefixed to mark them resume-only), which would mean a parallel
set of models per medium; or whether it becomes per-channel configuration hanging off the shared
records. The first duplicates structure per medium, the second puts medium-specific columns on
models that are supposed to be medium-agnostic. This is the same tension the pagination decision
resolved in favor of the presentation model, and that precedent may or may not generalize.

Settled 2026-08-04 and out of scope here: `isHighlighted` stays a plain boolean meaning presence on
the website's dashboard page, subordinate to `WEBSITE` syndication — inert for any record that does
not syndicate there (see decisions.md). It does not become per-channel display configuration.

## Competency categorization

The legacy `Skill` model carries `categories SkillCategory[]`,
`programmingLanguages ProgrammingLanguage[]` and `programmingDomains ProgrammingDomain[]`;
`Competency` currently carries none of them. They are what the site's skills chart and admin filters
are built on, so dropping them would be a regression for those surfaces even though the resume never
used them.

Open: whether to carry all three forward as-is, collapse them into one tagging mechanism (the three
overlap — a programming language is arguably a category), or model categories as their own table so
that adding one is a row rather than a migration. Also open is whether a category is the same thing
as a `ResumeCompetenciesGroup`: the sidebar groups today are hand-authored and resume-specific, but
several of them ("Testing", "Cloud & Databases") read exactly like categories, and if categories
existed the groups might be derivable rather than authored.

**Current lean (2026-08-04, not yet decided):** do NOT carry the three legacy enum-array fields
forward onto `Competency` — but some way to bucket or tag competencies for grouping is still wanted
eventually, so the question stays open as "design a future bucketing/tagging mechanism" rather than
"port the legacy fields". The legacy columns stay untouched on `Skill` (the site's chart and admin
filters keep working) until that mechanism exists.

**Constraint recorded 2026-08-10 (see decisions.md):** the registry is an exhaustive career catalog
whose membership is independent of syndication. Whatever bucketing/tagging mechanism is designed
must classify the whole catalog — including competencies no channel currently renders — and must
never gate membership by channel.
