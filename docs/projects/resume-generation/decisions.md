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

## 2026-08-10 — The competency registry is an exhaustive career catalog

**Decision:** The competencies registry is a **global, exhaustive catalog** of everything Nick has
used, learned, and worked with throughout his career. Membership in the catalog is never determined
by whether a competency appears in any syndication channel — resume, website, or LinkedIn. A
competency that renders nowhere is entirely legitimate and expected: the catalog is the history the
channels select from, which is what makes per-channel add/remove/visibility control possible from
one source of truth. Consequences: audits and future additions judge only whether something is a
real skill/technology/practice that was actually used — never whether it is displayed; the
`isVisible`/`excludedChannels` flags govern presentation only; and any future bucketing/tagging
mechanism must not gate membership by channel. Recorded as a README tenet, on the `Competency`
rehearsal type, in the legacy-skill mapping doc, and as a constraint on the open competency
categorization question.

**Why:** If membership tracked what channels display, the catalog would collapse into a mirror of
its own outputs and stop being usable as the source the channels draw from.

## 2026-08-11 — Carried-over model membership implemented (Project, Repository, Course)

**Decision (implementation record):** The three carried-over models are full members of the new
ecosystem, one sweep after the channels inversion. Schema: the same migration added `channels`, the
competency join tables, and `Course.degreeId`. Data: new TS modules
(`repositories.ts`/`projects.ts`/`courses.ts`) generated from the legacy prod JSON with skill links
translated through the audit mapping table (24 repositories, 4 projects, 24 courses; channel seeding
`visible → [WEBSITE]`, hidden → `[]`; courses re-parented by degree slug). The emitter writes three
new fixture files, and three new bindings joined the registry (repository depends on competency;
project on repository+competency; course on degree+competency). Push semantics mirror the `Company`
precedent — link against existing rows and write only the additive membership; a repository or
project not yet in the database is created whole, while a **new course cannot be pushed** (the
required legacy `educationId` is deliberately not in the fixture) and is reported instead. All ten
entities parse the fixture set with zero validation issues; resume output unchanged.

## 2026-08-11 — Channels-allowlist inversion implemented end to end

**Decision (implementation record):** `excludedChannels` → `channels` landed across every layer,
with `@default([])` now meaning **a record syndicates nowhere until channels are granted**:

- **Schema**: migration `20260811181344` renames the column on all eight parallel models and inverts
  existing rows in place (`channels` = every enum member EXCEPT the old exclusions), so effective
  syndication is unchanged; applied to the dev DB, client regenerated. The same migration lands the
  carried-over models' schema half: `channels` on `Project`/`Repository`/`Course`,
  `Course.degreeId`, and the three competency join tables.
- **Document layer**: `Syndicated.channels`; `permits()` checks membership; authored trees state
  channels explicitly at the root (`AllSyndicationChannels`) and nodes inherit, narrowing only — a
  grant the parent doesn't carry fails normalization ("no useless grants", replacing "no redundant
  exclusions"). All 177 competencies carry explicit grants (55 → `[LINKEDIN, WEBSITE]`); eleven node
  narrowings converted (seven website-only ports plus four pre-existing page-fit exclusions in the
  Craft tree).
- **Transfer layer**: codecs/bindings renamed; node channels resolve by a `stampContentTreeChannels`
  pass at parse (empty = inherit parent, mirroring slug stamping), so DB rows always carry explicit
  allowlists. All seven entities parse the regenerated fixtures with zero issues.
- **Verified**: emitted resume HTML byte-identical before and after.

**Why:** Nick's ruling — creation should syndicate nowhere by default; explicit grants make every
record's reach visible in the data instead of implied by absence.

## 2026-08-11 — Legacy-model disposition: Project, Repository and Course carry over intact

**Decision:** None of the three models without successors gets a redesign — all three receive the
`Company`/`School` treatment: reused intact with additive membership in the new ecosystem.

- **`Repository`** carries over as-is: it mirrors GitHub (the sync integration creates its rows), so
  its shape is dictated by the source. Additive: a `Competency` m2m (its skill links translate
  through the mapping table), `channels` participation, and a binding + `repositories.yaml`.
- **`Project`** carries over as-is: its fields already read like the new models. Additive:
  `Competency` m2m, `channels`, a binding + `projects.yaml` (repository/competency slug refs). A
  `ContentOwnerType.PROJECT` member is added **only when** the website wants rich project content —
  prod has no project details today, so nothing waits on it.
