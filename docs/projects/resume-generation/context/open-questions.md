# Open Questions

Unresolved questions that need discussion or a decision. When one is resolved, move the outcome to
[decisions.md](../decisions.md) and delete it from here.

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

Both directions are required (DB → fixture exists via `jsonify`, prod-only and full-dump; fixture →
DB exists only as full reload into an empty DB via `seed`). Open questions: incremental sync vs.
full dump/reload, conflict handling when both sides changed, whether fixtures are the canonical
editing surface for Claude-driven iteration, id stability across environments (resume-gen uses
deterministic path-style ids; the app uses uuids), and how seeding relates to syncing.

## LinkedIn & GitHub integration scope

LinkedIn syndication and GitHub-driven skill/content discovery are stated goals. No LinkedIn
integration exists today (just a URL string on `Profile`). Not yet scoped: which LinkedIn API
surfaces are actually available for profile updates, and what the deterministic vs. Claude-assisted
GitHub sync flows look like. The existing GitHub client is create-only and does not validate API
responses.
