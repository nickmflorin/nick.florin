# Backlog

The running list of cleanup items, organized by domain. Check items off as they land (`[x]`), and
add new items to the appropriate domain section as they come up (create a new section if none fits).
Items are independent — each lands on its own branch/PR. Items marked **(decision-gated)** conclude
first with a written recommendation and an entry in [decisions.md](./decisions.md); the
implementation work then proceeds as its own item.

## Dependencies & Upgrades

- [ ] Upgrade Prisma and clean up its deprecation warnings.
- [ ] Move to TypeScript 7. **(decision-gated)** — verify toolchain compatibility first (see
      [open-questions.md](./open-questions.md) #3).
- [ ] Remove the `enumerated-literals` dependency.

## Environment

- [ ] Adopt the environment system from `oil-tracker` and simplify environment variables,
      particularly around `VERCEL_ENV` and `NODE_ENV`. **(decision-gated)** — see
      [open-questions.md](./open-questions.md) #2.

## Conventions & Ergonomics

- [ ] Change the path alias from `~` to `@` (tsconfig, ESLint import rules, and every import in
      `src/`).

## CLI Tooling

- [ ] Adopt a standard CLI stack for `src/scripts/` in place of the hand-rolled
      `src/scripts/cli/args.ts`, `src/support/terminal.ts` and `src/support/stdout.ts`.
      **(decision-gated)** — see [open-questions.md](./open-questions.md) #4 for the candidate
      packages and the tradeoffs. The concrete deficiencies the current tooling has are enumerated
      in the resume-generation backlog's CLI Hardening section; this item is the repo-wide half.
- [ ] Once the stack is chosen, migrate the remaining scripts (`seed/`, `generate-resume/`,
      `sync-repositories.ts`, `calculate-experience.ts`, `update-company-logo.ts`,
      `transcode-project-gifs.ts`) onto it, and retire whichever of the hand-rolled helpers are
      fully superseded.
- [ ] Support bare boolean flags. Every script today requires `--flag=value`, so `--dry-run` fails
      with "The named argument must define a value!" and only `--dry-run=true` works — a papercut on
      every invocation, and the first thing an argument-parsing library fixes.

## UI & Assets

- [ ] Consider moving away from FontAwesome, for simplicity and to remove the license.
      **(decision-gated)** — see [open-questions.md](./open-questions.md) #1.
