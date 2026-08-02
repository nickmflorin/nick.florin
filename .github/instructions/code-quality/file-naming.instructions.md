---
applyTo: '**/*.{ts,tsx,js,jsx,mjs,cjs,md,mdx}'
description: 'File and folder naming: PascalCase component files, hyphen-case everything else'
---

<!-- Parity: keep in sync with .claude/rules/code-quality/file-naming.md -->

# File & Folder Naming

## Component Files: PascalCase

A component file is any file that exports a React component. Whether a file is a component file is
determined by what it exports, not by its extension: a `.ts` file that exports a component without
containing any JSX is still a component file. A component file is named in PascalCase after the
component it exports, for example `TabButton.tsx`.

A component file must export exactly **one** component. If a file exports two components, it must be
split into two files, one per component. Non-component exports that belong to the component may live
in the same file: its props interface or type (`TabButtonProps`), and closely related types or
constants that exist only to support it.

### Exception: Next.js Reserved Files

Files whose names are reserved by the Next.js App Router keep their reserved lowercase names, in
either extension (`page.ts` or `page.tsx`): `page`, `layout`, `template`, `loading`, `error`,
`global-error`, `not-found`, `default`, `route`, `sitemap`, `middleware`/`proxy`, and the other
reserved entries under `src/app/`. These names are dictated by the framework and are never converted
to PascalCase.

## Every Other File: hyphen-case

Any file that does not export a component is named in hyphen-case (kebab-case): hooks
(`use-filter-state.ts`), utilities (`get-entity.ts`), types modules, configs, scripts, and Markdown
documentation (`best-practices.md`). Single-word names (`query.ts`, `util.ts`) already satisfy this.

The one exception is `README.md`, which keeps its conventional uppercase name and must never be
renamed.

## Folders: hyphen-case, Always

Folders are always named in hyphen-case. PascalCase folders are disallowed, even when the folder
groups the internals of a single component.

### Folders as Component Files Are Disallowed

A folder must never stand in for a component file: a folder whose `index.tsx` (or `index.ts`)
implements a component is disallowed. A component implementation always lives in its own PascalCase
file, and index files exist only as barrels that re-export a module's public API.

```
Disallowed: the folder is a modularized component "file".
  components/icons/Icon/index.tsx

Correct: the component lives in its own PascalCase file.
  components/icons/Icon.tsx

Correct: internals need their own files, so a hyphen-case module wraps them.
  components/icons/icon/Icon.tsx
  components/icons/icon/util.ts
  components/icons/icon/index.ts    (re-exports only)
```

## Applying the Convention

These rules govern new files and deliberate restructures. Parts of the codebase predate the
convention; do not mass-rename existing files or folders as a side effect of unrelated work. When a
file is already being split, moved, or rewritten, bring its name (and its folder's name) into
conformance as part of that change.
