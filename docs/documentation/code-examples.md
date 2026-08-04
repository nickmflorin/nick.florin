# Code Examples in Documentation

Conventions for illustrating documented code concepts, in both the human guides under `docs/` and
the prescriptive rules under `.claude/rules/` and `.github/instructions/`.

## The Idea

Every code concept a document explains is illustrated with at least one fenced code block. Prose
alone is not enough, and neither is prose carrying inline code spans — a reader should be able to
see the shape of the code rather than reconstruct it from a sentence.

The failure mode this addresses is a document that reads well and teaches nothing concrete. A
paragraph can describe a type predicate accurately and still leave the reader unsure where the `is`
goes, what the parameter is typed as, or whether the guard is a `function` or a `const`. Four lines
of real code settles all three at once:

```typescript
export const isSizeUnit = (value: unknown): value is SizeUnit =>
  SizeUnits.includes(value as SizeUnit);
```

Use code blocks liberally. A document explaining four distinct concepts and carrying one block is
under-illustrated; more examples is not the mistake being corrected here.

## Inline Spans and Blocks Do Different Jobs

Inline spans **name** a thing mid-sentence — a symbol, a type, a compiler flag, a file path. They
are welcome and need no justification.

Code blocks **show** a thing — anything the reader is expected to pattern-match against, adapt, or
copy.

Neither substitutes for the other. The mistake is describing a construct entirely through inline
spans, leaving the reader to assemble the real syntax mentally. The prose stays; a block is added
alongside it. A useful test is whether the sentence describes a **shape** — a signature, a
declaration, an annotation, a structure. If so, it needs a block.

## Show Both Forms

When a document says something is required or forbidden, it shows both the correct and the incorrect
form, each labelled with a leading comment that says _why_:

```typescript
// Correct: the element type is derived from the collection.
const first: (typeof rows)[number] | undefined = rows[0];

// Disallowed: `Row` is a second place that has to be kept in step with `rows`.
const first: Row | undefined = rows[0];
```

A rule stated only in the abstract is a rule that gets violated in a shape nobody anticipated.
`// Correct:` and `// Disallowed:` are the default vocabulary across this repository, with
`// Justified:`, `// Preferred:` and `// Error:` used where they read better. Both forms go in one
block when they are short and the contrast is the point; they split into separate blocks, each with
its own paragraph, when either is long.

## Tags, Realism, and Errors

Every block carries a language tag — `typescript`, `tsx`, `bash`, `json`, `markdown`. The tag is not
decoration: Prettier formats embedded `typescript` and `tsx` blocks inside Markdown, so a tagged
block is held to the same formatting as real source and must be valid syntax.

Examples are read as templates, so they are drawn from real code where it exists (naming the file in
the surrounding prose), kept minimal but complete, and written to honor the conventions the
documentation itself prescribes. `/* ... */` elides an irrelevant body; it never elides the part the
example is about. Placeholder names like `foo` and `bar` are avoided where a domain-plausible name
exists.

Where a convention exists because the compiler or the linter reports something, the document shows
that report. A reader who has just been handed an error message searches for it verbatim:

```typescript
const rows: Row[] = getRows();

/* Error: "Unnecessary conditional, value is always truthy." `rows[0]` is typed `Row`, an object
   type, and every object is truthy. */
if (rows[0]) {
  return rows[0].id;
}
```

## Human Guides Need Examples Too

The guides under `docs/` explain _why_ a convention exists; the rules under `.claude/rules/` and
`.github/instructions/` state _what_ to do. That split is about voice and emphasis, not about which
one carries the examples.

A human guide that describes a pattern in prose only, on the grounds that the rule file has the
code, is incomplete — it sends a reader who wanted the explanation to a second file to see the thing
being explained. A guide will usually carry fewer examples than its rule counterpart, since it is
not enumerating every allowed and disallowed form, but fewer is not none.

## Reference

The prescriptive counterpart of these conventions, including the full anti-pattern table, lives in
`.claude/rules/documentation/code-examples.md` and
`.github/instructions/documentation/code-examples.instructions.md`.

[Markdown Formatting](../code-quality/markdown-formatting.md) covers the separate question of how
Markdown files are formatted and checked.
