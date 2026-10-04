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

## 2026-10-04 — Cover letters are drafted unattended and attached only once Nick approves them

**Decision:** Revises "Cover letters only where the form asks" (2026-10-03), whose review of each
letter rode on the human submit that unattended applying removed. The `cover-letter-writer` agent
drafts a letter, with the role or project behind each claim, when a form requires one or offers one
to a posting scored at or above `coverLetters.optionalAt`. The draft is saved unapproved; Nick reads
it with `jobs cover-letter show` and approves it with `jobs cover-letter approve`, which is denied
to agents like `jobs resume approve`. An application whose form requires a letter is deferred until
he approves it; an optional field is left empty until then. `jobs apply start` renders an approved
letter to PDF beside the staged resume, and the plan uploads it, or types it into a text field.

```bash
pnpm --silent jobs cover-letter show 4012345678      # the draft and its citations
pnpm --silent jobs cover-letter approve 4012345678   # Nick only; denied to agents
```

**Why:** A letter is the one part of an application written fresh rather than drawn from Nick's
data, so it is the one place an unattended run could put words in his mouth. Keeping approval human
keeps the rule that no letter reaches an employer unseen, at the cost of one deferral per posting
that requires a letter.

**Alternatives considered:** Attaching drafts unreviewed (the only unverified content an application
would carry). Never drafting (required fields would stay blockers until Nick wrote letters himself).

---

## 2026-10-04 — The job-search Chrome is launched normally, and the browser server attaches to it

**Decision:** The `job-search-browser` server no longer launches its own Chrome.
`jobs browser launch` opens the dedicated profile as an ordinary Chrome window with the DevTools
protocol on port 9222, and the server attaches to it through `--browserUrl=http://127.0.0.1:9222`.
Every session launches the browser before its first browser action; `jobs browser status` reports
whether it is running.

```bash
pnpm --silent jobs browser launch   # { "browser": "Chrome/…", "status": "running" }
```

**Why:** The first agent submission — a fully verified Ashby application — was rejected with "Your
application submission was flagged as possible spam". The likely cause, still to be verified, is
that a Chrome launched by the server runs in test-automation mode, which sets `navigator.webdriver`
on every page, and the invisible bot checks application systems run score that as a bot. Other
signals may have counted too: twelve fields filled by script in seconds, with no keystrokes, from a
profile with little history. A normally launched window carries no automation flag and is the same
profile, so the LinkedIn session survives; it also lifts the earlier block on Google sign-in.

The first submission after the switch is the test: one Ashby posting other than the one already
flagged, submitted once. If it is flagged too, unattended submission to Ashby and Greenhouse stops —
their postings are handed to Nick with answer packets — rather than working against the bot checks.

**Alternatives considered:** Masking the automation flags in the launched browser (fragile, and
indistinguishable from evasion). Leaving employer-site submissions to Nick (defeats running
unattended for a third of the postings).

---

## 2026-10-04 — The agent submits fully verified applications; high scorers skip review

**Decision:** Supersedes "A human submits every application" (2026-10-02). Two settings in
`preferences.yaml`, `applying.submit` (`nick` | `verified`) and `applying.autoApprove` (`never` |
`queued` | `maybe`), both defaulting to the old behavior; Nick chose `verified` and `queued`:

- **Submission.** The agent clicks Submit only on an application whose draft is verified — every
  planned value read back from the form, the approved resume seen attached — and holds no blockers.
  A blocker is a required question the data does not answer, a combobox never probed, a control the
  tooling cannot fill, a value the form remembered from an earlier application rather than took from
  Nick's data, or a required field no plan covered. `jobs application submitted --by-agent` refuses
  anything else, and records `submittedBy: agent` on the posting.
- **Once only.** Submit is clicked once. When the `submission-result` script sees no confirmation,
  the application is deferred, never retried: a retry after a success that went unseen sends a
  duplicate.
- **Unattended runs.** Nothing interrupts a run. An application that needs Nick is set aside with
  `jobs apply defer`, and `jobs apply held` gives him one list at the end: the questions to answer,
  the remembered values to confirm, the unconfirmed submissions and the accounts to approve.
- **Review.** A posting that scores into the queue is approved at scoring, with a reason beginning
  `auto:`; the maybe list still waits for Nick.
- **Inverted questions.** The yes-or-no categories leave a question whose wording inverts it — "able
  to work without sponsorship", "do you require work authorization" — unanswered rather than answer
  it from the category, because the plain answer to the inverted question is the wrong one, and a
  wrong work-authorization answer is an automatic rejection.

```bash
pnpm --silent jobs application filled 4012345678
# click Submit once, then run the submission-result script
pnpm --silent jobs application submitted 4012345678 --by-agent   # refused unless it qualifies
pnpm --silent jobs apply defer 4012345678 --reason "Submitted; no confirmation appeared"
pnpm --silent jobs apply held
```

