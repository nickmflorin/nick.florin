---
name: job-hunt
description:
  Run Nick's LinkedIn job search — set up the job-search preferences and application answers when
  they are missing or incomplete, find, filter and score postings, and apply to the approved ones,
  unattended. Use when Nick says "job hunt", "set up the job search", "find me jobs", "run the job
  search", "apply to the approved jobs", or invokes /job-hunt.
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

This skill performs **setup**, **discovery**, **scoring**, **review** and **applying**, drafting
cover letters for Nick to approve where a form asks for one.

## Ground Rules

- **Personal data never touches the repository.** Preferences, answers, compensation figures,
  company names to avoid and the current employer are written only through
  `pnpm --silent jobs config write`, which stores them in the private data directory. Never write
  them to a file in the working tree — not a draft, not a scratch file, not a test fixture, not a
  doc — and never put them in a commit message, a PR, or a memory.
- **Never invent an answer.** Every value in `answers.yaml` is either derived from the public career
  fixtures or given by Nick. If neither, ask.
- **Never approve a resume.** `jobs resume approve` is reserved for Nick and is denied to agents.
- **Submit only what qualifies, and only once.** Click a "Submit" button only when `applying.submit`
  is `verified` and `jobs apply check` shows the application verified with no blockers, as step 4 of
  Applying describes. Click it once: a submission whose confirmation never appears is deferred to
  Nick, never retried. Under `applying.submit: nick`, never click it.
- **Launch the browser before using it.** The `job-search-browser` server attaches to the job-search
  Chrome rather than launching one, so run `pnpm --silent jobs browser launch` before the first
  browser action of a session. It opens the dedicated profile as an ordinary window, not in
  test-automation mode, which application systems' bot checks reject.
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

The result's `resume` names the approved resume the run will attach. Mention it in the summary, and
when `changedSince` lists files, note that the resume sources have changed since it was generated —
as information only: the approved resume is attached until Nick approves another.

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
each time. `jobs triage --stage card` adds each source's survivors to the run's pool, once each by
company and title, and `jobs pool next` ranks the unopened ones — listed pay at or above the floor,
then applications needing no account, then the most recent:

```bash
pnpm --silent jobs pool next --run <run-id> --cap 20
```

A card pass typically lets most cards through, so open only what `jobs pool next` returns — about 20
per run, leaving the day's page budget well clear of its limit — and leave the rest: they surface
again in a later run.

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

Before leaving each opened posting, save its full text for scoring — the pane is already loaded, so
this costs no page view — by running the `job-detail` script through `evaluate_script` with
`filePath` set to `build/job-search/<id>.json`. After the source's detail-stage triage, move each
saved text into its posting, which deletes the file:

```bash
pnpm --silent jobs posting describe --from build/job-search/<id>.json
```

The description reaches the scorer through the ledger, never through this conversation.

**Take every page view as its own command, and wait for it.** Never chain `jobs budget take` after
another command that can fail, or a page can load without having been budgeted; if one ever does,
take the missing unit at once. Never issue the budget call in the same batch of parallel tool calls
as the navigation or click it pays for: parallel calls run concurrently, so the page would load
while the budget is still waiting out the delay. The grant comes back first; then the browser acts.

### 4. Finish the run

```bash
pnpm --silent jobs run finish <run-id> --ended-by completed
```

Report the sources read, the page views used, what was rejected and why (grouped by reason), and the
postings now pending their score.

## Scoring

Score every posting pending its score.

1. **List them,** and describe any that lack their text:

   ```bash
   pnpm --silent jobs posting list --status pending
   ```

   For each with `described: false`: take a page view, navigate to
   `https://www.linkedin.com/jobs/view/<id>/`, run the `job-detail` script with `filePath` set to
   `build/job-search/<id>.json`, and run `jobs posting describe` on the file.

2. **Launch `job-screener` agents in parallel,** about four posting ids each. They read the
   postings, the preferences and the profile digest through the CLI, record each score with
   `jobs score record`, and reply with one line per posting. Never score a posting yourself, and
   never pass a description into an agent's prompt — it reads the description from the ledger.

3. **Read the queue:**

   ```bash
   pnpm --silent jobs queue show
   ```

## Review

Put the queue in front of Nick. The queue usually holds more than a handful of postings, so ask
first whether he wants them all at once or one at a time. For each posting give the company, title,
total, how it applies (Easy Apply or the applicant tracking system), the posting URL, and the flags
and gaps that matter — never the rationale wholesale. Record each decision, with the reason he gave
in a few words:

