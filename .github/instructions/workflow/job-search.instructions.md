---
applyTo: '**/*'
description:
  'Guardrails for the job-search tooling: private data, LinkedIn activity, and what only Nick does'
---

<!-- Parity: keep in sync with .claude/rules/workflow/job-search.md -->

# Job Search Guardrails

The job-search tooling (`docs/projects/job-applications/`, `src/scripts/job-search/`, the `job-hunt`
skill) acts on Nick's LinkedIn account and handles his private job-search data. These rules hold in
every session, whatever the task.

## Private Data Stays Out of the Repository

Preferences, application answers, compensation, target and blocked companies, the current employer
and the application ledger live only in the private data directory (`JOBS_DATA_DIR`). They are
written only through the CLI, never to a file in the working tree, a commit, a PR, a doc, a test
fixture or a memory.

```bash
# Correct: the CLI validates the file and writes it to the private data directory.
pnpm --silent jobs config write preferences <<'YAML'
# …
YAML

# Disallowed: personal data written into the working tree, where one commit publishes it.
cat > src/scripts/job-search/my-preferences.yaml <<'YAML'
# …
YAML
```

Two places outside the data directory hold private files briefly, both because the browser server
reads and writes only inside the workspace and the operating system's temporary directory:

- `build/job-search/`, where the browser server saves a posting's text for `jobs posting describe`
  to move into the ledger. It is gitignored, and each file is deleted on attach.
- `job-search-resume/<id>/` in the temporary directory, where `jobs apply start` stages the approved
  resume for upload. It is readable by Nick's account alone, and is removed when the application is
  submitted or discarded.

```bash
# Correct: the CLI stages the verified approved resume, and the upload reads the staged copy.
pnpm --silent jobs apply start 4012345678   # prints { "resume": "…/job-search-resume/…/…pdf" }

# Disallowed: the resume copied into the working tree, one `git add -A` away from being published.
cp "$JOBS_DATA_DIR/resume/Resume.pdf" build/resume.pdf
```

## LinkedIn Activity Is Budgeted and Human-Paced

Use only the `job-search-browser` server, attached to the job-search Chrome that
`pnpm --silent jobs browser launch` opens — never a browser in test-automation mode, whose
`navigator.webdriver` flag application systems reject as a bot — in one tab, one page at a time.
Take a unit from the daily budget before every page load and every result card opened, as its own
command whose grant is received before the browser acts — never in the same batch of parallel tool
calls, which run concurrently — and stop on a refusal:

```bash
pnpm --silent jobs budget take page-view
```

A CAPTCHA, an "unusual activity" page, a security checkpoint or an unexpected sign-in page ends the
run with `jobs run finish … --ended-by challenge` or `logged-out`. Never try to get past one.

## What Only Nick Does

- **Deciding to submit.** The agent clicks "Submit" only when `applying.submit` is `verified` and
  the application's draft is verified, unblocked and not deferred — the conditions
  `jobs application submitted --by-agent` enforces — and clicks it once: a submission whose
  confirmation never appears is deferred to Nick, never retried. Under `applying.submit: nick`, it
  never clicks one.
- **Approving a resume.** `jobs resume approve` is reserved for him and denied to agents.
- **Signing into LinkedIn, unless he has turned automatic sign-in on.** With `signIn.automatic` on
  in the preferences, `pnpm --silent jobs linkedin sign-in` signs in with the credentials the
  environment variables named by `signIn.emailVariable` and `signIn.passwordVariable` hold in the
  gitignored `.env.local`, typing them itself so they never pass through the agent. Never read,
  print, type or store the credentials yourself, and never open `.env.local`. With the setting off,
  a variable unset, or any security check after signing in, Nick signs in by hand.
- **Answering a question the data does not answer.** Never invent an answer. Ask him, or, in an
  unattended run, defer the application with `jobs apply defer` so the question reaches him in the
  run's report.

```bash
# Correct: the application is set aside and the run moves on; the question reaches Nick at the end.
pnpm --silent jobs apply defer 4012345678 --reason "Screening questions only Nick can answer"

# Disallowed: a plausible answer typed into a field the plan reported as unanswered.
```