**Why:** After the first filled application waited for him, Nick said the point of the project is to
apply in the background while he does other things, without clicking Submit on each one. The
original decision's protections are kept where they matter: nothing is submitted that was not
answered from his data and verified in the form, and the daily Easy Apply budget and pacing still
bound how much LinkedIn sees. The account risk that decision weighed is accepted by Nick in exchange
for throughput.

**Alternatives considered:** Auto-submitting Easy Apply only (leaves a third of the postings, on
employer sites, waiting for him). One batch approval of all filled applications (still a per-run
interruption, and filled forms cannot all stay open in one LinkedIn tab).

---

## 2026-10-04 — Forms are filled by one generic reader and filler, and verified before "filled"

**Decision:** Stage 5b fills Easy Apply, Ashby and Greenhouse forms with one set of page scripts
(`src/scripts/job-search/applying/form-scripts.ts`) and one deterministic planner (`fill-plan.ts`),
rather than a script per system:

- **The reader** stamps every field with a `data-job-search-key` attribute and reports its label,
  options, required flag and current value. Labels resolve through `aria-label`, `aria-labelledby`,
  `label[for]` (skipping bare verbs such as "Attach"), the fieldset legend, and the nearest unowned
  label before the field, which covers LinkedIn's dialog, Ashby's radio questions and Greenhouse's
  file inputs alike.
- **The planner** answers each field through the answer resolver, enters a phone number without its
  code beside a separate country-code field, sets LinkedIn's follow and top-choice checkboxes from
  `applying.followCompany` and `applying.markTopChoice` (both off by default), plans the approved
  resume into the resume upload, and leaves every required question the data does not answer for
  Nick — even when the form remembers a value for it.
- **The filler** sets native fields by script. Comboboxes and typeaheads answer only to trusted
  input, so they are opened through the browser server and the option is then chosen by script.
- **Every planned value is recorded in a draft** (`drafts/<id>.yaml` in the data directory) and
  checked against a fresh reading of the form. `jobs application filled` refuses until every value
  has been seen in the form and the approved resume has been seen attached.
- **The approved resume is staged per application** under the operating system's temporary
  directory, the only place outside the workspace the browser server uploads from, and removed when
  the application is submitted or discarded.

```bash
pnpm --silent jobs apply start 4012345678          # account policy, stage the resume, open a draft
pnpm --silent jobs apply plan 4012345678 < reading.json   # plan, record, print the fill script
pnpm --silent jobs apply check 4012345678 < reading.json  # verify what the form now shows
pnpm --silent jobs application filled 4012345678    # refused until the draft is verified
```

**Why:** A live Easy Apply walkthrough of an approved posting, discarded at the review step, showed
what the design must handle. Step 1 would not advance because a required "Location (city)" typeahead
was empty, not because script-set values were ignored; script events work for native fields. The
resume step preselects Nick's newest LinkedIn upload, so leaving the default would attach whatever
he last uploaded, approved or not. The follow-company checkbox is pre-checked. The step headings and
field markup of Ashby and Greenhouse, read live the same day, differ from LinkedIn's but yield to
the same label precedence. Greenhouse renders every select as a combobox whose menu opens only on a
trusted click, and its location search finds "Washington" but nothing for "Washington, DC", so a
typeahead is given the place's leading name and picks the suggestion that best matches the rest. The
draft check exists because a form can silently drop a value — the failure the Location field showed
— and the human submitting should never be the first to notice.

The first end-to-end Easy Apply fill, the same day, confirmed the design and added four details: the
review step carries the pre-checked "Follow {company}" checkbox and so is planned and filled like
any other step; LinkedIn's checkboxes, like its radios, answer only to a click on their
`role="checkbox"` wrapper; a re-render replaces the selected radio's input, so the filler finds a
group's members by name as well as by key; and LinkedIn labels its location typeahead with plain
text, which the reader takes from the field's container when no label element exists. The staged
resume uploaded from the temporary directory as designed.

**Alternatives considered:** A script per application system (three copies of the same label and
option logic, and none for the next board). Trusting the fill results without re-reading the form (a
dropped value would reach the review step unnoticed). Selecting a previously uploaded resume by its
file name (its content cannot be verified). Copying the resume into `build/` for upload (one
`git add -A` from publishing it).

---

## 2026-10-04 — Answers are resolved deterministically; Ashby and Greenhouse filling moves into v1

**Decision:** Application-form questions are answered by `jobs answers resolve`
(`src/scripts/job-search/applying/answers.ts`), which matches each question's label against known
categories — name, contact, links, location, work authorization, sponsorship, start date,
compensation, years of experience with a named competency, voluntary self-identification — and
answers from `answers.yaml`, the preferences, the profile fixture and the profile digest. A saved
answer to the exact question takes precedence. A choice field's answer must fit one of its options.
Anything else comes back `unanswered`, and Nick answers it; `jobs answers add` saves his answer so
that no question is asked twice. Postings applied to by hand get a packet (`jobs packet build`).
`jobs application filled` requires an approved resume and records its hash;
`jobs application submitted` records Nick's word that he submitted. Form filling for Ashby and
Greenhouse, deferred to v2 on 2026-10-02, is part of v1, through the same form reader and filler as
Easy Apply, navigating to the employer's form directly rather than through LinkedIn's interstitial.