```bash
pnpm --silent jobs review <id> --decision approved
pnpm --silent jobs review <id> --decision skipped --reason "too backend"
```

Approved postings wait for the applying stage. Report the decisions at the end: approved, skipped
with their reasons, and what is left on the maybe list.

Postings that score into the band `applying.autoApprove` names are approved at scoring, with a
reason beginning `auto:`, and need no review; only the rest are put in front of Nick.

## Applying

Apply to every approved posting (`jobs posting list --status queued`), one at a time,
**unattended**: Nick is not watching, so never stop to ask him anything during the run. Whatever
needs him — a question the data does not answer, an account to approve, a form the tooling cannot
finish — is set aside with `jobs apply defer` and the run moves on to the next posting. He gets one
report at the end.

An approved resume is required. If `jobs apply start` fails because none is approved, end the run
and report it. Easy Apply applications happen inside a run (`jobs run start`), so that a challenge
can end it; the daily `easy-apply-fill` budget caps how many go out.

### 1. Start the application

```bash
pnpm --silent jobs apply start <id>
```

A refusal means the application system needs an account Nick has not approved. Hand the posting to
him: build its answer packet, which `jobs apply held` then lists for him, and move on.

```bash
pnpm --silent jobs packet build <id>
```

Start it with `--account-approved` only once he has approved the account. Otherwise the result gives
`applyAt`, where the form lives, and `resume`, the staged copy of the approved resume.

### 2. Open the form

- **Easy Apply:** take a page view, navigate to `applyAt`, take an `easy-apply-fill` unit, then
  click the posting's "Easy Apply" button. The form opens in a dialog of several steps.
- **Ashby, Greenhouse and other boards:** navigate to `applyAt`; these pages draw on no LinkedIn
  budget. A sign-in or account-creation page means the account policy applies: defer the posting.
- **A board embedded in the employer's site** — an `applyAt` on the employer's own domain with an
  `ashby_jid` or `gh_jid` in it — sits in a frame the scripts cannot reach. Run the `embedded-board`
  script there and navigate to the `href` it returns, adding `/application` to an Ashby job's
  address, which opens its form. Without an `href`, hand the posting to Nick.

### 3. Fill each step

Repeat for each Easy Apply step — the review step included — or once for a single-page form:

1. **Read** the form with the `form-read` script, and **plan** from the reading:

   ```bash
   pnpm --silent jobs page-script form-read
   pnpm --silent jobs apply plan <id> <<'JSON'
   { … the reading … }
   JSON
   ```

2. **Probe** each `needsOptions` combobox — take one snapshot of the step to find its uid by its
   label, click it with `mcp__job-search-browser__click`, and run the `combobox-options` script,
   which records its options and closes it — then read and plan again.

3. **Defer what only Nick can resolve.** A plan with `unanswered`, `kept`, `unsupported` or
   `coverLetters` entries cannot be finished unattended: the plan has recorded them as blockers.
   Defer the posting and move on; never fill an unanswered question yourself.

   A `coverLetters` entry is a form that requires a cover letter Nick has not approved. Unless
   `jobs cover-letter show <id>` already holds a draft, launch the `cover-letter-writer` agent with
   the posting id to draft one, then defer the posting with the reason "Cover letter drafted;
   awaiting approval". Once he approves it, the next run's `jobs apply start` stages it and the plan
   attaches it.

   An optional cover-letter field is left empty unless a letter was approved; when the posting's
   score is at or above `coverLetters.optionalAt`, launch the agent to draft one for next time, and
   carry on with the application.

   ```bash
   pnpm --silent jobs apply defer <id> --reason "Questions only Nick can answer"
   ```

4. **Fill.** Run the plan's `fillFunction`; every result must be `ok`. Then, for each `interactive`
   entry: a combobox is clicked open by its uid; a typeahead is focused by script and its `typeText`
   typed with `mcp__job-search-browser__type_text`, which needs no snapshot; either way its
   `chooseFunction` then picks the option. A `chosen: null` result means no option fits: defer.

5. **Upload the resume.** For each entry in `uploads`, run `mcp__job-search-browser__upload_file`
   with the staged `resume` path and the uid of the field — the file input, or the "Attach" or
   "Upload resume" button that opens it. Easy Apply's resume step has no file input: upload through
   its "Upload resume" button, whose uid a snapshot of that step gives. The step preselects Nick's
   newest upload, which is never assumed to be the approved resume; the plan leaves the picker
   alone, and the check confirms the approved resume is the one selected.

