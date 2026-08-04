/**
 * The resume's data model, written as TypeScript but shaped as a Prisma schema.
 *
 * Every exported interface below stands in for a model that will be created in
 * `src/database/prisma/schema.prisma`, under the same name and with the same fields. Nothing here
 * touches Prisma yet: this is the rehearsal, and it exists so that the shape can be exercised
 * against real content and a real renderer before it is committed to a migration.
 *
 * The new models are built in PARALLEL with the existing schema and never collide with it, which is
 * why `Skill` became {@link Competency}, `Experience` became {@link Role}, and `Education` became
 * {@link Degree}. A handful of legacy models are reused rather than replaced; they are marked as
 * such below.
 *
 * ## Relations
 *
 * A relation is written as a nested object or array of objects, never as a foreign-key scalar. It
 * is declared on exactly ONE side — whichever side the renderer traverses — so that the types stay
 * acyclic and a record can be written as a plain constant. {@link Role} therefore names its
 * {@link Company}, while {@link ResumeSheet} names its roles. Prisma will carry the reciprocal
 * side and the scalar key; both are listed under "Prisma Additional Fields".
 *
 * A record that belongs to several parents is declared once as a module constant and referenced
 * wherever it appears. That shared identity is what becomes a join row.
 *
 * ## Omitted fields
 *
 * Fields the database generates are left off these types entirely, because supplying them by hand
 * in the data files would be noise. They are enumerated per model under "Prisma Additional Fields"
 * so that nothing is lost on the way to the schema. Unless a model says otherwise, that means the
 * standard audit set:
 *
 * - `id` — `String @id @default(uuid()) @db.Uuid`
 * - `createdAt` — `DateTime @default(now())`
 * - `createdById` — `String @db.Uuid`
 * - `createdBy` — `User @relation("created<Model>s", fields: [createdById], references: [id])`
 * - `updatedAt` — `DateTime @updatedAt`
 * - `updatedById` — `String @db.Uuid`
 * - `updatedBy` — `User @relation("updated<Model>s", fields: [updatedById], references: [id])`
 *
 * `slug` is NOT omitted. It is authored rather than generated, it is unique, and it is what URLs
 * and React keys are keyed off — the database id never appears in either.
 *
 * ## Conventions
 *
 * 1. Enum VALUES are `SCREAMING_SNAKE`, because Prisma enum members are identifiers and these
 *    strings become those identifiers verbatim.
 * 2. `null` means Prisma `null`, never `undefined`. The authoring types at the bottom of this file
 *    are the exception: they are what a human writes, and `../lib/normalize.ts` turns them into
 *    these model types.
 * 3. Every boolean on a new model is named `isSomething`. The reused legacy models keep the names
 *    they already have.
 * 4. A text field that may need to render in a narrow column carries a nullable `shortX` companion
 *    alongside its full form — `major`/`shortMajor`, `minor`/`shortMinor`, `label`/`shortLabel`.
 *    Null means the full form is short enough. Which one a surface uses is the surface's decision:
 *    the resume sidebar takes the short form where one exists, the main column takes the full one.
 *    The content tree is deliberately excluded from this, because per-channel prose overrides are
 *    the open `Detail.shortDescription` question and want a table, not a second column.
 *
 * BEFORE CHANGING THE CONTENT MODEL, READ the `resume-gen` repository's `docs/content-model.md`.
 * It carries the reasoning behind the shape — in particular why the content tree is two concrete
 * levels rather than self-recursive, and why roles and degrees are not merged into one model.
 */

/* -------------------------------------------------------------------------------------------- *
 * Enums
 * -------------------------------------------------------------------------------------------- */

/**
 * A medium the content can be published through. Modeled as an enum rather than one boolean column
 * per channel so that adding a channel (a tailored per-application resume variant, say) is a new
 * enum value rather than a migration on three tables.
 */
