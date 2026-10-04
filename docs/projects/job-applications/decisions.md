# Decision Log

Every non-trivial decision made on this project gets an entry here, newest first. Each entry records
the decision, the date, the reasoning, and any alternatives that were rejected. This is the file to
consult before re-opening a settled question.

Format:

```text
## YYYY-MM-DD — Short decision title

**Decision:** What was decided.
**Why:** The reasoning.
**Alternatives considered:** What was rejected and why (omit if none).
```

---

## 2026-10-04 — Discovery adapted to LinkedIn's AI job search, from the first live session

**Decision:** Four changes, each forced by what the first live session found:

1. **Searches are query phrases.** LinkedIn's job search now reads the query as natural language and
   discards most URL filters — workplace, experience level, location and sort order — while
   substituting the profile's location and adding a salary filter from the profile's job
   preferences. The workplace and location therefore go into the phrase
   (`senior software engineer remote`, `senior software engineer hybrid Washington DC`), the URL
   carries only the keywords and the posting age, and each run reads back the filters LinkedIn
   applied.
2. **The card pass works without job identifiers.** Search result cards expose no identifier until a
   card is opened, so candidates at the `card` stage may have `id: null`: they are deduplicated by
   fingerprint, rejections without an identifier are not recorded (they are rejected again from
   their card at no cost), and only survivors are opened — one page view each — which yields the
   identifier the `detail` stage requires.
3. **Pages are read with read-only scripts.** `jobs page-script result-cards` and `job-detail` print
   scripts the agent runs through `evaluate_script`: the first reads each card through its "Dismiss
   {title} job" button, an accessible name rather than a class name, together with the applied
   filters; the second reads the opened posting's text, its identifier, and its external apply link,
   from which `applyVia` is classified deterministically
   (`src/scripts/job-search/discovery/apply-systems.ts`). A results page costs about 2,500
   characters rather than a 10,000–15,000-token snapshot.
4. **An on-site label in an accepted hybrid city is settled from the description.** At the card
   stage it is deferred rather than rejected; at the detail stage the agent uses the description's
   arrangement where it contradicts the label.

**Why:** The first session read a role labeled "On-site" whose description set two office days a
week in Washington, DC; saw every URL filter but the posting age discarded; and found no job
identifiers on search result cards.

**Alternatives considered:** Keeping URL filters (most are ignored). Opening every card to get its
identifier (spends the page budget on obvious mismatches). Full snapshots (several times the
tokens). Trusting the workplace label (loses mislabeled hybrid roles).

---

## 2026-10-04 — LinkedIn is signed into with a password; attaching to a normal launch is deferred

**Decision:** The dedicated profile is signed into LinkedIn with the account's email and password.
The `job-search-browser` server keeps launching Chrome itself.

