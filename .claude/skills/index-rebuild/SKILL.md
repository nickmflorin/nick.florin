---
name: index-rebuild
description: Regenerate the codebase index rule from the current source tree
disable-model-invocation: true
---

# Rebuild Codebase Index

Regenerate `.claude/rules/codebase-index.md` from the current source files, then mirror the result
to `.github/instructions/codebase-index.instructions.md`.

## Steps

### 1. Read Current Index

Read `.claude/rules/codebase-index.md` to lock in the current format. The output must preserve the
exact section order and the column structure of every table:

1. Header (intro paragraph + stack summary)
2. Route Map (`(site)` routes, dashboard parallel routes, admin routes, `(document)` routes)
3. API Route Map
4. Server Actions Map
5. Domain Map
6. Directory Map (including the Components and Data Layer subsections)
7. Placement Conventions
8. Cross-Cutting Quick Ref
9. Docs

### 2. Scan the Source Tree

Per [discovery.md](../../rules/discovery.md), delegate the scans to a Haiku Explore subagent and
have it return the raw file lists verbatim. The scans:

- **Site routes**: Glob `src/app/(site)/**/page.{ts,tsx}`. Note redirects defined in
  `next.config.mjs`.
- **Dashboard slots**: List the `@`-prefixed parallel route directories under
  `src/app/(site)/dashboard/`.
- **Admin resources**: List directories under `src/app/(site)/admin/` and their resource-specific
  components inside the `@table` slots.
- **Document routes**: Glob `src/app/(document)/**/page.tsx`.
- **API routes**: Glob `src/app/api/**/route.ts`; group by resource, noting which resources have
  `[id]/` and `[id]/details/` variants.
- **Server actions**: List directories and files under `src/actions/`; note per-domain action files
  and shared top-level modules.
- **Features**: List directories under `src/features/` and notable components in each.
- **Top-level directories**: List directories under `src/` for the Directory Map and under
  `src/components/` for the Components subsection.

### 3. Verify Referenced Files

Every concrete file path used as a reference example (Placement Conventions, Data Layer, Cross-
Cutting Quick Ref) must exist. Check each with a Glob before including it; replace or drop entries
whose files are gone.

### 4. Regenerate the Index

Rewrite `.claude/rules/codebase-index.md` preserving:

- The exact section order and table columns from Step 1
- The parity comment on the first line
- Tables for enumerable facts; prose only where the current index already uses it
- Component names only (no full import paths) in component columns
- API endpoints grouped by resource, not individual HTTP methods

Constraints:

- Keep the file under ~250 lines
- Do not invent new sections; drift in the source tree changes table rows, not structure
- Preserve rows that scans cannot verify automatically (e.g. Cross-Cutting Quick Ref) unless a
  referenced path no longer exists

### 5. Mirror to Copilot Instructions

Update `.github/instructions/codebase-index.instructions.md` with the identical content body,
keeping its own frontmatter (`applyTo`/`description`) and its parity comment, per the conventions in
the [sync-ai-config skill](../sync-ai-config/SKILL.md).

### 6. Report Summary

Output what changed:

- Routes added / removed
- API endpoints added / removed
- Server action domains or files added / removed
- Placement convention changes
- Reference examples that no longer existed and how they were resolved