6. **Check** the step: read it again and pass the reading to the check, re-filling anything it
   reports as a mismatch, until its `status` is `ok`:

   ```bash
   pnpm --silent jobs apply check <id> <<'JSON'
   { … the reading taken after filling … }
   JSON
   ```

   The check also records, as a blocker, any required field no plan covered. Any blocker defers the
   posting.

7. **Move on.** Run `jobs apply pause`, then click "Next", "Continue" or "Review".

A reading whose `challenge` is `true` is refused by the plan. On LinkedIn, stop at once and finish
the run with `--ended-by challenge`. On an employer's site, defer the posting and continue.

A reading whose `signIn` is `true` is refused too. On LinkedIn the session has lapsed: finish the
run with `--ended-by logged-out` and tell Nick to sign in again in the job-search window. On an
employer's site the board wants an account: discard the draft, build the posting's answer packet,
and continue — it is handed to Nick like any posting that needs an account.

### 4. Submit

On Easy Apply's review step, or once a single-page form is filled, the final check must show nothing
`pending`, `resumeVerified: true` and no `blockers`. Then record the application as filled:

```bash
pnpm --silent jobs application filled <id>
```

**Under `applying.submit: verified`:** click "Submit application" (or the form's "Submit") once,
then run the `submission-result` script.

- `confirmed: true` — record the agent's submission, which the cli refuses unless the draft
  qualifies:

  ```bash
  pnpm --silent jobs application submitted <id> --by-agent
  ```

- `confirmed: false` — never click Submit again in this run: a retry after a success that went
  unseen sends a duplicate. Defer the posting with the `errors` in the reason, so Nick can look.
  When the page states plainly that the application was not submitted — "We couldn't submit your
  application" — add `--not-submitted`, which puts the posting back in the queue for a later run.
- A refusal that names spam or a bot check — "flagged as possible spam" — ends unattended submission
  to that application system for the rest of the run: build the answer packets of its remaining
  postings for Nick instead, and say so in the report. Never retry against a bot check.
- A CAPTCHA after the click: defer the posting, and on LinkedIn end the run as a challenge.

**Under `applying.submit: nick`:** leave the form open and tell Nick it is ready; record his
submission with `jobs application submitted <id>` once he says so. Fill nothing else in the tab
until he has.

### 5. Report

At the end of the run, give Nick one report:

- the applications submitted;
- `jobs apply held` — each deferred application, with its blockers (the questions to answer, the
  remembered values to confirm or clear) and reasons, and each posting handed to him to apply to by
  hand, with the path of its answer packet;
- each cover letter drafted this run, for him to read with
  `pnpm --silent jobs cover-letter show <id>` — the letter and the role or project behind each claim
  — and approve with `pnpm --silent jobs cover-letter approve <id>`, a command agents are denied;
- the maybe list awaiting his review.

He answers questions with `jobs answers add`; a deferred posting is then started afresh on the next
run. A posting he drops is discarded with `jobs apply discard <id>`. When he says he applied to a
handed-off posting, record it in one step:

```bash
pnpm --silent jobs application submitted <id> --by-hand
```

## Learning

At the end of every unattended run, and whenever Nick asks how the search is going, read what the
search has learned:

```bash
pnpm --silent jobs learning report
```

Put proposals in the report, never write them unasked: retire a search marked `barren`; draft a
search for a kind of role that keeps scoring well from the recommendations; and turn a reason Nick
gives for skipping again and again into a hard or soft preference. He accepts a proposal, and only
then is it written with `jobs config write`.

## Unattended Run

When invoked to run the job search end to end — "run the job hunt", or a scheduled run — do it all
without stopping to ask anything:

1. **Launch the browser** with `jobs browser launch`.
2. **Discover**, as above, within the day's budget.
3. **Score** every pending posting; postings scored into the band `applying.autoApprove` names are
   approved as they are scored.
4. **Apply** to every approved posting, as above, deferring whatever needs Nick.
5. **Report** once, at the end: what was submitted, `jobs apply held`, the cover letters to approve,
   the maybe list, and the learning report's proposals.

A refusal, a challenge or a lapsed session ends the step it happens in, and the run goes on to the
report.