- **`Course`** carries over with an additive re-parent: a nullable `degreeId` FK to `Degree` lands
  alongside the legacy `educationId` (populated from the education ↔ degree correspondence), plus a
  `Competency` m2m and a binding + `courses.yaml` keyed by degree slug refs. `slug` is kept despite
  the schema comment doubting it: in the fixture layer, slug is the correlation key.

Implementation is sequenced **after the channels-allowlist inversion**, so all three models are born
with `channels` rather than migrated twice.

**Why:** The successor treatment exists for models whose shape was wrong (`Skill`'s taxonomy,
`Experience`/`Education`'s detail trees). These three have sound shapes; what they lack is
membership — competency links, channel participation, and fixture representation — all of which is
additive.

## 2026-08-11 — Proficiency buckets estimated from experience years

**Decision:** The 11 unrated competencies carrying a legacy `experience` value received proficiency
buckets, estimated from the year→bucket pattern in the already-rated set and adjusted by Nick: `CSS`
10y → ADVANCED, `Django` 10y → EXPERT, `Responsive Design` 8y → ADVANCED, `Matlab` and `Redux-Sagas`
5y → ADVANCED, `Bash`, `Clerk` and `React Native` 2y → PROFICIENT, `R` 2y → FAMILIAR
(academic-language treatment, matching C++), `AWS Lambda` and `Vue` 1y → FAMILIAR. Rated
competencies: 24 → 35. The 142 unrated competencies without years stay null — nothing renders from
proficiency outside `BARS` groups, all of whose members are rated. Verified: generated resume output
unchanged.

**Why:** Years are the only evidence available for unrated records, and calibrating against the
existing hand-rated pairs keeps the estimates consistent with claims already published.

## 2026-08-10 — Association-merge amendment: associations are sacred, chips are expendable

**Decision:** The case-(a) rule is enforced as Nick ruled it, with a clear priority order:
**role/degree ↔ competency associations are never removed — they are data the website and future
channels need — while resume chips are freely expendable.** A new chip may appear on a role/degree
only if the competency is a resume-sidebar member. The eleven old, non-sidebar competencies the
merge had spread to additional roles (`responsive-design`, `aws-s3`, `aws-ec2`,
`aws-elastic-beanstalk`, `react-redux`, `django-channels`, `websockets`, `mysql`, `mongodb`,
`react-native`, `pandas`) are **globally `RESUME`-excluded** (55 exclusions total, with the 44 port
additions), accepting that their existing curated chips disappear from the resume rows (e.g.
`pandas` off Rock Creek, `responsive-design`/`react-native` off Northbeam) — "it is fine if the
resume roles/degrees lose a skill or two; it is not fine to remove the relationship." One exemption:
**`django` is not excluded** and keeps all chips including its new GreenBudget/Nirveda attachments,
because "Django / DRF" represents it in the sidebar. An interim revert that removed the 23 new
attachments instead was rejected and undone — it protected chips by deleting relationships, exactly
backwards. Verified: associations fully restored, and every rendered new chip is a sidebar member or
django.

**Why:** The catalog principle extended to associations: data existence is never subordinated to
presentation. Per-association channel control (chip on role X, not role Y) remains future work with
the pill-display-controls item; until then, competency-level exclusion is the mechanism, and its
global blast radius on curated chips is an accepted cost.

## 2026-08-10 — Prose-comparison pass complete: seven website-only nodes port, seven skips

**Decision:** The compare-then-selectively-add pass over legacy prose is done. The comparison
collapsed dramatically because the prod content had been synced from the resume content: all ten
experience descriptions and the entire Craft and Northbeam detail trees are verbatim-identical to
authored nodes (no action), leaving fifteen genuinely divergent legacy items. Outcomes:

- **Ported as `RESUME`-excluded website nodes (7):** Corsha's "Notable Technical Contributions"
  (children: Component Library, Error Communication Protocols — with the prod typo "resusable"
  corrected to "reusable"), Nirveda's "Rebuild", Saracen's "Diff Reporting", The Atlantic's
  "Accounts API", and Rock Creek's "Transparency", "Rock Creek Insights", and "Asset
  Visualizations". Verified byte-identical generated output after the port.
- **Skipped as superseded (7, confirmed by Nick):** Corsha Leadership/Design/Planning & Road
  Mapping, GreenBudget Release, Nirveda Testing/Leadership, Atlantic Apple News — each is
  semantically carried by its role's authored summary in better form; the legacy wording remains in
  the legacy JSON only.
- **Scalar captures:** `profile.intro` and the JHU-computational `Degree.note` ("~50% of
  coursework") ported — neither field is rendered by any document component. `middleName` had
  already landed.
- **Conflicts resolved:** authored `displayName: 'Nick Florin'` wins over legacy `nickmflorin` (the
  username survives as `handle` and the GitHub URL); authored `linkedinUrl` (trailing slash) wins;
  legacy `profileImageUrl` is represented by `photoFileName`.

**Why:** The authored content was written as the deliberate successor of exactly this legacy prose;
porting reworded duplicates would recreate the two-renditions problem the flag-4 decision exists to
prevent, while the seven ported items are real accomplishments the website displays that appear
nowhere in the authored trees.

## 2026-08-10 — Association merge lands via competency-level channel exclusion

**Decision:** The legacy experience/education → skill associations merge into the new model **now**,
using competency-level syndication rather than waiting for per-owner pill controls. Three parts:

1. **The pipeline honors competency channels.** `resolveSyndication`/`resolveNode`/`resolveNested`
   filter every competencies list through the same `permits()` gate as nodes, so a chip renders only
   on channels the competency itself permits. Associations are data; chips are presentation.
2. **Catalog exclusions follow the a/b rule:** a competency already visible anywhere on the resume
   (sidebar or chips) stays resume-permitted, and the extra chips it adds to merged roles are an
   **accepted temporary difference** in the generated output; a competency visible nowhere on the
   resume carries `excludedChannels: [RESUME]` — which turned out to be exactly the 44 port
   additions. Every pre-existing catalog record was already resume-visible somewhere.
3. **The merge itself:** all eleven legacy experience skill lists and three education skill lists
   translated through the mapping table and appended to the owners' competencies lists (curated
   entries preserved in place, additions appended). Verified: the only output change is chips — zero
   non-chip diff lines in every emitted page; page 1 unchanged, page 2 +117 chips, page 3 +33.
   Degrees carry associations but render no chips (the Education component has no pill row).

Per-owner granularity — a shared competency chipping on one role but not another — was not needed
for this merge and remains with the pill-display-controls backlog item as a future enhancement.

**Why:** The models should behave like the Prisma models they mirror: associations recorded as m2m
data, presentation resolved per channel by the one cascade. Waiting for per-owner controls blocked
real data movement on a mechanism nothing yet requires.

**Alternatives considered:** Deferring the merge until per-owner pill controls exist (rejected:
blocks the port on unbuilt schema for a granularity nothing currently needs); separating association
lists from curated chip lists as distinct fields (rejected for now: diverges from the Prisma-mirror
principle; revisit if per-owner needs materialize).

## 2026-08-10 — Audit amendment: nine dropped skills reinstated

**Decision:** Nine of the 22 audit drops are reinstated as their own competencies: `git`, `pyenv`,
`nvm`, `npm`, `pip`, `CSS`, `HTML`, `jQuery`, `MeteorJS`. The mapping table
([context/legacy-skill-mapping.md](./context/legacy-skill-mapping.md)) is regenerated: **44** new
competencies and **13** remaining drops (`Client Side Rendering`, `Error Handling`, `SVGs`,
`HTML Templating`, `Package & Dependency Management`, `linux`, `Jira`, `Notion`, `ClickUp`,
`Clubhouse`, `Agile Software Development`, `VBA`, `@react-pdf`). Also confirmed: `pnpm` was never
dropped — it keeps its stop-1 fold into the existing `pnpm workspaces` competency.

**Why:** Nick's call on review of the drop list — these carry enough history/breadth signal to keep,
and competencies render nowhere unless referenced, so reinstating them costs nothing on any surface.

## 2026-08-09 — Legacy skill audit: the full 158-skill mapping is decided

**Decision:** Every one of the 158 legacy skills has a decided disposition, recorded as the port's
translation table in [context/legacy-skill-mapping.md](./context/legacy-skill-mapping.md): **67**
map to existing competencies directly (61 identical slugs, 6 slug variants where the YAML slug
wins), **31** fold into existing competencies, **38** map into **35 new competencies** (including
two consolidation concepts — `Authentication & Authorization` absorbing the JWT/session/protocols
trio, and `Application Security` absorbing `Security Practices`), and **22** are confirmed drops
(legacy-only): ambient tooling (`git`, `npm`, `nvm`, `pip`, `pyenv`, `linux`), PM products (`Jira`,
`Notion`, `ClickUp`, `Clubhouse`), process labels (`Agile Software Development`), fundamentals
carried by concrete tools (`HTML`, `CSS`, `SVGs`, `HTML Templating`,
`Package & Dependency Management`), non-skills (`Client Side Rendering`, `Error Handling`), and
dated tech (`jQuery`, `MeteorJS`, `VBA`, `@react-pdf`). Settled family-by-family in an eight-stop
walkthrough; notable calls: substantive AWS services stay individual (RDS, DynamoDB, ECS,
ElastiCache, Cloudwatch, IAM) while thin ones fold into `AWS`; academic parity kept
(`numpy`/`scipy`/`scikit-learn` alongside `pandas`, `Matlab`/`R`, `Optimization Methods`);
`Relational Databases` added for parity with the kept `NoSQL Databases`.

**Why:** The port translates every legacy `skills:` reference through this table, so it had to be
total — and auditing before porting keeps vague, duplicated, or superseded skills from ever entering
`competencies.yaml`. Drops don't delete anything: legacy JSON and models are untouched.

**Alternatives considered:** Porting all 158 mechanically and cleaning up afterward (rejected: junk
enters the canonical fixture layer and has to be destructively removed later, which the sync safety
rules make deliberately noisy).

## 2026-08-09 — Sync push preserves legacy `createdAt`; fixtures never author timestamps

**Decision:** Ported records carry no timestamps in YAML — the `meta:` block stays strictly
DB-write-back bookkeeping. In its place, a recorded **requirement on the sync engine**: when the
push creates a new-model row whose record has a legacy counterpart (competency ↔ skill, role ↔
experience, degree ↔ education, company/school/profile ↔ themselves), it seeds `createdAt` from the
legacy row rather than `now()`. The mechanism is designed as part of the sync-engine build, which is
the next roadmap item anyway.

**Why:** `createdAt` is load-bearing: the 2026-08-04 ordering decision derives website competency
order from prioritized-then-`createdAt`, so fresh timestamps at push time would scramble today's
website ordering at adoption. Authoring timestamps into fixtures would overload transfer bookkeeping
with authored data.

**Alternatives considered:** Relaxing the `meta:` schema so legacy timestamps can be authored
(pollutes the bookkeeping/authored-state separation); accepting fresh timestamps with the audit
assigning explicit order (re-introduces stored ordering, which the 2026-08-04 decision deliberately
rejected).

## 2026-08-09 — Port visibility maps 1-1; empty legacy detail fields port nothing

**Decision:** Legacy `visible: false` maps to `isVisible: false` — hidden everywhere. Verified by
direct count against the prod JSON: exactly **one** hidden record exists (the USLege.ai Founding
Senior Software Engineer experience), and it ports hidden, reproducing today's behavior (off the
website, absent from the resume). Also verified: across all 36 prod details, `highlighted` is never
true and `shortDescription` is never set — so neither field ports, no schema accommodation is
needed, `Detail.shortDescription`'s successor remains the variant table (2026-08-04), and
detail-level highlighting is confirmed unread by any public-site rendering code.