export enum SyndicationChannel {
  LinkedIn = 'LINKEDIN',
  Resume = 'RESUME',
  Website = 'WEBSITE',
}

/**
 * What a top-level content node hangs off. This is the polymorphic discriminator, and it lives on
 * the CHILD pointing up, never as a `type` column on a merged parent table: roles and degrees stay
 * separate models with their own relations and unique keys, and share one content tree between
 * them.
 */
export enum ContentOwnerType {
  Degree = 'DEGREE',
  Role = 'ROLE',
}

/**
 * Distinguishes the two roles a top-level node can play. Summaries are the opening prose of a role
 * or degree; content nodes are the body beneath it.
 *
 * Summaries sort as a SET above content, not by interleaved index, so the sort key for top-level
 * nodes is `(kind, order)` with `SUMMARY` ordering before `CONTENT`.
 */
export enum NodeKind {
  Content = 'CONTENT',
  Summary = 'SUMMARY',
}

/**
 * How a top-level content node presents its children.
 *
 * `PARAGRAPH` is the default and means the node is standalone prose. The list types render their
 * children as `<ol>` / `<ul>`. Because only top-level nodes carry a type and nested nodes never do,
 * "a list may only contain paragraphs" is enforced structurally rather than by convention.
 */
export enum NodeType {
  BulletedList = 'BULLETED_LIST',
  NumberedList = 'NUMBERED_LIST',
  Paragraph = 'PARAGRAPH',
}

/**
 * Where a node's title sits relative to its content. Only meaningful when the node has both.
 *
 * Nullable because the default is DERIVED from context rather than stored: inside a list the
 * default is `INLINE`, otherwise `STACKED`. Resolve it at render time with `resolveTitleLayout`;
 * never persist the derived value, or changing the parent's type silently leaves stale layouts
 * behind.
 */
export enum TitleLayout {
  /**
   * Title runs inline with the content, separated by a dash.
   */
  Inline = 'INLINE',
  /**
   * Title sits on its own line above the content.
   */
  Stacked = 'STACKED',
}

/**
 * The academic level of a {@link Degree}, carried forward verbatim from the legacy `Degree` enum.
 *
 * The legacy enum's name is taken by the {@link Degree} model, so the enum is the one that moves.
 */
export enum DegreeType {
  BachelorsOfScience = 'BACHELORS_OF_SCIENCE',
  MastersOfScience = 'MASTERS_OF_SCIENCE',
  MastersOfScienceInEngineering = 'MASTERS_OF_SCIENCE_IN_ENGINEERING',
}

/**
 * How well a {@link Competency} is known.
 *
 * This is the primary metric going forward, replacing the derived year count that the legacy
 * `Skill` model leans on. It is a closed set of tiers because it drives both the badge text and the
 * fill width and color of a competency bar.
 */
export enum Proficiency {
  Advanced = 'ADVANCED',
  Expert = 'EXPERT',
  Familiar = 'FAMILIAR',
  Proficient = 'PROFICIENT',
}

/**
 * The icon shown beside a {@link ProfileContactEntry}.
 *
 * An enum rather than a filename so that the icon set is closed and a typo cannot silently render
 * a missing image; the mapping to a file lives in the renderer.
 */
export enum ContactIcon {
  At = 'AT',
  GitHub = 'GITHUB',
  Globe = 'GLOBE',
  LinkedIn = 'LINKEDIN',
}

/**
 * Whether a {@link ResumeCompetenciesGroup} renders its members as proficiency bars or as bare
 * pills.
 *
 * Purely presentational. The proficiency itself lives on the {@link Competency}, so a group that
 * renders pills is hiding a value it still has rather than lacking one.
 */
export enum ResumeCompetenciesGroupDisplay {
  Bars = 'BARS',
  Pills = 'PILLS',
}

