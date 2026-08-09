# Open Questions

Unresolved questions that need discussion before (or during) the corresponding backlog items. When
one is settled, record the outcome in [decisions.md](./decisions.md), clear it here, and unblock the
gated items in [backlog.md](./backlog.md).

## 1. Is dropping FontAwesome worth the migration? (added 2026-08-08)

The motivation is simplicity and removing the license. What replaces it (another icon set, inline
SVGs, a curated subset), how many distinct icons the app actually uses, and how the replacement
interacts with the app-performance project's FontAwesome work all need to be understood before
deciding.

## 2. What does adopting the `oil-tracker` environment system entail here? (added 2026-08-08)

The current typed environment lives in `src/environment/`. The question is how much of the
`oil-tracker` approach transfers, and specifically how the `VERCEL_ENV` / `NODE_ENV` handling should
simplify.

## 3. Is TypeScript 7 ready for this repo? (added 2026-08-08)

TypeScript 7 (the native compiler) needs a compatibility check against the toolchain here — Next.js,
ESLint's type-aware rules, Prettier, Jest — before committing to the upgrade.