**Why:** The counts collapse what looked like three mapping questions into zero-data non-issues, and
the single hidden record's semantics (`hidden everywhere`) match `isVisible: false` exactly.

**Alternatives considered:** Mapping legacy `visible: false` to `excludedChannels: [WEBSITE]`
(rejected: leaves the record eligible for resume/LinkedIn syndication, which differs from today's
behavior).

## 2026-08-09 — JSON→YAML port scope: models without successors deferred, designed next

**Decision:** The port of legacy prod data (the JSON seed fixtures, confirmed current with
production) into the YAML fixture layer covers only the aggregates that have successor bindings:
Profile, Company, Role, Degree, School, Competency, and ResumeSheet. `Project` (4 records),
`Repository` (22), and `Course` (~15, nested in schools) have no successor models or bindings; they
are **deferred from this port**, and designing their successors becomes the immediate next task
after the port completes — through the same research → recommendation → decision process the other
models received. The port is additive with respect to the YAML files: nothing already authored is
deleted, and the generated resume PDF/HTML output must be byte-equivalent before and after.

**Why:** The syndication-channel participation of Project/Repository/Company/School is one of the
five unresolved open questions from the paused research walkthrough; designing those models inline
would block the port on design work it does not need, while dropping them entirely would abandon the
single-source-of-truth goal.