/* -------------------------------------------------------------------------------------------- *
 * Reused legacy models
 *
 * These are NOT being replaced. They are stable, purely relational, and carry no syndication
 * decisions of their own — whatever points at them already answers for itself. They are declared
 * here so the rehearsal is self-contained, mirroring `schema.prisma` field for field, and they keep
 * the legacy field names rather than adopting the `is` prefix.
 * -------------------------------------------------------------------------------------------- */

/**
 * An employer, reused from the legacy schema.
 *
 * Two additive changes land when the new models do: the `logoFileName` below, and a `roles Role[]`
 * reverse relation alongside the existing `experiences Experience[]`. Neither disturbs anything
 * reading the model today.
 *
 * Prisma Additional Fields: the standard audit set, plus:
 *
 * - `experiences` — `Experience[] @relation("experiences")` (existing, legacy)
 * - `roles` — `Role[] @relation("roles")` (added)
 */
export interface Company {
  /**
   * Nullable here although the legacy column is required, because the resume references an employer
   * that has no row in the database yet and inventing a headquarters for it would be a fabricated
   * fact. Every company must carry one before these records are migrated.
   */
  readonly city: null | string;
  readonly description: null | string;
  /**
   * Basename of a logo vendored under `public/documents/logos/`, including the extension.
   *
   * Distinct from {@link Company.logoImageUrl}, which is a remote URL. A generated resume is
   * printed from the local filesystem and bundled into a single self-contained file, so it cannot
   * depend on a network fetch; this is the copy that travels with the document.
   */
  readonly logoFileName: null | string;
  readonly logoImageUrl: null | string;
  readonly name: string;
  readonly shortName: null | string;
  readonly slug: string;
  /**
   * Nullable for the same reason as {@link Company.city}: an employer that has not been migrated
   * has no headquarters on record, and inventing one would be a fabricated fact.
   */
  readonly state: null | string;
  readonly websiteUrl: null | string;
}

/**
 * A degree-granting institution, reused from the legacy schema.
 *
 * Gains the same two additive changes as {@link Company}: a local logo reference, and a
 * `degrees Degree[]` reverse relation beside the existing `educations Education[]`.
 *
 * Prisma Additional Fields: the standard audit set, plus:
 *
 * - `educations` — `Education[] @relation("educations")` (existing, legacy)
 * - `degrees` — `Degree[] @relation("degrees")` (added)
 */
export interface School {
  readonly city: string;
  readonly description: null | string;
  /**
   * Basename of a logo vendored under `public/documents/logos/`; see {@link Company.logoFileName}.
   */
  readonly logoFileName: null | string;
  readonly logoImageUrl: null | string;
  readonly name: string;
  readonly shortName: null | string;
  readonly slug: string;
  readonly state: string;
  readonly websiteUrl: null | string;
}

/**
 * The person the resume is about, reused from the legacy schema.
 *
 * The prose that surrounds the profile on the printed page is not stored here. It lives in
 * {@link ProfileAboutParagraph} and {@link ProfileHighlight} so that each paragraph carries its own
 * ordering and can be withheld from a channel independently.
 *
 * Prisma Additional Fields: the standard audit set, plus:
 *
 * - `aboutParagraphs` — `ProfileAboutParagraph[] @relation("aboutParagraphs")`
 * - `highlights` — `ProfileHighlight[] @relation("highlights")`
 * - `contactEntries` — `ProfileContactEntry[] @relation("contactEntries")`
 */
export interface Profile {
  readonly aboutParagraphs: readonly ProfileAboutParagraph[];
  readonly contactEntries: readonly ProfileContactEntry[];
  readonly displayName: string;
  readonly emailAddress: string;
  readonly firstName: string;
  readonly githubUrl: null | string;
  /**
   * The social handle rendered beneath the name, for example `@nickmflorin`. Stored rather than
   * parsed out of {@link Profile.githubUrl}, since the two are not required to agree.
   */
  readonly handle: null | string;
  readonly highlights: readonly ProfileHighlight[];
  /**
   * Nullable here although the legacy column is required. The paragraphs in
   * {@link Profile.aboutParagraphs} supersede it for the resume, and duplicating the first of them
   * into a second field would create two sources for one fact.
   */
  readonly intro: null | string;
  readonly lastName: string;
  readonly linkedinUrl: null | string;
  readonly middleName: null | string;
  readonly phoneNumber: null | string;
  /**
   * Basename of the headshot vendored under `public/documents/logos/`; see
   * {@link Company.logoFileName} for why a local copy exists beside the remote URL.
   */
  readonly photoFileName: null | string;
  readonly profileImageUrl: null | string;
  readonly slug: string;
  /**
   * The line beneath the name, for example `Senior Software Engineer`.
   */
  readonly tagline: null | string;
}

