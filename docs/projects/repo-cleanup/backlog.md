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

## UI & Assets

- [ ] Consider moving away from FontAwesome, for simplicity and to remove the license.
      **(decision-gated)** — see [open-questions.md](./open-questions.md) #1.