**Alternatives considered:** Designing the successor models first (blocks the port); leaving
projects/repositories/courses on legacy models permanently (contradicts the project charter).

## 2026-08-09 — Skill taxonomy does not port; the audit designs its successor

**Decision:** The legacy `Skill` taxonomy fields — `categories`, `programmingLanguages`, and
`programmingDomains` — are **held out of the JSON→YAML port**. `Competency` gains no equivalent
columns yet. The planned skills audit (concreteness, duplicates, supersets) doubles as the design
pass for a successor categorization scheme; the schema fields, codecs, YAML representation, and
ported values all follow from what the audit produces. Until then the legacy JSON/models remain the
only carrier of the taxonomy, so nothing is lost by deferring.

**Why:** The audit exists precisely because the current skill set — and by extension its
categorization — is not trusted as-is. Porting the taxonomy verbatim would enshrine a scheme that is
about to be redesigned, and the website features that read it (dashboard chart, skill filters) still
read the legacy models today.

**Alternatives considered:** Porting all three fields 1-1 now with the audit refining values later
(rejected: bakes in a scheme the audit may replace); porting only `categories` (rejected: same
problem, partially).

## 2026-08-09 — Legacy prose ports by comparison, not wholesale

**Decision:** Legacy experience/education `description` values and `details`/`nestedDetails` trees
enter `roles.yaml`/`degrees.yaml` through a **compare-then-selectively-add** pass, not a mechanical
copy. For each role/degree, legacy prose is compared against the content nodes already authored for
the resume: legacy items with no semantic counterpart port in as nodes carrying
`excludedChannels: [RESUME]` (captured for the website, invisible to the generated documents); items
that overlap an authored node are flagged for an item-by-item ruling rather than silently duplicated
or dropped. The generated PDF/HTML must be unchanged by the port.