/* -------------------------------------------------------------------------------------------- *
 * The content model
 * -------------------------------------------------------------------------------------------- */

/**
 * The syndication and ordering fields every level of the content tree carries, including the
 * owning role or degree.
 *
 * This field set is deliberately repeated on all three models rather than factored into a shared
 * table. Syndication genuinely applies at every level, and the cascade in `resolveSyndication`
 * depends on each level answering for itself.
 */
export interface Syndicated {
  /**
   * Channels this record is withheld from. Empty means "published everywhere", which is why the
   * exclusion list is modeled positively rather than as an inclusion list: `@default([])` is then
   * the permissive default and new records need no syndication decision at all.
   *
   * A descendant can only ever ADD exclusions in effect. Listing a channel here that an ancestor
   * already excludes is redundant but harmless.
   */
  readonly excludedChannels: readonly SyndicationChannel[];
  /**
   * Master switch. `false` removes the subtree from every channel and no descendant can re-enable
   * it.
   */
  readonly isVisible: boolean;
}

/**
 * Fields common to both levels of the content tree.
 */
interface ContentNodeBase extends Syndicated {
  /**
   * Competencies referenced by this node, rendered nowhere directly but carried so that a
   * competency can report where it was demonstrated. Attaches at every level, matching the legacy
   * schema, where `Detail` and `NestedDetail` both carry a `Skill[]` relation.
   */
  readonly competencies: readonly Competency[];
  /**
   * A SINGLE paragraph of HTML. Prose split across multiple paragraphs, or a list of several
   * points, is several nodes, one row each. That granularity is the entire reason this is a tree
   * of rows rather than a blob: syndication is decided per paragraph.
   */
  readonly content: null | string;
  /**
   * Position within the parent. Explicit because array order does not survive the move to rows.
   */
  readonly order: number;
  /**
   * Generated rather than authored, unlike every other slug in this file. A paragraph has no
   * natural name, so `../lib/normalize.ts` derives a stable path-style slug from the title and the
   * ancestor chain.
   */
  readonly slug: string;
  /**
   * Short bold lead-in, on the order of a few words. A node is never rendered as a title alone;
   * see the prune rule in `resolveSyndication`.
   *
   * HTML, like {@link ContentNodeBase.content}: titles carry entities
   * (`Bundle Size &amp; First Load Performance`) and are rendered as markup, not as text nodes.
   */
  readonly title: null | string;
  /**
   * Null means "derive from context"; see `resolveTitleLayout`.
   */
  readonly titleLayout: null | TitleLayout;
}

/**
 * The second and final level of the tree: an item within a parent's list, or a nested paragraph
 * beneath it.
 *
 * Carries no `type` and no children. Depth is capped at two by the schema itself rather than by a
 * rule someone has to remember, which is the whole reason this is a separate model instead of a
 * self-referential `parentId` on one table.
 *
 * Prisma Additional Fields: the standard audit set, plus:
 *
 * - `parentId` — `String @db.Uuid`
 * - `parent` — `ContentNode @relation(fields: [parentId], references: [id], onDelete: Cascade)`
 * - `competencies` — `Competency[] @relation("nestedContentNodeCompetencies")`
 * - `@@unique([slug, parentId])`
 */
export type NestedContentNode = ContentNodeBase;