**Why:** The server launches Chrome in test-automation mode ("Chrome is being controlled by
automated test software"), in which Google refuses sign-in, so "Sign in with Google" fails. A
password sign-in works in that mode. The cost is that the mode also sets `navigator.webdriver`,
which LinkedIn can read on every page — accepted for now under the daily limits, the pacing and the
single tab.

**Alternatives considered:** Launching the dedicated profile as an ordinary Chrome window with a
local debugging port and attaching to it with `--browserUrl` (Google sign-in works and the
test-automation mode is gone; costs a launch command before each session; deferred to a future
improvement). Neither removes LinkedIn's other means of detecting automation, nor changes that its
terms prohibit it.

---

## 2026-10-03 — Setup precedes live discovery; the agent reads pages for v1

**Decision:** Stage 3 is split so that nothing touches LinkedIn before the preferences exist: 3a
adds the `job-search-browser` server, the `~/job-search/` directory and a search-URL builder, with
no LinkedIn traffic; 3b is the setup step that writes `preferences.yaml` (brought forward from stage
4); 3c is live discovery, after a session restart loads the browser server and a manual LinkedIn
login in its window. Postings are read from LinkedIn's pages by the agent: it reads the page's
accessibility snapshot and writes the candidate JSON, which `jobs triage` validates against the
candidate schema.

**Why:** Discovery depends on the preferences, so setup has to come first. An agent reading the
snapshot survives LinkedIn's frequent markup changes, and the schema check bounds what it can
produce; a fixed extractor cannot be written until real pages have been studied, and breaks silently
when the markup moves.

**Alternatives considered:** A fixed DOM extraction script run in the page (fast, no per-page model
cost, but brittle against obfuscated, frequently changing markup; deferred to a future improvement
for the result pages, once real sessions show which fields are stable).

---

## 2026-10-03 — Resume provenance is captured when the HTML is emitted

**Decision:** The state of the resume sources — the commit, and the uncommitted files under
`public/documents`, `src/documents`, `src/scripts/generate-resume` and `src/styles/document` — is
captured when `resume:generate` emits the HTML and recorded beside the HTML directory. The PDF step
copies that record into the PDF's sidecar, adding the PDF's hash. HTML with no record produces a PDF
with no sidecar, which `jobs resume approve` treats as a possible draft; a failure to run git warns
instead of failing generation.

**Why:** The PDF step prints whatever HTML is on disk, so capturing the working tree at print time
records the wrong state: edit, emit the HTML, revert, print, and the PDF would read as clean while
containing the abandoned edits. The renderer's imports and stylesheets stay within the four source
paths, apart from CLI plumbing that does not affect output.

**Alternatives considered:** Capturing at print time (the first version; wrong for a PDF-only run).
A bare dirty flag for the whole working tree (unrelated work in progress would mark every resume a
draft).

---

## 2026-10-03 — Agent-facing commands speak JSON on a clean standard output

**Decision:** Every command the agent calls extends a `JsonCommand` base that writes exactly one
JSON document to standard output. A correct-but-negative outcome — a spent budget, an active
cooldown — has the status `refused` and the abort exit code (2); a failure has the status `error`
and exit code 1. The CLI entry routes `console.log`, `info` and `debug` to standard error before
loading any command, and a `pnpm jobs` script runs the CLI without the `node:validate` step, so that
nothing else reaches standard output:

```bash
pnpm --silent jobs budget take page-view
```

`jobs budget take page-view` blocks until the randomized delay since the previous page load has
passed, under a lock in the system temporary directory, so pacing holds however many callers there
are. Triage takes the same lock. Postings that pass every hard filter at the `detail` stage are
recorded with a new `pending` status until scored.

**Why:** Smoke-testing the first version showed the Node version check and the Prisma client's
import-time logging writing into standard output ahead of the document, which breaks parsing.
Blocking on the delay, rather than returning a delay for the caller to honor, keeps pacing enforced
by code. The lock is local because the data directory is synced and a lock is meaningful only on the
machine that holds it.

**Alternatives considered:** Parsing the last line of standard output (fragile, and a log line on
the last line breaks it). Returning the delay for the agent to wait out (pacing would depend on the
agent's discipline).

---

## 2026-10-03 — v1 attaches one explicitly approved resume; versions and tailoring are future work

**Decision:** Every v1 application attaches a single resume that the human has explicitly approved
for sending. Approval is deliberate, human-only, and isolated from ongoing resume iteration:

1. **No default.** `jobs resume approve` lists the PDFs in `build/documents/resume/` and requires
   one to be chosen — never "the newest" implicitly. It opens the chosen PDF for inspection and asks
   for confirmation afterwards.

   ```bash
   pnpm cli jobs resume approve
   ```

2. **Iteration drafts are flagged.** `resume:generate` writes a provenance sidecar beside each PDF
   (git commit, and whether the working tree was dirty). Approving a PDF generated from uncommitted
   changes is called out, and requires typing its file name to proceed.
3. **Human-only.** The command requires an interactive terminal, so an agent's non-interactive shell
   cannot complete it; `.claude/settings.json` denies it to agents outright; the guardrail rules
   state that approval belongs to the human. Runs never offer to re-approve.
4. **Isolated.** The approved resume is a copy in `JOBS_DATA_DIR/resume/`, under a clean file name,
   with a manifest of its source file, provenance and hash. Regenerating or clearing `build/` cannot
   change it. At attach time the copy's hash is checked against the manifest, and a mismatch halts
   the application.
5. **Required to apply.** With no approved resume, discovery and scoring run but filling waits.

The start-of-run summary shows the approved resume and, when resume content has changed since it was
approved, says so — as information only; the approved copy stays in use until the human approves
another. The ledger records the hash of the exact file attached to each application. On Easy Apply,
the file is uploaded only when its hash differs from the last one sent; otherwise LinkedIn's stored
copy is selected.

Named resume versions (each separately approved, chosen per posting by the scoring agent) and
per-posting generated resumes are recorded as future improvements in [backlog.md](./backlog.md).

**Why:** `build/` accumulates PDFs generated mid-iteration, and iterations are sometimes left
unfinished, so neither the newest build output nor on-demand generation (which renders whatever the
working tree holds) can be trusted to be sendable. What reaches employers must be a deliberate,
inspected choice that no agent and no later regeneration can make or change. The provenance sidecar
turns "was this a draft?" into a fact rather than a memory. A single resume is enough to start
applying, and review decisions will show which kinds of roles are actually pursued — the evidence
named versions should be designed from.

**Alternatives considered:** Pinning the newest build output by default, with runs offering to
re-pin (initially recorded the same day, superseded: both make sending an unfinished draft a
one-step accident). Generating per run (sends whatever the working tree holds). Named versions now
(needs a variant mechanism in the resume-generation pipeline first; deferred). Generated per-posting
resumes (the largest build, a new document to review with every application, and the furthest drift
from reviewed content; deferred).

---

## 2026-10-03 — Cover letters only where the form asks, and optional ones only for strong matches

**Decision:** A cover letter is drafted when an application form requires one, or offers an optional
one and the posting scored 80 or above. Postings below 80 with an optional field, and forms with no
field, get none. Drafts are written from the description, the profile digest, the scoring agent's
fit rationale, and a `voice.md` in `JOBS_DATA_DIR` holding samples of the human's own writing. They
take the strongest accurate framing of real experience and never invent facts; each claim cites the
role or project behind it. A draft is shown beside the filled form in review, edited or approved
there, saved as Markdown in the posting's packet, and rendered to PDF for upload fields with the
same headless-Chrome approach as `pnpm resume:generate`.

**Why:** Easy Apply rarely asks for a letter, so drafting one per posting is wasted effort; the
optional field is worth filling only where the match is strong. Writing samples keep the letters in
the human's voice rather than a template's, and per-claim citations make the review fast. Approval
rides on the existing human-submit gate, so no letter is attached unseen.

**Alternatives considered:** Never drafting (leaves required fields as blockers). Drafting for every
queued posting (cost and review time for letters nobody asked for).

---

## 2026-10-03 — A dedicated Chrome profile, through a second MCP server entry

**Decision:** The browser is a dedicated Chrome profile, launched and driven by a second
`chrome-devtools-mcp` entry in `.mcp.json`. The existing `chrome-devtools` entry, used for
developing the site, is unchanged:

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"]
    },
    "job-search-browser": {
      "command": "npx",
      "args": [
        "-y",
        "chrome-devtools-mcp@latest",
        "--userDataDir=${HOME}/job-search/profiles/chrome"
      ]
    }
  }
}
```

- The profile lives at `~/job-search/profiles/chrome`, outside the repository and outside iCloud,
  with a short README in `~/job-search/` saying what it is and where the job-search data lives.
- LinkedIn is logged into by hand, once, in that window; the session persists in the profile. No
  credentials are stored. A run that finds itself logged out stops and asks for a manual login.
- The window is headed, never headless.
- Only the orchestrating skill uses `job-search-browser`; the guardrail rules forbid other work from
  touching it, which keeps the page-view budget honest.

**Why:** A dedicated profile confines the agent to LinkedIn and the application sites, where
attaching to the everyday browser would expose every tab and logged-in site and leave remote
debugging enabled in it. The profile holds live session cookies, is hundreds of megabytes of
constantly rewritten cache, and would resolve to a fresh empty copy in each worktree — so it stays
out of the repository's working tree; iCloud would corrupt it, as it would a SQLite file. A
home-directory location is chosen over `~/Library/Application Support/` so that it stays visible. A
persistent session makes logins rare, and a scripted login is the action most likely to trigger
LinkedIn's security challenges, so credentials are not stored even in `.env.local`.

**Alternatives considered:** Attaching to the everyday Chrome with `--autoConnect` (no login, but
full access to every tab and site). Launching Chrome with a debugging port for `--browserUrl` (since
Chrome 136 that requires a non-default profile anyway, so it is this option with more manual steps).
A gitignored profile directory inside the repository (live session cookies one ignore mistake from
publication, watcher and tooling churn, and an empty profile per worktree). Logging in from
credentials in environment variables (rare need, highest challenge risk, plaintext password).

---

## 2026-10-03 — The ledger is YAML files in the private data folder

**Decision:** The ledger is a directory of YAML files under `JOBS_DATA_DIR/ledger/`, validated by
zod schemas on read:

```text
ledger/
  postings/
    4012345678.yaml        # one per posting, named by its LinkedIn job ID
  runs/
    2026-10-03-1.yaml      # sources, run-only overrides, counts, per-search yield
  budget/
    2026-10-03.yaml        # daily counters
  cooldown.yaml            # present only while a cooldown is active