**Why:** The authored trees are curated rewrites of the same underlying content the legacy details
carry; wholesale duplication would leave every role holding two renditions of its own history
forever, while skipping legacy prose entirely would silently lose website content the new models are
supposed to power.

**Alternatives considered:** Porting every legacy detail as a website-only node (complete but
pollutes the trees with near-duplicates); treating the curated trees as superseding legacy prose
(loses prod content without review).

## 2026-08-04 — Per-context text: one variant table, built when the third context arrives

**Decision:** Per-context text variation — both prose (the `Detail.shortDescription` successor
question) and labels (`label`/`shortLabel` generalization) — is one mechanism, not two: a single
variant table keyed by owner + field + context resolving to a string. The direction is committed
now, but the table is **built only when the first real third context arrives** (LinkedIn wording or
tailored per-application resumes); the existing nullable `shortX` columns remain the fast path for
the two contexts that exist today. This resolves the standing "blocks the schema" flag:
`ContentNode` deliberately carries no `shortDescription` column, and nothing else waits on this.

Deferred to the table's design, recorded here so they are not lost: whether the key is a
`SyndicationChannel` or a finer-grained _surface_ (the sidebar and main column are two surfaces of
one channel), and whether a context can select a **set** of strings from one record — the three
`Accessibility` competencies were kept separate precisely because one record cannot yet render as
several pills.

**Why:** Solving prose and label variation separately would leave two mechanisms for one idea, and
building the table before any third context exists would be speculative schema with nothing to
exercise it.

## 2026-08-04 — Sync safety: what is destructive, how it is confirmed, atomic conflicts

**Decision:** The three open sub-questions of destructive-change safety are settled:

1. **Destructive** means record deletions and any change to a non-empty value, including clearing
   it. Filling an empty/null field is additive and applies without confirmation.
2. **Confirmation is per-batch and itemized.** A run prints one git-style diff of the whole change
   set, with destructive changes in their own section, confirmed once as a group; a script argument
   (`--yes`) bypasses confirmation globally for scripted runs. The review surface should grow into a
   **navigable terminal viewer**: every change rendered as a single summary line, with arrow-key
   navigation selecting a line to reveal that change's full diff. Per the charter's keep-it-simple
   note, v1 is the plain printed diff plus a single confirmation; the navigable viewer layers on
   after.
3. **Conflicts are atomic per record in v1.** When both sides changed a record since the last sync,
   the record's diff is shown and one side is chosen whole. Field-level merging is deferred until
   real usage shows it is needed.

