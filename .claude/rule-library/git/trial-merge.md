# Trial Merge (Non-Destructive Conflict Check)

Detect conflicts with the latest `origin/master` before opening a PR or starting a rebase, without
modifying the working tree or creating a commit.

## Steps

1. Fetch the latest default branch:

   ```bash
   git fetch origin master
   ```

2. Attempt a trial merge — `--no-commit` prevents a merge commit, `--no-ff` forces a real merge
   attempt even when fast-forward would apply:

   ```bash
   git merge --no-commit --no-ff origin/master
   ```

3. **Regardless of outcome**, abort to restore the working tree:

   ```bash
   git merge --abort
   ```

4. If the trial merge exited non-zero, there are conflicts. List the divergent files and stop —
   surface the list to the developer and ask whether to merge `master` and resolve before
   continuing. Do not open or update a PR with known conflicts:

   ```bash
   git diff --name-only origin/master...HEAD
   ```

5. If the trial merge exited zero, continue silently.

## Caveats

- Requires a clean working tree — `git merge` refuses to start otherwise, and the abort in step 3
  only restores what the merge itself touched. Stash or commit first.
- `git merge --abort` after a _successful_ `--no-commit` merge can report there is no merge to abort
  on some git versions; `git reset --merge` is the equivalent cleanup in that case.
