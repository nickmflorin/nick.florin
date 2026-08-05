# Derived Object Literals

## The Rule

When an object literal is derived from another object — a Prisma write payload built from a record,
a database row mapped into another shape, an element pushed into an array from an iteratee —
properties that pass through unchanged are **not** restated one by one. Destructure out the fields
that are excluded or repurposed, spread the rest, and state only what the phase adds, overrides, or
transforms.

What a reader needs from a mapping is the **difference** between its input and its output: which
fields are dropped, which are transformed, and which merely funnel through. Restating every funneled
property buries that difference in noise, and every restated line is one that has to be maintained
by hand when the shape changes — a spread picks up a new field automatically.

```typescript
// Correct: the excluded fields are visible, everything else visibly funnels through, and the one
// derived field sits after the spread. From `src/database/content/bindings/company.ts`
// (`omitBookkeeping` is that module's typed helper for its recurring exclusions; see below).
const { createdAt, id, updatedAt, ...company } = row;
return {
  ...omitBookkeeping(company),
  meta: { createdAt, id, updatedAt },
  slug: company.slug ?? slugify(company.name),
};

// Disallowed: nine of eleven properties funnel through unchanged, but the reader has to compare
// both shapes field by field to discover that — and a new column is silently dropped.
return {
  city: row.city,
  description: row.description,
  logoFileName: row.logoFileName,
  logoImageUrl: row.logoImageUrl,
  meta: { createdAt: row.createdAt, id: row.id, updatedAt: row.updatedAt },
  name: row.name,
  shortName: row.shortName,
  slug: row.slug ?? slugify(row.name),
  state: row.state,
  websiteUrl: row.websiteUrl,
};
```

## Exclusions Are Explicit, Because Spread Is Not Checked

A spread carries **every** remaining property, and TypeScript's excess-property check does not apply
to spread members — a stray field rides through silently and compiles. So a field that must not
reach the output is removed visibly, by one of two means:

- **Destructure it** when its value is used (an audit trio repurposed into a `meta` block, a
  relation object reduced to its slug).
- **`omit` it** (from `lodash-es`) when its value is discarded entirely.

```typescript
// Correct: `createdAt`/`id`/`updatedAt` are destructured because they are repurposed; the columns
// that must not reach the canonical record are dropped by name (here through the module's shared
// helper). From `src/database/content/bindings/profile.ts`.
contacts.map(({ createdAt, id, updatedAt, ...contact }) => ({
  ...omitBookkeeping(contact),
  meta: { createdAt, id, updatedAt },
}));

// Disallowed: `...contact` still carries `order`, `profileId`, `createdById` and `updatedById`
// into the result. It compiles — spread members skip the excess-property check — and the stray
// keys surface later as phantom diffs or rejected Prisma payloads.
contacts.map(({ createdAt, id, updatedAt, ...contact }) => ({
  ...contact,
  meta: { createdAt, id, updatedAt },
}));
```

## Transforms and Additions Come After the Spread

A field that changes shape stays in the literal, written **after** the spread so it wins, with the
spread still carrying everything else. The same applies when a field later needs a transformation:
keep the spread and add the override, rather than reverting to a full restatement.

```typescript
// Correct: the whole record funnels through except the fields this phase owns. From
// `src/database/content/bindings/role.ts`.
await tx.role.create({
  data: {
    ...omitBookkeeping(record, ['company', 'content']),
    company: { connect: { slug: record.company } },
    createdBy: { connect: { id: context.userId } },
    excludedChannels: record.content.excludedChannels,
    isVisible: record.content.isVisible,
    updatedBy: { connect: { id: context.userId } },
  },
});
```

## Deliberate Subsets Use `pick`

When a write is intentionally partial — only a few fields of the source may be written — express the
subset with `pick` rather than restating the fields, so the intent ("only these funnel") is carried
by the construct:

```typescript
// Correct: the update touches exactly the additive columns, and says so. From
// `src/database/content/bindings/profile.ts`.
await tx.profile.update({
  data: {
    ...pick(record, ['handle', 'photoFileName', 'slug']),
    updatedById: context.userId,
  },
  where: { id: existing.id },
});
```

## Recurring Exclusion Sets Get a Typed Helper

When the same keys are excluded across many mappings in a module — audit scalars, position columns,
foreign keys the machinery re-derives — repeating the list at every site is itself redundancy.
Abstract the set into one helper, generic over its input, whose return type is derived from the
input with `Omit` so the result stays exact. Keys the helper drops apply to whichever shapes carry
them and are ignored on the rest; an `extra` parameter keeps the site-specific, informative
exclusions visible at the mapping.

```typescript
// From `src/database/content/bookkeeping.ts`: the keys the transfer machinery owns, dropped
// wherever they appear, with the return type derived from the input.
export const omitBookkeeping = <T extends object, K extends keyof T = never>(
  value: T,
  extra: readonly K[] = [],
): Omit<T, K | TransferBookkeepingKey> => {
  /* ... */
};

// A call site excludes only what it transforms; the bookkeeping keys go without saying.
data: {
  ...omitBookkeeping(record, ['company', 'content']),
  company: { connect: { slug: record.company } },
},
```

## When Restatement Is Right

A full property-by-property literal remains correct when nearly every field is transformed — there,
the mapping _is_ the content, and a spread would hide it. The rule targets mappings where funneled
fields dominate; if fewer than half the properties pass through unchanged, write them out.

## Applying the Convention

These rules govern new mappings and deliberate restructures. Do not sweep the repository rewriting
existing literals as a side effect of unrelated work; when a mapping is already being added, moved,
or rewritten, bring it into conformance as part of that change.