**Why:** Deletions and overwrites of authored values are exactly the two failure modes the sync
exists to prevent happening silently; per-record prompting does not scale to 150+ records, while one
itemized batch diff keeps the whole change set reviewable; and atomic conflict resolution keeps the
v1 engine simple enough to trust.

## 2026-08-04 — Sync parity is absolute: no soft delete between source and target

**Decision:** The sync's invariant is **100% parity** between the fixture data and the database. The
source of a run is the source of truth: a record present on the target but missing from the source —
of ANY type, top-level or nested — is **hard deleted**, gated by the destructive-change confirmation
above. There is no soft delete in the sync, ever. `isVisible: false` is exclusively an _authored_
content state — used to hide content deliberately, temporarily or to keep it without displaying it —
and is never written by the sync as a stand-in for deletion. (This clarifies the charter's "avoid
hard deleting, hide visibility instead" line: that describes authoring practice — prefer hiding
content in the data over removing it — not sync mechanics.)

One caveat of the parallel period: deleting a reused legacy row (`Company`, `School`, `Profile`)
that legacy relations still reference will be blocked by foreign-key constraints; the attempted
delete appears in the diff, and the constraint failure surfaces as a run error rather than being
silently skipped.

**Why:** A sync that translates "delete" into "hide" leaves the two representations permanently
disagreeing about what exists, which defeats the correlation the whole system is built on — and
quietly redefines an authored, meaningful flag as transfer bookkeeping.

## 2026-08-04 — Slugs are optional to author; derived at parse time, sticky thereafter

**Decision:** Authoring a slug in a fixture is optional for every entity that has a natural name.
`ContentBinding.parse` fills a missing slug deterministically via a per-binding `deriveSlug` —
`Competency` from its label, `Company`/`School` from their name, `Profile` from its display name,
`Role` from company + title, `Degree` from school + major — and serialization writes the derived
slug back into the fixture, making it sticky exactly like content-node slugs. `ResumeSheet` is the
one exception: its slug doubles as the emitted filename and has no natural name, so it stays
required (parse fails loudly without it).

The load-bearing detail is **where** derivation happens: at parse time, not at database-write time.
Every fixture consumer — the sync push _and_ a fixture-only resume generation run — parses through
the same binding and therefore sees the same slug for the same record, with no database involved. A
generation run before the write-back has happened still agrees with what the push will eventually
persist, because the derivation is deterministic. Type-wise, `parse` returns a `ParsedRecord` (slug
guaranteed present), so nothing downstream ever handles a missing slug.

**Why:** Slugs are the correlation key, but requiring one on every hand-authored record is friction
with no information content when the record already has a name. Duplicate-derived slugs are caught
by the set-level duplicate validation, and referencing a new record from elsewhere in the fixtures
is still predictable, since the derived slug is just the slugified name.

Derivations deliberately favor **collision resistance over brevity**: `Role` and `Degree` prefix
their parent's slug (`craft-education-system-staff-engineer`, not `staff-engineer`) so that the same
title at two companies, or the same major at two schools, can never derive the same slug. A longer
slug costs nothing; a collision costs a hard failure and a manual rename. Short slugs remain
available by simply authoring one.

## 2026-08-04 — Competency ordering is derived, never stored

**Decision:** No competency (successor to skill) ever carries a stored order, anywhere — the
implicit m2m join tables stay as they are, with no `order` column and no ordered scalar lists.
Ordering is derived per surface:

1. **Website:** prioritized competencies first (`isPrioritized: true`), then the rest — each group
   ordered by `createdAt`.
2. **Resume body** (a role's or degree's chip row): the same rule as the website — prioritized, then
   `createdAt`.
3. **Resume sidebar** (bars/pills groups): the generation build step derives the order by optimizing
   pill spacing/size within the sidebar's width; it is a layout computation, not data.

Consequently a fixture's competency lists are **membership sets, not sequences**: pulls emit them
sorted by slug for deterministic diffs, and the order they happen to hold in a fixture carries no
meaning. The first pull will normalize the bootstrapped lists (which retain the TS data modules'
authoring order) to slug order — an expected one-time diff.

**Why:** Maintaining an authored position for every competency across every group, chip row and node
(140+ records, many memberships each) is exactly the kind of bookkeeping that rots. The two signals
the ordering actually needs — deliberate emphasis and recency — already exist as `isPrioritized` and
`createdAt`, and the one surface where geometry matters (the printed sidebar) is better served by
computing fit than by hand-maintaining positions. Supersedes the "preserve authored m2m ordering"
backlog item raised while building the transfer layer.

