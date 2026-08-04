---
paths:
  - '**/*.{ts,tsx,js,jsx,mjs,cjs,md,mdx}'
description: 'File and folder naming: PascalCase component files, hyphen-case everything else'
---

<!-- Parity: keep in sync with .github/instructions/code-quality/file-naming.instructions.md -->

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

### Barrels Are for Structure, Not for Client Imports

Declaring an `index.ts` barrel is always correct — it is how a module states its public API.
Importing _through_ one is a separate question, and the answer depends on which side of the
server/client boundary the importing file sits on.

Server-only modules — server actions, database and model code, Node scripts, and anything reachable
only from a server component — may import through a barrel freely. None of it ships to the browser,
so the barrel's other re-exports cost nothing at runtime.

```typescript
// Correct: a server action importing through the model barrel. Nothing here reaches the browser.
import { type Skill, type Company } from '~/database/model';
```

Client modules — any file carrying `'use client'`, and anything reachable from one — import from the
concrete module path instead. A barrel import makes every module the barrel re-exports part of the
client's module graph, so one small component drags its siblings into the bundle.

```tsx
'use client';

// Disallowed: `~/components/icons/index.ts` re-exports every icon module, and all of them enter
// the client bundle to obtain one.
import { Icon } from '~/components/icons';

// Correct: only the module actually used.
import { Icon } from '~/components/icons/Icon';
```

The barrel still exists and is still the module's declared API. This governs which import path a
consumer writes, not whether the `index.ts` is created. The bundle-size reasoning behind it lives in
the React performance rule in the `react/` subdirectory of this same `code-quality/` directory
(`performance.md` for Claude Code, `performance.instructions.md` for Copilot).

## Applying the Convention

These rules govern new files and deliberate restructures. Parts of the codebase predate the
convention; do not mass-rename existing files or folders as a side effect of unrelated work. When a
file is already being split, moved, or rewritten, bring its name (and its folder's name) into
conformance as part of that change.