```

```yaml
# postings/4012345678.yaml
id: '4012345678'
url: https://www.linkedin.com/jobs/view/4012345678
company: Acme
title: Senior Frontend Engineer
fingerprint: acme|senior-frontend-engineer
source: { run: 2026-10-03-1, search: senior-frontend-remote }
applyVia: easy-apply # easy-apply | greenhouse | lever | ashby | workday | other
status: queued # filtered | dropped | maybe | queued | filled | submitted | skipped
score: { total: 78, flags: ['Requires 2 days/week onsite'] }
review: { decision: null, reason: null }
```

Deduplication keys on the LinkedIn job ID, falling back to the fingerprint (company and normalized
title) to catch a posting reposted under a new ID.

The cli reaches the ledger through a storage port, the same shape as the content sync engine's
`ContentStore` port with its `YamlFixtureStore` and `PrismaContentStore` adapters in
`src/database/content/`. The YAML directory is the first adapter; a database is a later one.

**Why:** It keeps all private data in one backed-up place, stays human-readable and hand-editable,
matches the resume fixtures' format, and syncs safely through iCloud because each file is small and
written by a single machine. Scanning files is fast enough at the expected scale of hundreds to a
few thousand postings.

**Alternatives considered:** Tables in the repository's Postgres database (real queries, but the
models would land in the public `schema.prisma` beside the site's content, and the data would live
only in a local, unbacked database). Deferred rather than rejected: the storage port leaves a
migration open for when the scale or the reporting needs justify it. A single SQLite file (ruled out
by the iCloud location).

---

## 2026-10-03 — Daily limits and pacing, enforced by the cli

**Decision:** LinkedIn activity is bounded by a `limits` section of `preferences.yaml`, with these
defaults:

```yaml
limits:
  linkedinPageViewsPerDay: 120 # search results + posting details + Easy Apply steps
  easyApplyFillsPerDay: 15 # forms filled and handed over for submission
  runsPerDay: 2
  delaySeconds: [5, 15] # randomized pause between LinkedIn page loads
  cooldownHoursAfterChallenge: 48
