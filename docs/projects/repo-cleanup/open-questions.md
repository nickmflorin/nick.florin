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

## 4. Which CLI stack should the scripts adopt? (added 2026-08-12)

Everything under `src/scripts/` is driven by hand-rolled tooling: `src/scripts/cli/args.ts` parses
arguments, and `src/support/terminal.ts` and `src/support/stdout.ts` emit raw ANSI. That was
proportionate when the scripts were one-shot seeders; the content sync script is now an interactive
tool an operator reads a diff in and answers a prompt from, and the gaps are real (see the
resume-generation backlog for the specific ones). Mature TypeScript packages solve all of it.

The question is which, and how far to go. Candidates, by concern:

- **Argument parsing** — `commander` (with `@commander-js/extra-typings` for inferred types),
  `yargs`, `cac`, `citty`, or `clipanion`. Node's built-in `util.parseArgs` is the zero-dependency
  option and would cover a surprising amount of it.
- **Prompts** — `@clack/prompts` (modern, cohesive, includes spinners and grouped flows),
  `@inquirer/prompts`, or `enquirer`. This is what would replace the raw `readline` y/N confirm and
  make the navigable diff viewer feasible.
- **Color** — `picocolors` (tiny, and honors `NO_COLOR` and non-TTY detection, which the hand-rolled
  helper does not) or `chalk`.
- **Progress and long-running work** — `ora`, or `listr2` for the multi-phase read → plan → confirm
  → write pipeline.

The tradeoffs to weigh: how many dependencies are worth adding to a personal project; whether
`src/support/terminal.ts` and `stdout.ts` retire entirely or stay for the non-interactive scripts;
and whether the seed, generate-resume and sync-repositories scripts migrate in the same pass or the
new stack is proven on the sync script first. Worth noting that the repository currently ships zero
CLI dependencies, so this is the first of its kind rather than a swap.