**Why:** "Never invent an answer" is enforceable only if the answering is code: a model asked to
fill a form will fill every field. Five of the first fifteen approved postings apply through Ashby
or Greenhouse, which made deferring them expensive.

**Alternatives considered:** The agent answering from the data itself (cannot guarantee it never
guesses). Keeping Ashby and Greenhouse as packets (leaves a third of the approved postings manual).

---

## 2026-10-04 — No new accounts without asking; account-funnel job boards are blocked

**Decision:** Two settings in `preferences.yaml`:

- **`hard.applyHosts.block`** — sites whose postings are rejected at the detail stage when the
  external "Apply" link leads there, whichever company the posting names. `theladders.com` is the
  first entry, and `Ladders` is on the company block list.
- **`applying.newAccounts`** — `ask` (the default), `never` or `allow`. Each application path is
  tagged with whether it needs an account (`AccountRequirements` in
  `src/scripts/job-search/discovery/apply-systems.ts`): Easy Apply, Greenhouse, Lever and Ashby do
  not; Workday does, one per employer; anything else is unknown and treated as needing one. Under
  `ask`, an application that would create an account stops and asks Nick first. Enforcement lands
  with applying, in stage 5.

**Why:** Nick reviewed the first queue and found that Ladders postings read as bait for its own
sign-up and email list rather than real roles, and he does not want accounts created across every
system that posts through LinkedIn unless he approves each one.

**Alternatives considered:** Blocking only the company name (misses postings Ladders publishes under
a client's name). Refusing every path that might need an account (would exclude most external
applications outright rather than asking).

---

## 2026-10-04 — Scoring reads descriptions from the ledger; filtered postings are re-checked

**Decision:**

- **Descriptions bypass the conversation.** When a posting is opened, the `job-detail` script saves
  its text through the browser server's `filePath` to `build/job-search/<id>.json` (gitignored, the
  only place the server may write), and `jobs posting describe` moves it into the posting's ledger
  record and deletes the file. Pending postings without text are re-opened by identifier, one page
  view each. The `job-screener` agents read the text with `jobs posting show`.
- **Scoring and review are CLI operations.** `jobs score record` validates the agent's structured
  score and moves the posting to `queued`, `maybe` or `dropped` by the thresholds; `jobs queue show`
  lists what awaits review, highest score first; `jobs review --decision approved|skipped --reason`
  records Nick's decision, an approval keeping the posting queued for applying.
- **A filtered posting is not settled.** A posting rejected by a hard filter is filtered again on
  every sighting — the filters cost nothing and the preferences change — keeping when it was first
  seen; only scored or reviewed postings are skipped as duplicates.
- **Guardrails are a rule.** `.claude/rules/workflow/job-search.md` (with its Copilot mirror) holds
  the private-data, pacing and Nick-only guardrails in every session.

**Why:** A description is several thousand characters; relaying it through the orchestrating agent
into the CLI and back out to a scorer would cost it twice. Re-checking filtered postings made the
2026-10-04 preference changes — the DC-area hybrid locations and the level-numbered, staff-style and
lead titles — take effect on postings already rejected under the old ones.

**Alternatives considered:** Passing the description through the conversation (twice the tokens).
Re-opening every posting at scoring time (a page view each, on every scoring). Treating filtered
postings as settled (preference changes would never reach them).

---

## 2026-10-04 — Openings are pooled, capped and ranked; `open-card` is a page script

**Decision:** Card-stage survivors are pooled across a run's sources, deduplicated by company and
title, and only the most promising — about 20 per run, ranked by listed compensation at or above the
floor, Easy Apply, title focus and recency — are opened; the rest stay unrecorded and surface again
later. Opening is the `open-card` page script (`jobs page-script open-card --company … --title …`),
which clicks the card and returns the identifier, header, apply link and the lines mentioning
compensation, company size, sponsorship or office arrangement. Each page view is budgeted as its own
command. Embedded Ashby boards are recognized by `ashby_jid`, as embedded Greenhouse boards are by
`gh_jid`.

**Why:** The first full run read 7 sources and found 72 unique survivors among roughly 160 cards —
the card pass rejects little, because titles fit and few cards list compensation — so opening all of
them would spend most of the day's budget and tens of thousands of tokens. Opening 19 cost 25 page
views and caught three compensation rejections the cards had hidden. The click-and-read function was
improvised during that run and is now a tested script; a budget call chained after a failing command
once let a page load unbudgeted, which was corrected at once and is now ruled out by the skill.

**Alternatives considered:** Opening every survivor (budget and tokens). Reading the full detail
pane (`job-detail`) for every opening (about four times the text for the same triage facts; it
remains for when the full description is needed).

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

_Superseded 2026-10-04 by "The agent submits fully verified applications; high scorers skip
review"._

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
