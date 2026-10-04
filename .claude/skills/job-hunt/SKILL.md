---
name: job-hunt
description:
  Run Nick's LinkedIn job search — set up the job-search preferences and application answers when
  they are missing or incomplete, then find, filter and score postings. Use when Nick says "job
  hunt", "set up the job search", "find me jobs", "run the job search", or invokes /job-hunt.
argument-hint: '[setup]'
disable-model-invocation: true
---

# Job Hunt

The orchestrating skill of the job-applications project (`docs/projects/job-applications/`). The
machinery lives in `src/scripts/job-search/` and is driven through `pnpm --silent jobs …`, whose
commands each print exactly one JSON document. Treat any output that is not JSON, or any exit code
other than `0` or `2`, as an error: argument errors are printed by the CLI framework before a
command runs. Exit code `2` with `"status": "refused"` is a correct, negative outcome — stop and
report its `reason`, never retry around it.

This skill currently performs **setup** only. Searching, scoring and applying land in later stages
of the project; if asked to run a search, say so rather than improvising one.

## Ground Rules

- **Personal data never touches the repository.** Preferences, answers, compensation figures,
  company names to avoid and the current employer are written only through
  `pnpm --silent jobs config write`, which stores them in the private data directory. Never write
  them to a file in the working tree — not a draft, not a scratch file, not a test fixture, not a
  doc — and never put them in a commit message, a PR, or a memory.
- **Never invent an answer.** Every value in `answers.yaml` is either derived from the public career
  fixtures or given by Nick. If neither, ask.
- **Never approve a resume.** `jobs resume approve` is reserved for Nick and is denied to agents.

## Setup

Run setup when either configuration file is not `complete`, or when Nick asks for it.

### 1. Check where both files stand

```bash
pnpm --silent jobs config status preferences
pnpm --silent jobs config status answers
```

- `missing` — the file does not exist; derive and ask everything below.
- `incomplete` — ask **only** for the fields in `missing`; never re-ask a field already given.
- `invalid` — show Nick the `issues` and ask how to correct them; never overwrite silently.
- `complete` — nothing to set up for that file.

When `missing` is reported because the data directory itself does not exist, tell Nick where it will
be created (the `JOBS_DATA_DIR` in `.env.local`) before the first write.

### 2. Derive what the career content already says

```bash
pnpm --silent jobs profile digest
```

From the digest, draft:

- **`hard.titles.include`** — the titles of the recent roles, generalized (drop company-specific
  qualifiers), **with their spelling variants**: matching is word-based, so `frontend` does not
  match `Front-End` and `senior` does not match `Sr.`. Write each variant as its own entry, such as
  `senior frontend engineer`, `senior front end engineer`, `sr frontend engineer`.
- **`hard.titles.exclude`** — propose the usual mismatches for the level (`intern`, `junior`,
  `manager`, `director`, `recruiter`, and specialties absent from the roles, such as `ios` or
  `data scientist`) for Nick to confirm.
- **`soft.stack`** — `required` from the competencies with the most months and an `EXPERT` or
  `ADVANCED` proficiency; `preferred` from the next tier. Leave `avoid` for Nick.
- **Experience levels** for the searches, from the years in the most recent roles.

For `answers.yaml`, read the public profile fixture (`src/documents/resume/fixtures/profile.yaml`)
for `contact.email`, `links.linkedin`, `links.github` and `links.website`.

### 3. Ask what only Nick knows

Ask with `AskUserQuestion`, at most four questions per call, offering a recommended option first
where there is a sensible one. Skip anything already given.

- **Preferences:** accepted workplaces; acceptable cities for hybrid or onsite roles; whether visa
  sponsorship is required; the current employer (always blocked); other companies to avoid; the
  compensation floor and whether postings with no listed compensation pass; preferred and avoided
  domains; anything to say in `soft.notes`.
- **Answers:** phone, city, region and country; the countries he is authorized to work in; notice
  period in weeks; target compensation. Voluntary self-identification defaults to `decline` — ask
  only if Nick wants to answer otherwise.

### 4. Present the draft, then write

Show both drafts in one message as YAML, with each derived value marked as derived. On approval,
write each file — the whole file, through standard input:

```bash
pnpm --silent jobs config write preferences <<'YAML'
hard:
  # …
YAML
```

A write is refused unless the file satisfies its schema; fix what the reported issues name and write
again.

### 5. Generate the searches

With the preferences written, build three to six searches from title-and-keyword combinations of the
strongest recent work, each through:

```bash
pnpm --silent jobs search url --keywords "senior frontend engineer" --level mid-senior --easy-apply
```

Add each returned `search` entry to `searches` in the preferences, write the file again, and confirm
both files report `complete`.