```

- The agent asks a cli command for budget before every LinkedIn page load; daily counters live in
  the ledger, and a refused budget ends the run.
- LinkedIn is browsed in a single tab, strictly sequentially. Only scoring, which never touches
  LinkedIn, runs in parallel.
- A CAPTCHA, an "unusual activity" interstitial or an unexpected logout ends the run and records a
  cooldown in the ledger; the cli refuses LinkedIn runs until it expires.
- The learning loop may propose lowering a limit, never raising one; raising is a manual edit.
- Runs are started by the human, never scheduled.

**Why:** LinkedIn does not publish its detection thresholds, so the target is the profile of an
active human job seeker: dozens of postings a day, one tab, at reading pace. Enforcing the budget in
deterministic code means it holds regardless of how an agent run goes. 120 views is roughly 6–8
result pages plus 40–60 detail views after card filtering, plus Easy Apply steps — enough to fill a
queue of 15.

---

## 2026-10-03 — Fit scoring by a Sonnet agent with structured output and tunable thresholds

**Decision:** Every posting that survives the hard filters is scored by a `job-screener` agent
running on Sonnet, in parallel. Its input is the description, the `soft` preferences and `notes`,
and a compact profile digest that a cli command derives from `src/documents/resume/fixtures/`
(roles, and competencies with their years and proficiency) — not the raw fixture files. Its output
is structured:

```json
{
  "score": 78,
  "dimensions": { "stack": 90, "seniority": 80, "domain": 60, "company": 70, "notes": 75 },
  "dealbreakers": [],
  "gaps": ["Requires Go for backend services"],
  "flags": ["Listed as remote, but the description requires 2 days/week onsite"],
  "rationale": "Strong TypeScript/React match at the right level; the domain is adjacent..."
}
```

Thresholds live in `preferences.yaml`, where the learning loop can propose changes to them:

| Score                        | Outcome                                      |
| ---------------------------- | -------------------------------------------- |
| 70 and above                 | Review queue                                 |
| 50–69                        | A collapsed "maybe" list below the queue     |
| Below 50, or any dealbreaker | Dropped, but recorded in the ledger with why |

The agent is instructed to flag contradictions between a posting's labels and its text — "remote"
with onsite days, "senior" with junior compensation, a clearance requirement in the fine print —
since those are exactly what the hard filters cannot catch. Scores also feed each generated search's
yield.

**Why:** Fit is judgment, and Haiku misses the subtle flags; after the hard filters the volume is
tens of postings per run, so Sonnet's cost is small. Structured output lets deterministic code rank,
threshold and record. Recording dropped postings with their reasons is what makes the thresholds
tunable after the fact.

**Alternatives considered:** Haiku (cheaper, but weaker at the contradictions that matter most).
Feeding the raw fixtures on every call (more tokens, no better judgment).

---

## 2026-10-03 — Setup fills only what is missing; each run confirms or overrides

**Decision:** The orchestrating skill validates `preferences.yaml` against its zod schema at the
start of every run.

- **File missing:** run setup — derive what the career content reveals, ask the personal
  constraints, write the file, then continue into the run.
- **File present but incomplete** (a field added to the schema later, or one left unset): ask only
  for the missing fields and write them back. Nothing already answered is asked again.
- **File complete:** show a one-screen summary of the saved preferences, together with any edits the
  learning loop has queued, and ask one question — run as saved, adjust for this run only, or update
  the saved preferences. Adjustments are given as free-text deltas ("onsite in Boston is fine this
  time", "add fintech to avoided domains") and applied as an overlay.

A run-only adjustment never touches `preferences.yaml`; it is recorded on that run's ledger entry,
so every posting the run produced can be traced to the preferences in force when it was scored.

**Why:** Personal constraints rarely change, so re-asking them is friction, but a single run
sometimes needs a one-off exception. Schema validation makes "what is missing" mechanical rather
than a judgment, so schema growth costs one question rather than a fresh setup. Recording overrides
on the run keeps the learning loop from mistaking a one-off exception for a shift in preferences.

**Alternatives considered:** A separate, explicitly invoked setup command (an extra step to
remember; the missing file already says setup is needed). Re-confirming every field each run (the
friction this avoids).

---

## 2026-10-02 — Claude derives the searches; preferences are drafted, then learned

**Decision:** The human does not author search filters. Discovery works in three parts:

1. **Setup, once.** A setup step of the orchestrating skill reads `src/documents/resume/fixtures/`
   and drafts `preferences.yaml` itself — titles from roles, keywords and stack from the strongest
   competencies, seniority from years of experience. It asks only for what career content cannot
   reveal (compensation floor, workplace, acceptable locations, sponsorship, companies to avoid),
   then presents the draft for approval.
2. **Each run, two sources**, read in the browser: LinkedIn's personalized recommendations
   (`/jobs/collections/recommended`), and searches Claude generates from the profile as title ×
   keyword combinations carrying LinkedIn's own filters as query parameters. Each generated search's
   yield — how many of its postings scored into the queue — is tracked in the ledger; productive
   searches are kept and barren ones retired.
3. **Learning from review.** Approving or skipping a posting in the review queue accepts an optional
   short reason, recorded in the ledger. Periodically Claude proposes edits to `preferences.yaml`
   from the accumulated reasons and search yields; each edit is approved or rejected individually.

Results are read in two passes: the hard filters run on the result-card data first, and only
survivors have their full description opened. A company watchlist read through the applicant
tracking systems' public APIs, and LinkedIn job-alert emails, are recorded as future improvements in
[backlog.md](./backlog.md).

**Why:** Everything search needs except a handful of personal constraints is already in the career
content, so asking for it again is busywork. LinkedIn's recommendations are personalized without any
configuration. Yield tracking and review reasons let the preferences improve as a by-product of
reviewing rather than by editing YAML. Filtering on the cards keeps the pages viewed — the account
activity — to a small fraction of the result count; the daily caps bound the rest.

**Alternatives considered:** Hand-authored saved-search URLs (initially chosen the same day,
superseded: it puts the filter-writing burden on the human). A company watchlist (no LinkedIn
activity, but only covers companies named in advance; deferred). Job-alert emails (needs a mail
connector, carries few postings, and still needs the browser for details; deferred).

## 2026-10-02 — Preferences split into hard filters and soft signals

**Decision:** `preferences.yaml` has two sections, drafted by the setup step and refined through
review (see the entry above) rather than written by hand. `hard` holds filters the cli applies
deterministically, rejecting a posting before the scoring agent sees it; `soft` holds signals the
agent weighs. The shape (values illustrative):

```yaml
hard:
  titles:
    include: ['senior software engineer', 'staff engineer']
    exclude: ['manager', 'intern']
  workplace: [remote] # remote | hybrid | onsite
  locations: [] # acceptable cities for hybrid or onsite roles
  compensation:
    floor: 0
    whenUnlisted: pass # pass | reject
  companySize:
    bands: ['11-50', '51-200', '201-500', '501-1000'] # LinkedIn's employee-count bands
    whenUnknown: pass # pass | reject
  sponsorshipRequired: false
  postedWithinDays: 14
  companies:
    block: [] # fuzzy-matched by name; the current employer is always on it

