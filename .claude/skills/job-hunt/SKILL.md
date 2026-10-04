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

This skill performs **setup** and **discovery**. Scoring and applying land in later stages of the
project; discovery ends with the surviving postings recorded as `pending`, and if asked to score or
apply, say so rather than improvising it.

## Ground Rules

- **Personal data never touches the repository.** Preferences, answers, compensation figures,
  company names to avoid and the current employer are written only through
  `pnpm --silent jobs config write`, which stores them in the private data directory. Never write
  them to a file in the working tree — not a draft, not a scratch file, not a test fixture, not a
  doc — and never put them in a commit message, a PR, or a memory.
- **Never invent an answer.** Every value in `answers.yaml` is either derived from the public career
  fixtures or given by Nick. If neither, ask.
- **Never approve a resume.** `jobs resume approve` is reserved for Nick and is denied to agents.
- **Every LinkedIn page load is budgeted.** Run `pnpm --silent jobs budget take page-view` before
  every navigation and before opening every result card, in the `job-search-browser` tab only, one
  at a time. A refusal ends the run.
- **Stop on a challenge.** A CAPTCHA, an "unusual activity" page, a security checkpoint or an
  unexpected sign-in page ends the run at once, with `--ended-by challenge` or `logged-out`. Never
  attempt to get past one, and never sign in on Nick's behalf.

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

## Discovery

Run discovery once both configuration files are `complete`. Every page is read with the read-only
page scripts, never with a full snapshot unless a script comes back empty:

```bash
pnpm --silent jobs page-script result-cards   # prints { "function": "() => { … }" }
pnpm --silent jobs page-script job-detail
```

Pass the printed `function` to `mcp__job-search-browser__evaluate_script` with
`waitForStableDom: false`.

### 1. Start the run

Confirm the preferences with Nick in one short summary — run as saved, adjust for this run only, or
update the saved file — then start the run, passing each run-only adjustment as given:

```bash
pnpm --silent jobs run start --override "Onsite in Boston is fine"
```

### 2. Read each source's result cards

The sources are the recommendations page (`https://www.linkedin.com/jobs/collections/recommended/`)
and each search in the preferences, by its `url`. For each: take a page view, navigate the tab, and
run the `result-cards` script.

- **Check the page first.** If its `url` is a sign-in, `authwall`, `checkpoint` or challenge page,
  finish the run as `logged-out` or `challenge` and tell Nick.
- **Check the filters.** LinkedIn's job search reads the query as natural language and applies its
  own filters; report any `filters` that contradict the preferences (such as `Remote` missing from a
  remote search) rather than trusting the results to be filtered.
- **Build one candidate per card** from its `lines`: `title`, `company`, `location` and `workplace`
  from the `City, ST (Remote|Hybrid|On-site)` line, `compensation` from a `$…K/yr` line, `postedAt`
  from `Posted N units ago` (computed back from now), `applyVia: 'easy-apply'` when a line reads
  `Easy Apply` and `unresolved` otherwise, `id` when the card has one and `null` otherwise, and
  `null` for every fact the card does not show. `source` is `{ "kind": "recommendations" }` or
  `{ "kind": "search", "search": "<name>" }`.
- **Triage the batch** at the card stage:

```bash
pnpm --silent jobs triage --run <run-id> --stage card <<'JSON'
[ … candidates … ]
JSON
```

### 3. Pool the survivors, then open the most promising

Card-stage survivors are not recorded, so the same posting surfacing in several searches survives
each time. Keep a running pool across the run's sources, deduplicated by company and title, outside
the repository (the session's scratch directory). A card pass typically lets most cards through —
titles fit and few cards list compensation — so do not open every survivor:

- **Cap the openings** at about 20 per run, leaving the day's page budget well clear of its limit.
- **Open the most promising first:** listed compensation at or above the floor, then Easy Apply,
  then the titles closest to the strongest recent work, then the most recent postings.
- **Leave the rest unrecorded.** They surface again in a later run.

Open them source by source, so each search page is loaded once: take a page view, navigate to the
search, then for each target take a page view and run the `open-card` script built for it:

```bash
pnpm --silent jobs page-script open-card --company "<company>" --title "<title>"
```

A result of `found: false` means LinkedIn's results changed and the card is gone; skip it. From the
`header`, `facts` and `applyUrl`, rebuild the candidate with every fact the posting publishes — `id`
(required now), `companySize` from `N-M employees`, `compensation` from a stated range,
`sponsorshipOffered: false` only when the text says no sponsorship, and `applyUrl` — and read the
facts in context: "hybrid" in "hybrid mobile apps" is not an office arrangement. When the
description contradicts LinkedIn's workplace label (an "On-site" role describing two office days a
week), use the description's arrangement. Triage each source's opened postings at the detail stage;
survivors are recorded as `pending`.

**Take every page view as its own command.** Never chain `jobs budget take` after another command
that can fail, or a page can load without having been budgeted; if one ever does, take the missing
unit at once.

### 4. Finish the run

```bash
pnpm --silent jobs run finish <run-id> --ended-by completed
```

Report the sources read, the page views used, what was rejected and why (grouped by reason), and the
postings now pending their score.
