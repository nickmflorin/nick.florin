# Open Questions

Unresolved questions that need discussion before (or during) the corresponding backlog items. When
one is settled, record the outcome in [decisions.md](./decisions.md), clear it here, and unblock the
gated items in [backlog.md](./backlog.md).

## 1. Does anything run the tests automatically? (added 2026-08-11)

There is no CI. `.github/` contains only the AI instruction files — no `workflows/` directory — and
the Vercel build runs `prisma generate && next build`, nothing else. `test:ci` is defined in
`package.json` and invoked by nobody, and the same is true of `tsc` and `eslint`.

So the question is broader than tests: is the intent to add a GitHub Actions workflow that gates
pull requests on `pnpm lint && pnpm tsc && pnpm test:ci`, or to keep verification a local,
developer-invoked activity? Writing a large test suite that nothing runs is a real risk — an unrun
suite rots and then gets deleted. But adding CI is a decision about the repository's workflow, not
about tests, and it may belong to the repo-cleanup project instead.

This matters more as of 2026-08-11 than it did when it was written: the suite is now 14 files and
187 tests, and still nothing runs it but a person typing `pnpm test:run`.

## 2. Coverage reporting, coverage thresholds, or neither? (added 2026-08-11)

`jest --coverage` with `collectCoverageFrom` scoped to `src/lib/` and `src/components/` would give a
number to watch. A `coverageThreshold` would make that number enforceable and would fail the suite
when it drops.

The argument against thresholds this early is that they are gameable and they punish the wrong
thing: at fourteen test files, any threshold high enough to be meaningful is unreachable, and any
threshold low enough to pass is noise. The argument for reporting-without-enforcement is that it
makes progress visible without creating an obstacle. Deferred until the suite is non-trivial, but
worth settling before someone adds a threshold reflexively.

## 3. What happens to bugs the easy-win tests uncover? (added 2026-08-11)

The first of the three predicted bugs is settled: `getFileSize` did report `pb` for every exact
power of 1024, and the fix landed with the test on 2026-08-11 (see [decisions.md](./decisions.md)).
Two remain expected: `hexToRgb` silently dropping `alpha: 0` through a truthiness check, and
`capitalize('')` throwing on `s[0].toUpperCase()`.

The default recorded in [README.md](./README.md) is to fix the bug in the same change as the test,
and it worked cleanly for the `fs.ts` one. That is right for all three, which are small and local.
But it is worth confirming the general rule, and deciding what happens when a test uncovers
something that is _not_ small — is the test committed as `it.todo`, committed as a skipped failing
test with a comment, or held back until the fix is scoped separately?