soft:
  stack:
    required: [TypeScript, React]
    preferred: [Next.js]
    avoid: [Angular]
  companies:
    prefer: []
    stage: [startup, growth]
  domains:
    prefer: [devtools]
    avoid: [gambling]
  notes: |
    Free-text preferences and dealbreakers, read by the scoring agent directly.
```

A posting with no listed compensation passes by default and is flagged in the review queue; one
whose listed range tops out below the floor is rejected. Unknown company size is treated the same
way. Company names are matched loosely ("Acme" matches "Acme Inc." and "Acme Labs").

**Why:** Hard filters cost nothing and are predictable, so everything that can be decided by rule is
decided before any model call. Stack is soft because descriptions list technologies inconsistently
and a keyword filter would drop good matches; the agent compares against the real competencies in
`src/documents/resume/fixtures/` instead. Company size is hard because LinkedIn publishes it as a
fixed band on every company page; stage (startup, growth) is not published consistently, so it stays
soft. Unlisted compensation passes because many strong postings omit it.

**Alternatives considered:** Stack as a hard keyword filter (drops good matches). Rejecting unlisted
compensation (discards a large share of postings).

## 2026-10-02 — Private data lives in iCloud Drive (location revised 2026-10-03)

**Decision:** Preferences, canned answers, the ledger and answer packets live in an `ai/` folder
nested in a `job-search/` folder in iCloud Drive, beside the per-employer folders under
`Documents/professional/` (in Finder: iCloud Drive › Documents › professional › job-search › ai),
set to Keep Downloaded, and located through `JOBS_DATA_DIR` in `.env.local`. The nesting leaves
`job-search/` itself for the human's own job-search material, apart from what the tooling reads and
writes. The path is the iCloud Drive path on disk; `~/Documents` is a separate, local-only folder on
this machine (Desktop & Documents sync is off), so it must not be used as a shorthand.

```bash
JOBS_DATA_DIR="$HOME/Library/Mobile Documents/com~apple~CloudDocs/Documents/professional/job-search/ai"
```

```text
job-search/
  ai/
    preferences.yaml
    answers.yaml
    ledger/
    packets/
