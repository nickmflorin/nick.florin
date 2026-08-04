# Preservation Contract

Before refactoring a unit (function, component, module), write down an explicit "what stays the
same" — the contract every consumer depends on. After the refactor, verify the diff against it.
Structural changes (imports, file layout, helper names, control-flow inversion that preserves
semantics) are expected; contract items are not.

## What the Contract Covers

- **Results**: the value returned (or rendered output) for any input the unit currently handles.
- **Side effects**: Prisma writes, `revalidatePath`/`revalidateTag` calls, HTTP requests, logger
  lines, file writes.
- **Public exports and import paths**: consumers must not need edits unless the refactor
  deliberately includes them.
- **Identity-bearing structural attributes**: when a name, path, or ordering participates in
  identity downstream — route segments under `src/app/`, fixture JSON shapes in
  `src/database/fixtures/`, generated document output from `src/scripts/generate-resume/` — call it
  out explicitly and land a structural-equivalence check (snapshot, diff, or fixture comparison)
  _before_ the refactor.

## Example

A contract for extracting a helper from a server action, stated before editing:

```markdown
Preservation contract for `src/actions/skills/create-skill.ts`:

- Returns the created `Skill` on success, `ApiClientError` shape on failure (unchanged).
- Side effects: one `db.skill.create`, one `revalidatePath("/admin/skills")` — no new writes, no
  reordering.
- `createSkill` stays the sole export; import path unchanged.
- No identity-bearing attributes involved (no route, fixture, or generated-output changes).
```

## Verifying

Read the final diff and ask: did any **behavior or side effect** change? If you cannot tell whether
something changed, treat that as "yes, something changed" — roll back and pick a smaller scope.
