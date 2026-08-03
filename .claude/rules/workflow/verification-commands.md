---
paths:
  - '**/*'
description:
  'Which verification commands may be run automatically and which require an explicit request'
---

<!-- Parity: keep in sync with .github/instructions/workflow/verification-commands.instructions.md -->

# Verification Commands

## Never Run Automatically

The commands below must never be run on your own initiative. This applies whether the run would
happen after an individual edit, as a check before reporting on the work, or as a final step once
the work is otherwise complete. Run them only when the developer explicitly asks for them:

- **TypeScript**: `tsc`, `pnpm tsc`, `pnpm tsc:watch`, or any other invocation of the compiler.
- **ESLint**: `eslint`, `pnpm lint`, `pnpm lint:errors`, `eslint --fix`, and the `eslint:format`,
  `eslint:format:fast`, `eslint:cached` and `eslint:changed` scripts.
- **Spellcheck**: `cspell`, `pnpm cspell`.
- **Tests**: `jest`, `pnpm test`, `pnpm test:ci`, or a run scoped to a single suite or test file.

An explicit request covers only the request it was made in. Being asked to run one of these commands
once does not establish standing permission to run it again at the end of a later task.

## What May Be Run

Prettier is the exception: it may be run automatically on the files that were changed, via
`pnpm exec prettier --write` or the `prettier:format` script. A `PostToolUse` hook already formats
each edited file, so an explicit run is rarely necessary.

## Why

Running the full toolchain after every change makes the inner development loop slow, and the
developer and CI both run these commands already. Deciding when to pay that cost is the developer's
call, not yours.

## This Does Not Lower the Bar

Not running a checker is not permission to write code that would fail it. Generated code must still
be written to satisfy the type checker, the ESLint configuration (see
[eslint.md](../code-quality/eslint.md)), the spelling rules (see
[spelling.md](../code-quality/spelling.md)), and the existing tests. Reason about correctness while
writing the code rather than deferring it to a command you are not going to run.