```

The tooling refuses to run when the path resolves inside the repository.

**Why:** iCloud is backed up and synced, sits beside the other private career material, and cannot
be committed by accident. Keep Downloaded prevents macOS from evicting files a script then fails to
read. The inside-the-repository guard closes the one remaining way the data could reach git.

**Alternatives considered:** A gitignored directory in the working tree (no backup, lost with the
clone, and one `.gitignore` mistake from being published). Consequence: the ledger cannot be a
SQLite file, which iCloud sync can corrupt.

## 2026-10-02 — External applications are staged by applicant tracking system

**Decision:** v1 fills LinkedIn Easy Apply forms; every posting that leaves LinkedIn is classified
by its applicant tracking system and queued with a prepared answer packet. v2 adds form filling for
Greenhouse, Lever and Ashby, stopping before Submit as with Easy Apply. Workday, iCIMS, Taleo and
similar systems stay manual, with the packet, indefinitely.

**Why:** Greenhouse, Lever and Ashby forms are single-page, standardized across employers and need
no account, so one adapter each covers every employer on them — and they host a large share of
tech-company postings. The multi-page systems require an account per employer and are configured
differently by each, so automating them is an open-ended project with a poor return. The packet
makes the manual path fast regardless. These forms are not LinkedIn, so the account-restriction risk
does not apply to them; the stop-on-challenge rule covers the CAPTCHAs some of them present.

**Alternatives considered:** Easy Apply only, with bare links (leaves the external majority fully
manual). All three single-page systems in v1 (delays the first usable version). Every system,
including Workday (open-ended, brittle).

## 2026-10-02 — A human submits every application

**Decision:** The process discovers, filters, scores and fills applications, then stops at the final
step for a human to review the filled form and click Submit. It never submits on its own.

**Why:** LinkedIn's User Agreement prohibits bots and automated activity, and accounts that look
automated get restricted — the account at stake is the primary professional one. A human submit
keeps the activity human-shaped, and it puts a review in front of every application before it
reaches an employer, which catches a mis-filled field or a poor match that the scoring let through.

**Alternatives considered:** Auto-submitting above a high score threshold with daily caps (more
throughput, materially higher account risk; revisitable once the filling is proven reliable).
Discovery and triage only, never touching forms (safest, but leaves the most repetitive part of the
work manual). Fully autonomous (highest risk, and the most likely to send poor applications).

## 2026-10-02 — Tooling is committed here; personal data lives outside the repository

**Decision:** The generic machinery — the cli commands, the skill, the agent and the rules — is
committed to this repository. Preferences, canned answers and the application ledger live outside
it, located through a path configured in `.env.local`.

**Why:** The repository is public. The tooling is generic and benefits from living beside the career
content and resume generation it reads, and from the repository's conventions and CI. The data is
personal — compensation, target companies, work authorization, application history — and must never
be committed.

**Alternatives considered:** A separate private repository for everything (fully private, but
duplicates the tooling conventions and reads the career content across repositories). Everything
here under a gitignored directory (simple, but nothing is versioned or backed up). The exact
location of the private data is still open — see [open-questions.md](./open-questions.md).