/**
 * A top-level node: either the opening summary prose of a role or degree, or a body section
 * beneath it.
 *
 * Attaches to its owner polymorphically through `ownerId` + `ownerType`. That pair carries no
 * database-level foreign key, which is the accepted cost of one content tree serving both roles and
 * degrees.
 *
 * Prisma Additional Fields: the standard audit set, plus:
 *
 * - `ownerId` — `String @db.Uuid`
 * - `children` — `NestedContentNode[] @relation("children")`
 * - `competencies` — `Competency[] @relation("contentNodeCompetencies")`
 * - `@@unique([slug, ownerId, ownerType])`
 */
export interface ContentNode extends ContentNodeBase {
  readonly children: readonly NestedContentNode[];
  readonly kind: NodeKind;
  readonly ownerType: ContentOwnerType;
  /**
   * Null is equivalent to `PARAGRAPH`.
   *
   * Meaningless when {@link ContentNode.kind} is `SUMMARY`, since summaries are always standalone
   * prose and never have children. That is the one guarantee given up by folding summaries into
   * this model instead of a third table, and it is enforced in application code rather than by the
   * schema.
   */
  readonly type: NodeType | null;
}

/**
 * What a role or degree contributes to the content tree.
 *
 * This is a TypeScript convenience only — Prisma has no model inheritance, so {@link Role} and
 * {@link Degree} will each declare these fields themselves. It exists so that the resolution
 * pipeline can accept either without knowing which it has.
 *
 * The two are not merged into one model: they relate to different entities (a company versus a
 * school) and have different natural keys, so a merged table would mean nullable foreign keys, no
 * integrity, and no usable unique constraint.
 */
export interface ContentOwner extends Syndicated {
  /**
   * Competencies for the owner itself, rendered as the chip row beneath a role.
   */
  readonly competencies: readonly Competency[];
  /**
   * Every top-level node, summaries and content together. Kept as one collection because they are
   * one table; `resolveSyndication` splits and orders them for rendering.
   */
  readonly nodes: readonly ContentNode[];
  readonly ownerType: ContentOwnerType;
  readonly slug: string;
}

/* -------------------------------------------------------------------------------------------- *
 * Entity models
 * -------------------------------------------------------------------------------------------- */

/**
 * A technology, practice or capability. The successor to the legacy `Skill`.
 *
 * Named for what it actually represents: the set is broader than "skills" and carries more
 * configuration than the legacy model does. The proficiency tier below is the primary metric going
 * forward; the year counts are carried across so that nothing is lost, but nothing renders from
 * them.
 *
 * Prisma Additional Fields: the standard audit set, plus:
 *
 * - `roles` — `Role[] @relation("roleCompetencies")`
 * - `degrees` — `Degree[] @relation("degreeCompetencies")`
 * - `contentNodes` — `ContentNode[] @relation("contentNodeCompetencies")`
 * - `nestedContentNodes` — `NestedContentNode[] @relation("nestedContentNodeCompetencies")`
 * - `resumeCompetenciesGroups` — `ResumeCompetenciesGroup[] @relation("groupCompetencies")`
 * - `@@unique([label])`
 */
export interface Competency extends Syndicated {
  /**
   * Years of use, derived from the oldest record the competency is attached to. Carried forward
   * from the legacy `Skill.calculatedExperience`.
   */
  readonly calculatedExperience: null | number;
  readonly description: null | string;
  /**
   * Overrides {@link Competency.calculatedExperience} when set, matching the legacy
   * `Skill.experience`.
   */
  readonly experience: null | number;
  readonly isHighlighted: boolean;
  readonly isPrioritized: boolean;
  readonly label: string;
  /**
   * Null when the level has never been assessed. Only 24 of the competencies referenced today carry
   * one, because a proficiency was previously authored on the sidebar bar rather than on the
   * competency, and a competency that only ever appeared as a pill or a chip was never given one.
   *
   * A competency rendered inside a group whose display is `BARS` must have one. That is an
   * application-level invariant rather than a schema one, since the same competency is legitimately
   * unrated everywhere else it appears.
   */
  readonly proficiency: null | Proficiency;
  readonly shortDescription: null | string;
  /**
   * A shorter label for surfaces that cannot fit the full one, such as a pill in a narrow sidebar
   * column. Null means the full label is short enough.
   */
  readonly shortLabel: null | string;
  readonly slug: string;
}