## 2026-08-04 — Transfer architecture: bindings and codecs in `src/database/content/`

**Decision:** The fixture ⇄ database transfer mechanics are an object-oriented module at
`src/database/content/`, structured around three ideas:

1. **Two codecs, not two directions.** A canonical in-memory form sits between the representations;
   each representation gets one codec (`RecordCodec` for the fixture side, `PrismaCodec` for the
   database side), and a sync direction is just composition — push is fixture-decode then
   database-create, pull is database-read then fixture-encode. Elision rules and representation
   rules are stated once per field and cannot drift between directions.
2. **Field codecs as the atomic unit.** An entity is defined by a record of `FieldCodec`s — a
   validation-only zod schema plus explicit `decode`/`encode` halves per field. The entity's strict
   fixture schema, its fixture type, and its canonical type all derive from that one record
   (`CanonicalRecord<typeof XFields>`); the Prisma side is compile-checked against the generated
   client, so a schema change breaks the codec at build time. Nested shapes compose through
   `recordField`/`recordListField`, which is how aggregates (a role and its content tree) are one
   fixture record but many rows.
3. **One `ContentBinding` class per aggregate** (`CompetencyBinding`, `CompanyBinding`,
   `SchoolBinding`, `ProfileBinding`, `RoleBinding`, `DegreeBinding`, `ResumeSheetBinding`): a
   stateless descriptor holding the field record, both codecs, the fixture file identity, dependency
   keys, entity invariants (`validate`), and canonicalization hooks (`finalize` — where sticky
   content-node slugs are stamped). Ports and adapters appear exactly once: the `ContentStore`
   interface with `YamlFixtureStore` (constructor-injected directory) and `PrismaContentStore`
   (constructor-injected transaction + write-context) adapters. The registry (`ContentBindings`) is
   dependency-ordered, and `validateContentSet` fails hard on duplicate slugs and unresolvable slug
   references before anything is written.

Settled semantics along the way: database writes are **create-only** for the empty parallel tables
(update/diff belongs to the sync engine); the reused legacy models (`Company`, `School`, `Profile`)
get **create-or-link** semantics — an existing row matched by slug-then-unique-name has only the
additive columns written, and destructive prose-row replacement is refused with a warning; a pull of
a legacy row without a slug derives one from its name and warns.

**Why:** Verified by round-tripping all seven real fixture files through the bindings —
`parse(serialize(x))` is deep-equal to `x` for every entity, and the cross-reference validation of
the full set passes. Naming: `*Binding` was chosen over `*Entity`/`*Transfer`/`*Mapper`/
`*Bridge`/`*Gateway` because "binding" is the established term for tying one system's representation
to another's.

## 2026-08-04 — Parallel Prisma schema landed; legacy `Degree` enum renamed to `DegreeType`

**Decision:** The parallel new-model foundation now exists in `schema.prisma` and is migrated
(`20260804145452_parallel_content_models`, applied to the dev database): the syndication/content
enums (`SyndicationChannel`, `ContentOwnerType`, `NodeKind`, `NodeType`, `TitleLayout`,
`Proficiency`, `ContactIcon`, `ResumeCompetenciesGroupDisplay`) and the models `Competency`, `Role`,
`Degree`, `ContentNode`, `NestedContentNode`, `ProfileAboutParagraph`, `ProfileHighlight`,
`ProfileContactEntry`, `ResumeSheet` and `ResumeCompetenciesGroup`, mirroring the rehearsal types in
`src/documents/resume/data/types.ts` field for field. Legacy models gain only additive columns:
`Company`/`School` a nullable unique `slug`, `logoFileName` and the new reverse relations; `Profile`
a nullable unique `slug`, `handle`, `photoFileName` and the `about`/`highlights`/ `contacts`
relations. The slugs stay nullable until the fixture sync backfills them. Settled along the way:

1. **The legacy `Degree` enum is renamed `DegreeType`, in the database too.** The rehearsal plan
   ("the enum is the one that moves") anticipated the Prisma-namespace collision with the new
   `Degree` model; what `@@map` could not hide is that in Postgres a table's row type shares the
   type namespace with enums, so the old type name could not survive alongside a `Degree` table. The
   migration performs a metadata-only `ALTER TYPE "Degree" RENAME TO "DegreeType"`, and the site's
   references were mechanically renamed (seven files, no behavior change).
