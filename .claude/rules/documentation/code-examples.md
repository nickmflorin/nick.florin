---
paths:
  - '**/*.{md,mdx}'
description: 'Illustrating documented code concepts with fenced code blocks rather than prose alone'
---

<!-- Parity: keep in sync with .github/instructions/documentation/code-examples.instructions.md -->

# Code Examples in Documentation

## The Rule

Every code concept a document explains must be illustrated with at least one fenced code block.
Prose alone is not sufficient, and neither is prose carrying inline code spans. A reader should be
able to see the shape of the code, not reconstruct it from a sentence.

This applies to every kind of documentation in the repository: the human guides under `docs/`, the
prescriptive rules under `.claude/rules/`, their Copilot counterparts under `.github/instructions/`,
project working notes, and `README` files.

Use code blocks **liberally**. A document that explains four distinct concepts and contains one
block is under-illustrated. Erring toward more examples is never the mistake being corrected.

## Inline Spans Versus Blocks

Inline spans and code blocks do different jobs, and one does not substitute for the other.

Inline spans **name** a thing mid-sentence — a symbol, a type, a compiler flag, a file path, a short
expression referred to in passing:

<!-- prettier-ignore -->
```markdown
The `readonly` modifier applies to every property declared on a type.
```

Code blocks **show** a thing — anything the reader is expected to pattern-match against, adapt, or
copy:

````markdown
```typescript
interface ChartProps {
  readonly series: number[];
  readonly onSelect?: (index: number) => void;
}
```
````

Inline spans are welcome and need no justification. The mistake to avoid is using them _instead of_
a block: a paragraph that describes a construct entirely through inline spans, where the reader has
to assemble the real syntax in their head, must be given a block as well. The inline prose stays;
the block is added alongside it.

A useful test: if the sentence describes a **shape** — a signature, a declaration, an annotation, a
structure — it needs a block. If it merely refers to something by name, an inline span is enough.

## Show Both the Correct and the Incorrect Form

Whenever a document states that something is required or forbidden, show both forms. A rule the
reader can only see stated in the abstract is a rule they will violate in a shape nobody
anticipated.

Label each form with a leading comment so the contrast is unmissable:

```typescript
// Correct: the element type is derived from the collection.
const first: (typeof rows)[number] | undefined = rows[0];

// Disallowed: `Row` is a second place that has to be kept in step with `rows`.
const first: Row | undefined = rows[0];
```

Conventions for these labels:

- Use `// Correct:` and `// Disallowed:` as the default pair, matching the vocabulary already used
  across the rules in this repository. `// Justified:`, `// Preferred:` and `// Error:` are also in
  use where they fit the surrounding prose better.
- Always say **why** in the label, not merely which form it is. A label that carries the reason
  teaches; a bare verdict does not:

  ```typescript
  // Disallowed: `Partial` makes every key optional, so a missing member is legal.
  const Labels: Partial<Record<Status, string>> = { active: 'Active' };

  // Bad
  const Labels: Partial<Record<Status, string>> = { active: 'Active' };
  ```

- Put both forms in a single block when they are short and the contrast is the whole point. Split
  them into separate blocks, each with its own explanatory paragraph, when either form is long.

## Every Block Carries a Language Tag

A bare fence is disallowed. Tag every block with its language: `typescript`, `tsx`, `bash`, `json`,
`yaml`, `markdown`, `prisma`, `scss`.

The tag is not decoration. Prettier formats embedded `typescript` and `tsx` blocks inside Markdown,
so a tagged block is both syntax-highlighted and held to the same formatting as real source — which
in turn means it must be **valid syntax**. An example that would not parse is a defect.

Use `tsx` rather than `typescript` for any block containing JSX, and `bash` for shell commands.

## Blocks Must Be Realistic

- **Draw from real code where it exists.** When the repository already contains an instance of the
  pattern, base the example on it and name the file in the surrounding prose, so the reader can go
  read the real thing in context.
- **Be minimal but complete.** Include enough for the example to stand on its own, and nothing more.
  Elide an irrelevant function body with `/* ... */`, never the part the example is about.
- **Honor the repository's own conventions.** Examples are read as templates, so they follow the
  rules the documentation itself prescribes: `readonly` on declared properties, PascalCase
  module-scope constants, single quotes, and lines within 100 characters.
- **Do not write pseudocode** when real code would serve, and never use placeholder names like
  `foo`/`bar` where a domain-plausible name is available.

## Show the Error the Reader Will Hit

When a rule exists because the compiler or the linter reports something, show that report. A reader
who has just been handed an error message searches for it verbatim, and matching the message to the
explanation is most of the value the document provides.

```typescript
const rows: Row[] = getRows();

/* Error: "Unnecessary conditional, value is always truthy." `rows[0]` is typed `Row`, an object
   type, and every object is truthy. */
if (rows[0]) {
  return rows[0].id;
}
```

## What Always Warrants a Block

Each of the following gets at least one, every time it is documented:

- A syntactic form that is required or forbidden.
- A type-level construct — a generic, a conditional or mapped type, a `satisfies` clause, a type
  predicate, an assertion signature.
- A naming convention, shown on a real declaration rather than described.
- A configuration snippet, quoted from the actual config file.
- A file or folder layout, shown as a tree in a plain block.
- A command to run, in a `bash` block.

## Anti-Patterns

| Pattern                                       | Problem                                                   | Fix                                              |
| --------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------ |
| A concept explained only through inline spans | The reader has to reconstruct the syntax                  | Add a block alongside the prose                  |
| Stating a rule without showing the violation  | The rule is only recognizable in the shape the author saw | Show the disallowed form next to the correct one |
| A bare fence with no language tag             | No highlighting, and Prettier will not format or check it | Tag every block                                  |
| A block with no surrounding explanation       | Code without a claim attached teaches nothing             | Lead with the point, then show it                |
| Several blocks demonstrating the same point   | Padding that dilutes the ones that matter                 | Keep the clearest, delete the rest               |
| Pseudocode, or `foo`/`bar` placeholders       | Not copyable, and not recognizable in real code           | Use realistic, domain-plausible code             |

## Human Docs and AI Rules Both Need Examples

The descriptive guides under `docs/` explain _why_ a convention exists; the prescriptive rules under
`.claude/rules/` and `.github/instructions/` state _what_ to do. The split is about voice and
emphasis, **not** about which one gets the examples. Both need concrete code.

A human guide that describes a pattern in prose only, on the grounds that the rule file has the
examples, is incomplete: it forces a reader who wanted the explanation to open a second file to see
the thing being explained. A human guide will usually carry fewer examples than its rule
counterpart, because it is not enumerating every allowed and disallowed form — but "fewer" is not
"none".

## Applying the Convention

These rules govern new documentation and deliberate rewrites. Do not sweep the repository adding
examples to every existing document as a side effect of unrelated work. When a document is already
being written, extended, or restructured, bring the sections being touched into conformance as part
of that change.