/**
 * A position held at a company. The successor to the legacy `Experience`.
 *
 * Prisma Additional Fields: the standard audit set, plus:
 *
 * - `companyId` — `String @db.Uuid`
 * - `nodes` — `ContentNode[]` (polymorphic; see {@link ContentNode})
 * - `resumeSheetId` — `String? @db.Uuid`
 * - `@@unique([title, companyId])`
 */
export interface Role extends ContentOwner {
  /**
   * Where the work was done, which is NOT the company's location: a remote role at a company
   * headquartered in San Francisco still reads as `Remote`. Null whenever
   * {@link Role.isRemote} is true.
   */
  readonly city: null | string;
  readonly company: Company;
  readonly endDate: Date | null;
  readonly isCurrent: boolean;
  readonly isHighlighted: boolean;
  /**
   * When true the role renders as `Remote` and carries no city or state at all, rather than
   * keeping a stale location beside the flag.
   */
  readonly isRemote: boolean;
  readonly ownerType: ContentOwnerType.Role;
  readonly shortTitle: null | string;
  readonly startDate: Date;
  readonly state: null | string;
  readonly title: string;
}

/**
 * A degree earned at a school. The successor to the legacy `Education`.
 *
 * Prisma Additional Fields: the standard audit set, plus:
 *
 * - `schoolId` — `String @db.Uuid`
 * - `nodes` — `ContentNode[]` (polymorphic; see {@link ContentNode})
 * - `resumeSheetId` — `String? @db.Uuid`
 * - `@@unique([major, schoolId])`
 * - `@@unique([shortMajor, schoolId])`
 */
export interface Degree extends ContentOwner {
  readonly concentration: null | string;
  readonly degree: DegreeType;
  readonly endDate: Date | null;
  readonly gpa: null | string;
  readonly isCurrent: boolean;
  readonly isHighlighted: boolean;
  /**
   * A degree begun and deliberately paused. Renders in place of an end date.
   */
  readonly isPostponed: boolean;
  readonly major: string;
  readonly minor: null | string;
  readonly note: null | string;
  readonly ownerType: ContentOwnerType.Degree;
  readonly school: School;
  readonly shortConcentration: null | string;
  readonly shortMajor: null | string;
  readonly shortMinor: null | string;
  readonly shortNote: null | string;
  readonly startDate: Date;
}

/* -------------------------------------------------------------------------------------------- *
 * Profile prose
 *
 * The paragraphs surrounding the profile block. Modeled as rows rather than string arrays so that
 * each one has a stable identity, an explicit order, and its own syndication decision — a shorter
 * "about" on the printed page than on the website costs nothing.
 * -------------------------------------------------------------------------------------------- */

/**
 * One paragraph of the "About" block in the sidebar of the opening sheet. Inline HTML is allowed.
 *
 * Prisma Additional Fields: the standard audit set, plus `profileId String @db.Uuid`.
 */
export interface ProfileAboutParagraph extends Syndicated {
  readonly content: string;
  readonly order: number;
  readonly shortContent: null | string;
  readonly slug: string;
}

/**
 * One plus-marked one-liner directly beneath the "About" block.
 *
 * Prisma Additional Fields: the standard audit set, plus `profileId String @db.Uuid`.
 */
export interface ProfileHighlight extends Syndicated {
  readonly order: number;
  readonly shortText: null | string;
  readonly slug: string;
  readonly text: string;
}