2. **`ContentOwnerType` values are `ROLE | DEGREE`**, following the new model names rather than
   resume-gen's `EXPERIENCE | EDUCATION` — settling the question flagged in the backlog.
3. **Competency ↔ sidebar-group is many-to-many** (`groupCompetencies`), as the rehearsal types
   model it — superseding the earlier backlog sketch of an optional FK on `Competency`.
4. **Not yet modeled:** `Competency`'s links to the legacy `Course`/`Project`/`Repository` models
   (the analogue of `Skill`'s m2m set) — deferred to the syndication-modeling research item.

**Why:** Step 3 of the data-management sequencing. Landing the schema as a faithful transcription of
the rehearsal types keeps one design in two representations rather than two designs; anything the
rehearsal has not settled (per-medium display, `shortDescription` variants, categorization) lands
later as follow-up migrations, which the parallel-model approach makes cheap.

## 2026-08-04 — `isHighlighted` stays a boolean: dashboard presence, subordinate to website syndication

**Decision:** `isHighlighted` on the new models (`Competency`, `Role`, `Degree`, and the successor
of any other legacy model carrying `highlighted`) remains a plain boolean with a single meaning:
whether the record appears on the website's dashboard page. It is subordinate to syndication — it
has meaning only when the record actually syndicates to the `WEBSITE` channel (`isVisible: true` and
`WEBSITE` not excluded). For a record withheld from the website the flag is simply inert: never
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
`profile.yaml`, `roles.yaml`, `degrees.yaml` and `resume-sheets.yaml` (a competency group belongs to
exactly one sheet, so groups nest inside the sheets file). The settled details:

1. **YAML as the serialization format.** The content is prose-dominant, and YAML's folded scalars
   store a paragraph as wrapped plain lines, so a one-word edit diffs as prose rather than as one
   enormous escaped JSON line. YAML also carries comments, and the `yaml` package (now a pinned
   devDependency) can rewrite a document by mutating values in place should comment preservation
   ever be needed on a machine rewrite.
2. **One file per model, not one file per record.** Array position within a file derives the Prisma
   `order` value (see 3), and separate per-record files have no inherent order, which would
   reintroduce explicit `order:` fields or a manifest. Scoped diffs — the per-record layout's main
   draw — already fall out of YAML's line-based prose. Revisit only if a file becomes unwieldy.
3. **Fixtures store the authoring shape, not the normalized shape.** `order` is implied by array
   position; fields carrying their default are omitted entirely (`isVisible: true`,
   `excludedChannels: []`, `false`-valued flags, `null`s); relations are slug references; enum
   values are the SCREAMING_SNAKE strings that become Prisma enum identifiers verbatim, so no
   mapping layer sits between fixture, zod schema and Prisma.
4. **Slug is the correlation key.** Database identity (`id`, `createdAt`, `updatedAt`) surfaces only
   as metadata — an optional `meta:` block that the first push writes back and a newly authored
   record simply omits — while sync correlation relies on slugs above all else. Content-node slugs,
   derived from titles by normalization today, become **sticky**: stamped into the fixture once
   generated, so a later title edit never silently changes identity into a delete-plus-create.
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
   modules and are re-emitted. The data modules retire together with the old fixture layout once the
   Prisma migration is complete, at which point the YAML files become the authored surface.

**Why:** The fixture format has to satisfy four pulls at once — machine-writable (DB pull),
machine-readable (DB push), pleasant for Claude to iterate on without a database, and readable in a
git diff — and prose-heavy content is where JSON fails the last two hardest. Authoring shape was
chosen over normalized shape because the fixtures are an editing surface first: explicit `order`
columns are renumbering noise a human will get wrong, while array order cannot be wrong.

**Alternatives considered:** JSON (round-trips cleanly and the existing machinery exists, but no
comments and paragraph edits diff as one line); TypeScript modules (best authoring ergonomics, but
not machine-writable in any principled way); a TS-authoring/JSON-sync hybrid (a pull can only update
the generated artifact, leaving the authored TS stale — two sources of truth inside the fixture
layer itself); Markdown with YAML frontmatter (per-node syndication flags and identity cannot attach
to markdown sections, so the frontmatter swallows the document); JSON5/JSONC (comments, but the
prose problem remains and no mature comment-preserving writer); per-record files (rejected per 2 —
deletion visibility is the sync tool's diff output instead).

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
