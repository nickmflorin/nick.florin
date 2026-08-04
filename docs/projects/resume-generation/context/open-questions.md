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

## `Detail.shortDescription` disposition (blocks the schema)

The one open question flagged in resume-gen's `docs/content-model.md` that changes the shape of
`ContentNode`. Three options are laid out there; option 1 (a `ContentVariant` table keyed by node +
channel) would also answer the broader "medium-specific content overrides" need (e.g. shorter text
on the PDF than the website). Needs a decision before the Prisma schema lands.

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

**Round-tripping identity.** Writing back to the database has to preserve the rows that already
exist rather than recreating them. That means the fixture format has to carry `id`, `createdAt` and
`updatedAt` — but _optionally_, so that a record Claude just authored has none and lets Prisma
populate them, while a record that came from a previous pull keeps the ones it had. The rehearsal
types deliberately omit these fields (see `src/documents/resume/data/types.ts`); the fixture format
is where they have to come back.

**Format.** Undecided. The existing fixtures are JSON, which round-trips cleanly and diffs per-line,
but is poor to author by hand and cannot carry a comment explaining why a record is the way it is.
TypeScript modules — what `src/documents/resume/data/` uses today — are far better to author and can
express a shared record as a constant referenced from several places, but are not straightforwardly
writable by a machine pulling from the database. A hybrid (author in TypeScript, sync through JSON)
is a third option and needs its own answer for how a pull merges into authored code.

**Destructive-change safety.** A pull that silently drops a record someone added on the other side,
or a push that overwrites a field edited in the admin CMS, is the failure mode that matters. The
candidate is a diff-style flow: compute the change set, print it, and require confirmation for
anything destructive — deletions and overwrites of non-empty values — unless a flag opts out for
scripted runs. Open: what counts as destructive, whether confirmation is per-record or per-batch,
and whether the two sides can be merged field-by-field rather than record-wise when both changed.

## LinkedIn & GitHub integration scope

LinkedIn syndication and GitHub-driven skill/content discovery are stated goals. No LinkedIn
integration exists today (just a URL string on `Profile`). Not yet scoped: which LinkedIn API
surfaces are actually available for profile updates, and what the deterministic vs. Claude-assisted
GitHub sync flows look like. The existing GitHub client is create-only and does not validate API
responses.

## Contextual representation of labels and content

A competency, a degree major, a role title and a content node all render in more than one place, and
the right string is not always the same one. The current answer is a single nullable short form —
`label`/`shortLabel`, `major`/`shortMajor` — with the surface choosing: the resume sidebar takes the
short form, the main column takes the full one. That covers two contexts and no more.

Open questions, in rough order of how far they push the model:

1. **More than two contexts.** LinkedIn, the website and a tailored per-application resume each want
   their own wording. Does that become one nullable column per context (does not scale), a
   `SyndicationChannel`-keyed variant table (scales, and is the same shape the
   `Detail.shortDescription` question above is circling), or something keyed by a finer-grained
   "surface" than a channel — since the sidebar and the main column are two surfaces of the _same_
   channel?
2. **One record rendering as several things.** The three `Accessibility` competencies were kept
   separate specifically because collapsing them would have dropped the `WCAG` and `axe-core`
   tokens. The better model may be one `Accessibility` competency that a given context can render as
   several pills — meaning a context needs to select not just a _string_ but a _set of strings_ from
   one record. Nothing in the current shape can express that.
3. **Relationship to the content tree.** Whatever answers this should almost certainly also answer
   `Detail.shortDescription`, since "a shorter version of this prose on the PDF than on the website"
   and "a shorter version of this label in the sidebar" are the same problem at different
   granularity. Solving them separately would leave two mechanisms for one idea.

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