/**
 * One icon-labelled row of the contact block.
 *
 * Prisma Additional Fields: the standard audit set, plus `profileId String @db.Uuid`.
 */
export interface ProfileContactEntry extends Syndicated {
  readonly icon: ContactIcon;
  readonly order: number;
  readonly shortText: null | string;
  readonly slug: string;
  readonly text: string;
}

/* -------------------------------------------------------------------------------------------- *
 * Resume presentation
 *
 * Models that exist only for the printed resume. The `Resume` prefix marks them as such: none of
 * this syndicates anywhere, because pagination is meaningless off the printed page and a sidebar
 * grouping is a property of this medium alone.
 * -------------------------------------------------------------------------------------------- */

/**
 * A titled grouping of competencies in a sheet's sidebar. The successor to the sidebar sections
 * that were previously a union of "bars" and "pills" variants.
 *
 * The variance is a display flag rather than two shapes, because the underlying data is identical:
 * a heading and an ordered set of competencies. What differs is only whether each member's
 * proficiency is drawn.
 *
 * Prisma Additional Fields: the standard audit set, plus:
 *
 * - `competencies` — `Competency[] @relation("groupCompetencies")`
 * - `resumeSheetId` — `String @db.Uuid`
 */
export interface ResumeCompetenciesGroup {
  readonly competencies: readonly Competency[];
  readonly display: ResumeCompetenciesGroupDisplay;
  readonly heading: string;
  readonly order: number;
  readonly shortHeading: null | string;
  readonly slug: string;
}

/**
 * One physical 8.5x11 sheet of the printed resume.
 *
 * Page breaks are assigned here by hand rather than flowed by CSS: each sheet renders as its own
 * standalone document, which is what makes splitting a role across a page boundary impossible.
 *
 * The sheet names the roles and degrees it carries, and nothing else about them. Their order within
 * the sheet is derived from {@link Role.startDate} and {@link Degree.startDate}, and the header
 * drawn above each run is derived from whether the run is roles or degrees — neither is stored,
 * because neither can disagree with the underlying records.
 *
 * Prisma Additional Fields: the standard audit set, plus:
 *
 * - `roles` — `Role[] @relation("resumeSheetRoles")`
 * - `degrees` — `Degree[] @relation("resumeSheetDegrees")`
 * - `competencyGroups` — `ResumeCompetenciesGroup[] @relation("resumeSheetCompetencyGroups")`
 */
export interface ResumeSheet {
  readonly competencyGroups: readonly ResumeCompetenciesGroup[];
  readonly degrees: readonly Degree[];
  /**
   * Whether to render the profile's about, highlights and contact blocks above this sheet's
   * competency groups. True on the opening sheet only; later sheets repeat the photo and name
   * alone.
   */
  readonly isIntroVisible: boolean;
  readonly order: number;
  readonly roles: readonly Role[];
  /**
   * Doubles as the emitted filename: `page-1` becomes `page-1.html`.
   */
  readonly slug: string;
}

/* -------------------------------------------------------------------------------------------- *
 * Resolved shapes
 *
 * The output of `resolveSyndication`: the same tree with everything a given channel excludes
 * removed. Distinct types from the models above so that it is impossible to render an unresolved
 * tree by accident and quietly publish content that was meant to be withheld.
 * -------------------------------------------------------------------------------------------- */

export interface ResolvedNestedNode extends Omit<
  NestedContentNode,
  'excludedChannels' | 'isVisible'
> {
  readonly titleLayout: TitleLayout;
}

export interface ResolvedNode extends Omit<
  ContentNode,
  'children' | 'excludedChannels' | 'isVisible' | 'type'
> {
  readonly children: readonly ResolvedNestedNode[];
  readonly titleLayout: TitleLayout;
  readonly type: NodeType;
}

export interface ResolvedOwner extends Omit<
  ContentOwner,
  'excludedChannels' | 'isVisible' | 'nodes'
