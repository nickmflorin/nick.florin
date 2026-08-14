---
applyTo: '**/*.{ts,tsx}'
description:
  'Variable economy: declare collections as one expression with spreads rather than pushing into an
  accumulator, and fold away bindings read only once'
---

# Variable Economy

## The Rule

Prefer fewer local variables. A collection is **declared as one expression and returned**, never
built by seeding an empty accumulator and pushing into it; and a binding that exists only to be read
once is folded into the expression that reads it.

Both halves serve the same end: the shape of the result should be visible in one place. An
accumulator scatters that shape across every `push` that contributes to it, so a reader has to
execute the function in their head to know what comes out of it. A single literal shows the whole
result at a glance, with each contributing piece spread into the position it occupies.

## Build Collections in One Expression

Spread the pieces into a literal in the order they appear. Map and flat-map produce the pieces; the
literal states the arrangement.

```typescript
// Correct: the shape of the output is the shape of the literal. Each source of lines sits in the
// position its lines occupy. From `src/database/content/sync/render.ts`.
return [
  `  ${terminal.applyStyles(changeSet.binding.key, { effect: 'bright' })}  ${summary.join(', ')}`,
  ...creations.map(record => `    ${terminal.applyStyles(`+ ${record.slug}`, 'green')}`),
  ...updates.flatMap(record => [
    `    ${terminal.applyStyles(`~ ${record.slug}`, 'yellow')}`,
    ...record.changes.flatMap(renderChange),
  ]),
  ...changeSet.deletions.map(
    record => `    ${terminal.applyStyles(`- ${changeSet.binding.slugOf(record)}`, 'red')}`,
  ),
];

// Disallowed: the result is assembled by side effect. Nothing states what `lines` ends up holding,
// and the `for` loops exist only to move elements from one collection into another.
const lines = [
  `  ${terminal.applyStyles(changeSet.binding.key, { effect: 'bright' })}  ${summary.join(', ')}`,
];
for (const record of creations) {
  lines.push(`    ${terminal.applyStyles(`+ ${record.slug}`, 'green')}`);
}
for (const record of updates) {
  lines.push(`    ${terminal.applyStyles(`~ ${record.slug}`, 'yellow')}`);
  lines.push(...record.changes.flatMap(renderChange));
}
return lines;
```

A trailing element appended after the fact is the same mistake in miniature, and is written as
another member of the literal:

```typescript
// Correct.
return [...changed.flatMap(renderEntity), '', renderTotals(changed)].join('\n');

// Disallowed.
const lines = changed.flatMap(renderEntity);
lines.push('');
lines.push(renderTotals(changed));
return lines.join('\n');
```

## Do Not Name a Value Read Once

A binding used exactly once, immediately below its declaration, earns nothing: the name restates
what the expression already says, and the reader pays for a hop. Fold it in.

```typescript
// Correct: one expression, and `collapsed` still earns its name because it is read three times.
const collapsed = (typeof value === 'string' ? value : JSON.stringify(value)).replace(/\s+/g, ' ');
return collapsed.length > ValueWidth ? `${collapsed.slice(0, ValueWidth - 1)}…` : collapsed;

// Disallowed: `text` is read once, on the very next line.
const text = typeof value === 'string' ? value : JSON.stringify(value);
const collapsed = text.replace(/\s+/g, ' ');
```

The same applies to a result assembled and then returned unchanged. State it in the `return`:

```typescript
// Correct: the statements that run before the result is built come first, then the result.
for (const planned of records) {
  binding.prisma.planIssues(planned, issues);
}
return { binding, deletions, orphans, records, unwritable };

// Disallowed: the object is named, then some unrelated work runs, then the name is returned.
const changeSet = { binding, deletions, orphans, records, unwritable };
for (const planned of records) {
  binding.prisma.planIssues(planned, issues);
}
return changeSet;
```

## Hoist a Loop-Invariant Condition Out of the Loop

A condition that cannot change across iterations belongs outside the loop, which usually removes a
level of nesting as well:

```typescript
// Correct: `removable` is decided once, so the loop only runs when it has work to do.
if (!removable) {
  for (const record of absent) {
    issues.warning(binding.key, binding.slugOf(record), RetainedRecordMessage);
  }
}

// Disallowed: the loop iterates in order to re-answer a question whose answer never changes.
for (const record of absent) {
  if (!removable) {
    issues.warning(binding.key, binding.slugOf(record), RetainedRecordMessage);
  }
}
```

## When a Variable Earns Its Place

The rule is about **unnecessary** bindings, not about inlining everything. Keep a name when it does
real work:

- **It is read more than once.** `collapsed` above is read three times; inlining it would evaluate
  the expression three times and read worse each time.
- **It names something the expression does not.** A local whose name carries a fact the code cannot
  — `removable`, `unchanged`, `summary` — is documentation with a type attached.
- **Inlining would nest a multi-line expression inside another.** Two levels of template literal or
  a callback inside a callback inside a literal is harder to read than the hop, and the hop wins.
- **The accumulation is genuinely imperative.** A loop with `await` in it, an accumulator fed by
  branching control flow, or a `Map` built across several passes cannot be a single expression;
  forcing one produces worse code than the loop.

## Applying the Convention

These rules govern new code and deliberate restructures. Parts of the codebase predate them; do not
sweep the repository converting existing accumulators as a side effect of unrelated work. When a
function is already being added, moved, or rewritten, bring it into conformance as part of that
change.