> {
  readonly content: readonly ResolvedNode[];
  readonly summary: readonly ResolvedNode[];
}

/**
 * A role or degree whose content tree has been resolved for one channel. This is what the
 * components render, so an unresolved tree cannot reach one by accident.
 */
export type Resolved<T extends ContentOwnerInput> = { readonly content: ResolvedOwner } & Omit<
  T,
  'content'
>;

export type ResolvedRole = Resolved<RoleInput>;
export type ResolvedDegree = Resolved<DegreeInput>;

/* -------------------------------------------------------------------------------------------- *
 * Authoring shapes
 *
 * What a human writes in a data file. The model types above mirror Prisma exactly, which means a
 * non-null `order`, `slug`, `isVisible` and `excludedChannels` on every node: correct for a
 * database, miserable to write by hand. These make the mechanical fields optional and let position
 * in an array stand in for `order`.
 *
 * `../lib/normalize.ts` is the boundary between the two. It generates slugs, stamps order indices,
 * applies the defaults, and collapses the whitespace of copy authored as indented template
 * literals.
 * -------------------------------------------------------------------------------------------- */

/**
 * Fields a human supplies by hand on a content node.
 *
 * Omitted and filled in by normalization: `slug` is generated from the title and ancestor chain,
 * `order` comes from array position, and the parent references come from where the node sits in the
 * structure.
 */
interface NodeInputBase {
  readonly competencies?: readonly Competency[];
  readonly content?: string;
  /**
   * Omit for "published everywhere".
   */
  readonly excludedChannels?: readonly SyndicationChannel[];
  /**
   * Omit for the `true` default.
   */
  readonly isVisible?: boolean;
  readonly title?: string;
  readonly titleLayout?: TitleLayout;
}

export type NestedNodeInput = NodeInputBase;

export interface NodeInput extends NodeInputBase {
  readonly children?: readonly NestedNodeInput[];
  /**
   * Omit for `PARAGRAPH`. Never set on a summary.
   */
  readonly type?: NodeType;
}

/**
 * What a role or degree supplies. Summaries and content are authored as separate collections
 * because that is how they read and how they sort; normalization flattens them into one `nodes`
 * collection, stamping `kind` from which collection they came out of.
 */
export interface ContentInput {
  readonly competencies?: readonly Competency[];
  readonly content?: readonly NodeInput[];
  readonly excludedChannels?: readonly SyndicationChannel[];
  readonly isVisible?: boolean;
  readonly summary?: readonly NodeInput[];
}

/**
 * What every content owner supplies by hand, regardless of whether it is a role or a degree.
 *
 * The owner's own slug is authored, unlike the slugs beneath it: a role or degree has a natural
 * name, and normalization builds every node slug in its tree as a path underneath this one.
 */
export interface ContentOwnerInput {
  readonly content: ContentInput;
  readonly slug: string;
}

/**
 * A role as authored: every field of the {@link Role} model except the ones the content pipeline
 * fills in, plus the content tree in its authoring form.
 */
export type RoleInput = ContentOwnerInput &
  Omit<Role, 'competencies' | 'excludedChannels' | 'isVisible' | 'nodes' | 'ownerType' | 'slug'>;

/**
 * A degree as authored; see {@link RoleInput}.
 */
export type DegreeInput = ContentOwnerInput &
  Omit<Degree, 'competencies' | 'excludedChannels' | 'isVisible' | 'nodes' | 'ownerType' | 'slug'>;

/**
 * A sheet as authored, holding its roles and degrees in their authoring form.
 *
 * The sheet itself has nothing to normalize — it carries no content tree — so this differs from
 * {@link ResumeSheet} only in what its two collections hold. Resolution happens in the renderer,
 * which is the only place that knows which channel is being rendered for.
 */
export type ResumeSheetInput = {
  readonly degrees: readonly DegreeInput[];
  readonly roles: readonly RoleInput[];
} & Omit<ResumeSheet, 'degrees' | 'roles'>;
