# Backlog

The running list of work items, organized by area. Check items off as they land (`[x]`), and add new
items to the appropriate section as they come up. Items are independent unless noted. v1 was built
on one PR (#5), squash-merged into `master` on 2026-10-05; later items land on their own PRs.

## Configuration

- [x] **Resolve the private data directory.** Read `JOBS_DATA_DIR` from `.env.local` through the
      typed environment config in `src/environment/`, and refuse to run when it is unset, missing,
      or resolves to a path inside the repository. Landed 2026-10-03:
      `src/scripts/job-search/data-directory.ts` asks git whether the location (or its nearest
      existing ancestor) lies inside any repository, so worktrees, other checkouts and symbolic
      links are all caught; a missing directory is created only when the caller asks.
- [x] **Define the preferences schema.** A zod schema in the repository for the private
      `preferences.yaml`, split into `hard` and `soft` sections per the 2026-10-02 decision in
      [decisions.md](./decisions.md). Landed 2026-10-03 in
      `src/scripts/job-search/schemas/preferences.ts`; fields with defaults are never asked for, and
      the current employer is a required field, never derived from the public career content.
- [x] **Define the canned-answers schema.** A zod schema for the private `answers.yaml`. Landed
      2026-10-03 in `src/scripts/job-search/schemas/answers.ts`: contact, links, work authorization,
      availability, compensation target, self-identification (declined by default), and a `custom`
      list grown from halted questions. Shape approved 2026-10-03.
- [x] **Configure a mailing address and a start date.** A concrete address for forms that ask for
      one, distinct from the general location a form's location question is answered with, and the
      date available as `immediately`, a span (`2 weeks`, `1 month`) or a date, worked out on the
      day a form is filled. Landed 2026-10-04 in `contact.address` and `availability.start`.
- [x] **Implement the hard filters.** Title include/exclude, workplace and locations, compensation
      floor with the unlisted policy, sponsorship, posting age, employee-count band with the unknown
      policy, and the fuzzy-matched company block list. Landed 2026-10-03 in
      `src/scripts/job-search/triage/hard-filters.ts`, staged: a fact a result card does not publish
      is deferred at `card` and decided by its policy at `detail`. A range in a currency other than
      the floor's is treated as unlisted.

## Discovery

- [x] **Run setup when `preferences.yaml` is missing.** Derive titles, keywords, stack and seniority
      from `src/documents/resume/fixtures/`; ask only for the compensation floor, workplace,
      locations, sponsorship and companies to avoid; write the file after approval. (v1) The
      machinery landed 2026-10-03: `jobs config status|write` for both configuration files and the
      setup procedure in `.claude/skills/job-hunt/SKILL.md`, which also covers `answers.yaml` —
      contact and links from the public profile fixture, work authorization, notice period and
      target compensation asked once.
- [x] **Ask only for missing fields** when the file fails schema validation, and write the answers
      back. (v1) Landed 2026-10-03: `jobs config status` reports `incomplete` with the paths of
      exactly the missing fields, and `invalid` separately, which the skill reports rather than
      overwrites.
- [x] **Confirm or override at the start of each run.** One-screen summary plus any queued
      learning-loop edits; run as saved, adjust for this run only (recorded on the run's ledger
      entry, never written to the file), or update the saved preferences. (v1) Landed with the run
      commands: `jobs run start --override` records run-only adjustments, and the skill confirms the
      preferences and the approved resume in one summary before each run.
- [x] **Read LinkedIn's recommendations** (`/jobs/collections/recommended`) in the browser. (v1)
      Landed 2026-10-04: read through the `result-cards` page script; the recommendations page still
      links each card to its posting, so its cards carry identifiers.
- [x] **Generate and run searches.** Title × keyword combinations derived from the profile, carrying
      LinkedIn's own filters as query parameters, stored in `preferences.yaml`. (v1) The URL builder
      landed 2026-10-03 as `jobs search url` (`src/scripts/job-search/discovery/search-urls.ts`):
      workplaces, posting age, experience levels and Easy Apply applied through LinkedIn's own
      filters, newest first. Landed 2026-10-04: setup generated the searches, rewritten as query
      phrases once LinkedIn's AI search proved to ignore URL filters.

  ```yaml
  searches:
    - name: senior-frontend-remote
      url: https://www.linkedin.com/jobs/search/?keywords=senior%20frontend%20engineer&f_WT=2&f_TPR=r86400&f_E=4
      origin: generated # generated | manual
  ```

- [x] **Read in two passes.** Apply the hard filters to the data on the result cards first (title,
      company, location, posting age, Easy Apply badge, compensation when shown), and open the full
      description only for the postings that survive. (v1) Landed 2026-10-04: the card pass dedupes
      by fingerprint and needs no identifier; survivors are opened one page view each and read with
      the `job-detail` script; an on-site label in an accepted hybrid city is deferred to the
      description.
- [x] **Track search yield** in the ledger — postings found, and how many scored into the queue —
      and retire searches that stay barren. (v1) Landed 2026-10-04 as `jobs learning report`,
      computed from the ledger; barren searches are proposed for retirement, never retired unasked.
- [x] **Learn from review.** Record an optional short reason with each approve or skip, and
      periodically propose individual `preferences.yaml` edits from the reasons and yields. (v1)
      Landed 2026-10-04: `jobs review` records a reason with each decision, and
      `jobs learning report` proposes preference edits from them and the yields at the end of each
      run.
- [x] **Settle the DC-area hybrid locations.** The hybrid search's rejections were mostly roles in
      Arlington, McLean, Bethesda, Tysons, Reston and other suburbs, which `Washington DC` does not
      match. Nick to decide which belong in `hard.locations`. Settled 2026-10-04: hybrid anywhere
      within about an hour of DC; 38 city-and-state locations added.
- [x] **Settle the level-numbered and staff-style titles.** "Software Engineer III" and "Software
      Engineer 3" (often senior), and "Member of Technical Staff" (senior at many AI companies) are
      rejected by the title filter, while the include term `staff engineer` admits "Staff Backend
      Engineer" and "Member of Technical Staff, Forward Deployed Engineer". Nick to decide. Settled
      2026-10-04: Software Engineer III/3/IV/4, Software Development Engineer III, Member of
      Technical Staff, Tech Lead, Technical Lead and Lead Engineer added; `staff engineer` kept.
- [x] **Rank the openings deterministically.** The pooling, deduplication and ranking of card
      survivors were done by the agent in a scratch file; a `jobs triage` mode that pools a run's
      card survivors and returns them ranked would make the cap and the order reproducible. Landed
      2026-10-04: `jobs triage --stage card` pools survivors and `jobs pool next` ranks them.

## Deterministic Commands

- [x] **Add a `jobs` command group to cli-v2.** Commands under `src/scripts/cli-v2/commands/`,
      registered in `src/scripts/cli-v2/cli.ts`, following `ContentSyncCommand`: hard filters,
      dedupe against the ledger, the daily budget and cooldown checks, and ledger reporting. Landed
      2026-10-03: `jobs run start|finish`, `jobs budget take`, `jobs triage`, `jobs profile digest`
      and `jobs resume approve`. Agent-facing commands extend `JsonCommand` and are called as
      `pnpm --silent jobs …`.
- [x] **Define the ledger schemas and store.** Zod schemas for posting, run and budget records, a
      storage port modeled on `ContentStore` in `src/database/content/`, and a YAML adapter over
      `JOBS_DATA_DIR/ledger/`, with deduplication on the LinkedIn job ID and the company-and-title
      fingerprint. Landed 2026-10-03 in `src/scripts/job-search/ledger/`: atomic writes, validation
      on read and write, iCloud placeholders and conflict copies reported as skipped, and the
      cooldown in its own `cooldown.yaml`, since a cooldown outlasts the day it starts on.
- [x] **Enforce the daily budget.** A command the agent calls before every LinkedIn page load,
      checking `limits` against the ledger's daily counters and any active cooldown; record a
      cooldown when a run reports a challenge. Landed 2026-10-03 as
      `jobs budget take page-view|easy-apply-fill`; a page view blocks until the randomized delay
      since the previous one has passed.
- [x] **Derive "years of experience with X" answers deterministically.** From roles and competencies
      in `src/documents/resume/fixtures/`, alongside the existing `calculate-experience.ts`, so the
      model never estimates them. Landed 2026-10-03 in
      `src/scripts/job-search/profile/experience.ts` and the digest: months from the union of the
      dates of every role listing the competency, rounded to years, with a competency's stated
      `experience` taking precedence.

## Agent, Skill and Rules

- [x] **Store the posting text for scoring.** Discovery reads only the facts the detail stage needs;
      the scoring agent needs the description. Either record the description when a posting is
      opened (`job-detail` returns it, at about four times the text) or re-open pending postings at
      scoring time (a page view each). Landed 2026-10-04: saved through the browser server to
      `build/job-search/` and moved into the ledger by `jobs posting describe`.
- [x] **Derive the profile digest.** A cli command that condenses `src/documents/resume/fixtures/`
      into the compact summary the scoring agent reads (roles, competencies with years and
      proficiency). Landed 2026-10-03 as `jobs profile digest`.
- [x] **Add the `job-screener` agent** under a new `.claude/agents/` directory: Sonnet, structured
      output (score, dimensions, dealbreakers, gaps, flags, rationale), instructed to flag
      label-versus-text contradictions. Thresholds read from `preferences.yaml`. Landed 2026-10-04
      in `.claude/agents/job-screener.md`, recording through `jobs score record`.
- [x] **Derive title variants in setup.** Title matching is word-based, so `frontend` does not match
      `Front-End` and `senior` does not match `Sr.`; since the include list is a hard filter, setup
      should write the spellings and abbreviations of each title it derives. Landed 2026-10-04 the
      other way round: title matching normalizes spellings on both sides, so setup need not write
      each variant.
- [x] **Add the orchestrating skill** under `.claude/skills/`, sequencing discover → filter → score
      → review → apply. Treat any non-JSON output, or an exit code other than 0 or 2, from a
      `pnpm --silent jobs …` call as an error: argument errors are printed by the CLI framework
      before a command runs. Landed as `.claude/skills/job-hunt/`, now through applying, with an
      Unattended Run section.
- [x] **Add the guardrail rules** — submitting only verified applications, no invented answers, stop
      on a challenge, human pace — under `.claude/rules/`, with their Copilot mirrors per the parity
      convention. Landed 2026-10-04 in `.claude/rules/workflow/job-search.md` and its Copilot
      mirror.
- [ ] **Run the job hunt on a schedule.** Decided 2026-10-04: on demand for now. The three ways to
      start a run — on demand, a schedule inside a session, and a macOS LaunchAgent running
      `claude -p` headlessly — are written up in [running.md](./running.md), ready to switch to.

## Browser

- [x] **Add the `job-search-browser` server** to `.mcp.json`, with `--userDataDir` at
      `${HOME}/job-search/profiles/chrome`, and a README in `~/job-search/` explaining it. Landed
      2026-10-03, with usage statistics and CrUX lookups turned off; `~/job-search/README.md`
      created.
- [x] **Detect a logged-out session** and stop the run with a request to log in manually in the
      job-search window. Landed: discovery checks each page's address, and the form reader reports
      `signIn`, which the plan refuses. Since 2026-10-05 it also reports a board's sign-in step and
      an error page in place of the form, which the plan and check refuse.
- [x] **Sign in to LinkedIn automatically**, behind `signIn.automatic`, with the credentials the
      environment variables it names hold in `.env.local`, typed by `jobs linkedin sign-in` so they
      never pass through the agent; without them, Nick signs in by hand. Landed 2026-10-04.
- [x] **Fill LinkedIn Easy Apply forms.** (v1) Landed 2026-10-04 (stage 5b) as one generic form
      reader, planner and filler (`src/scripts/job-search/applying/`), driven step by step through
      `jobs apply start|plan|check|pause|discard`. The first application was filled end to end the
      same day.
- [x] **Fill Ashby and Greenhouse forms** through the same reader, planner and filler as Easy Apply,
      on the employer's form directly. (v1) Landed 2026-10-04 (stage 5b); read and planned against
      live Ashby and Greenhouse forms, and Greenhouse's comboboxes and location typeahead filled
      live.
- [x] **Fill Workday and BambooHR forms** once Nick has signed in or created the account
      (`jobs apply start --account-approved`). (v1) Read and planned 2026-10-04; the first Workday
      application filled through three of its six steps on 2026-10-05, which brought its search
      prompts, question dropdowns and drop-zone uploads.
- [x] **Submit verified applications unattended.** Under `applying.submit: verified` the agent
      clicks Submit once, only when every planned value and the approved resume were seen in the
      form and nothing blocks it, and reads the confirmation; anything else is deferred to one held
      list (`jobs apply defer|held`), with an answer packet where the board needs an account. (v1)
      Landed 2026-10-04.
- [ ] **Submit the first applications end to end** from the attached browser, one each on Ashby,
      Greenhouse and Workday, to confirm the resume upload, the review-step check and the
      confirmation reading against live forms, and that the spam rejection does not recur. (v1) Easy
      Apply was filled end to end on 2026-10-04 and submitted by Nick. The first Ashby submission
      was rejected as spam from the automation-mode browser, which led to attaching to a normally
      launched one. The first Workday application was filled through three of its six steps on
      2026-10-05 and stopped when its session expired.
- [x] **Read and check forms in the browser from the CLI.**
      `jobs apply plan|check --page <part of     the address>` installs the form tools and reads the
      form over the DevTools protocol, so neither the reader script nor the page text passes through
      the agent; a form that renders late is waited for. Landed 2026-10-06.
- [x] **Catch what the first live run missed.** Landed 2026-10-06: questions starred above their
      radio group are required; a check reports the form's validation messages as `invalid`;
      optional questions left empty are listed as `optional`; Ashby's yes-or-no checkbox pairs are
      one question; phone numbers and combobox values compare as the form formats them; and a resume
      the form shows by name after taking it counts as attached.
- [ ] **Fill with trusted input from the CLI.** Ashby keeps its own form state and does not reliably
      register values set by script: three of four Ashby submissions were refused once with "Missing
      entry for required field" until the field was retyped or clicked through the browser server. A
      `jobs apply fill --page` that types through the DevTools protocol's `Input.insertText` and
      clicks with `Input.dispatchMouseEvent` would make every fill trusted.
- [ ] **Answer more screening questions from the data.** Most deferrals in the first live run were
      yes-or-no experience questions ("built production front ends with React?", "designed
      PostgreSQL schemas?"), which the profile digest could answer when every named technology is in
      it; "comfortable working remotely?" from the workplace preferences; and "current company" from
      the current employer.
- [ ] **Surface a whole application's questions at once.** A deferral stops at the first step with a
      question only Nick can answer, so later steps' questions reach him on later runs.
- [ ] **Tell uploads of the same name apart.** Easy Apply lists every upload of
      `Nick-Florin-Resume.pdf` under that name; the check should confirm the selected one is the
      upload just made (its date), not merely that its name matches.
- [ ] **Read the submission result through the CLI**, as plan and check do, and report the dialog's
      primary button, so the agent pastes no scripts and takes fewer snapshots.
- [ ] **Find an embedded Ashby board's address** from the page's Ashby embed script when no link
      names the job, rather than guessing the company's slug.
- [ ] **Score the recommendations' postings.** The first live run's learning report shows the
      recommendations source with eight found and none scored.
- [ ] **Fill controls the reader reports as unsupported** — button-group yes/no questions,
      `aria-haspopup="listbox"` buttons, rich-text editors — as live forms show which occur. Until
      then a form with one is stopped and reported. Ashby's yes-or-no buttons landed 2026-10-04;
      Workday's listbox buttons, labelled by a `label[for]` or a fieldset legend, its search prompts
      and its drop-zone uploads on 2026-10-05. Rich-text editors remain.
- [x] **Install the form tools once per page.** The first reading installs the reader, prober,
      chooser, filler and file-input revealer on the page, and every later call is one line, rather
      than about 20 KB of script per step; readings go to a file the plan and check delete, rather
      than through the conversation. Landed 2026-10-05.
- [x] **Classify external postings by applicant tracking system.** Resolve the Apply button's
      redirect target and map its host to a system (`boards.greenhouse.io`, `jobs.lever.co`,
      `jobs.ashbyhq.com`, `myworkdayjobs.com`, …), deterministically. (v1) Landed 2026-10-04 in
      `src/scripts/job-search/discovery/apply-systems.ts`, unwrapping LinkedIn's `safety/go`
      interstitial; triage resolves `unresolved` from the posting's `applyUrl`.
- [x] **Prepare an answer packet for external postings** — drafted answers, the resume path, derived
      experience figures and the link — so a manual application takes minutes. (v1) Landed
      2026-10-04 as `jobs packet build`, with answers from `jobs answers resolve`.

## Resume

- [x] **Run resume generation through the CLI.** Move `pnpm resume:generate` (and its `--steps`
      variants) onto the cli-v2 engine as a command such as `pnpm cli resume generate`, so that
      generating a resume and approving it with `pnpm cli jobs resume approve` happen through the
      same CLI, with its prompts, styled output and exit codes. Landed 2026-10-04 as
      `pnpm cli resume generate --step …`; the `resume:generate*` scripts call it.
- [x] **Write a provenance sidecar from `resume:generate`.** Landed 2026-10-03 in
      `src/scripts/generate-resume/provenance.ts`. The source state (commit, and the uncommitted
      files under the resume source paths) is captured when the HTML is emitted, written beside the
      HTML directory, and carried into each PDF's sidecar with the PDF's hash, because the PDF step
      prints whatever HTML is on disk. HTML with no record yields a PDF with no sidecar, which reads
      as a draft; a git failure warns rather than failing generation.
- [x] **Add `jobs resume approve`.** Interactive only: list the build PDFs, require an explicit
      choice, open it for inspection, confirm; flag a dirty-tree PDF and require its file name typed
      to proceed; copy it to `JOBS_DATA_DIR/resume/` under a clean name with a manifest of source,
      provenance and hash. (v1) Landed 2026-10-03; approved copies are also archived by hash under
      `resume/archive/`.
- [x] **Keep approval human-only.** Deny the command to agents in `.claude/settings.json`, and state
      it in the guardrail rules. (v1) The deny rules landed 2026-10-03, and the rule statement with
      the guardrail rules on 2026-10-04.
- [x] **Use the approved resume when applying.** Block filling without one; verify the copy's hash
      against the manifest before attaching; record the hash on each application. (v1) Landed
      2026-10-04: `jobs apply start` stages a verified copy per application, and an application is
      marked filled only once the form shows the approved resume attached. It is uploaded to every
      application rather than only when it differs from the last one sent, because Easy Apply
      preselects Nick's newest upload, whose content cannot be checked.
- [x] **Show the approved resume in the start-of-run summary**, noting, as information only, when
      resume content has changed since approval. Landed 2026-10-04: `jobs run start` reports it,
      with the resume sources changed since it was generated.
- [x] **Enforce the new-account policy when applying.** Before filling a form on a path whose
      `AccountRequirements` entry is `yes` or `unknown`, stop under `ask` and wait for Nick; under
      `never`, leave the application as a packet for him. (v1) Landed 2026-10-04 in
      `jobs apply start`, which refuses such a posting unless Nick approved the account
      (`--account-approved`).

## Cover Letters

- [x] **Draft cover letters** where the form requires one, or offers one and the posting scored 80
      or above, from the description, profile digest and fit rationale; cite the role or project
      behind each claim. (v1) Landed 2026-10-04: the `cover-letter-writer` agent saves each draft,
      with its citations, through `jobs cover-letter save`; Nick approves it with
      `jobs cover-letter approve`, which agents are denied, before it is attached anywhere. The
      agent matches the samples in `voice.md` when there are any, and writes plainly until then;
      adding them is the open item below.
- [x] **Render cover letters to PDF** for upload fields, reusing the headless-Chrome approach of
      `pnpm resume:generate`. (v1) Landed 2026-10-04: `jobs apply start` renders an approved letter
      beside the staged resume.
- [ ] **Add `voice.md`**, samples of Nick's own writing, to the data directory, so that drafts sound
      like him rather than like a plain default. Nick supplies the samples;
      `jobs cover-letter     context` already passes them to the writer once the file exists.

## Future Improvements

Beyond v1. Each was considered and deliberately deferred; see [decisions.md](./decisions.md).

- [ ] **Fill Lever forms** through the same reader, planner and filler. Greenhouse's public
      job-board API returns a posting's questions, so answers could likewise be drafted before the
      browser opens. (v2) Ashby and Greenhouse moved into v1 on 2026-10-04 and landed the same day;
      Lever stays here.
- [ ] **Discover from a company watchlist.** Read the public job-board APIs of Greenhouse, Lever and
      Ashby for a list of named companies, with plain HTTP from the cli and no browser — no LinkedIn
      activity, full descriptions, often earlier than LinkedIn, and the system is known in advance.
- [ ] **Discover from LinkedIn job-alert emails.** Read the daily alert emails instead of browsing
      searches. Needs a mail connector, which is not connected; alert emails carry only a handful of
      postings, and the details still need the browser.
- [ ] **Migrate the ledger to a database.** A second adapter behind the ledger's storage port, when
      scale or reporting needs justify real queries. Where the database lives (the public schema
      cannot carry these models) is part of that work.
- [ ] **Named resume versions** (e.g. `frontend`, `full-stack`, `ai`), each approved separately,
      with the scoring agent choosing one per posting and yield tracked per version. Needs a variant
      mechanism in the resume-generation pipeline (`docs/projects/resume-generation/`), designed
      from the roles review decisions show are actually pursued.
- [ ] **Per-posting generated resumes** — competencies and bullets selected and reordered for each
      description. The largest build, and a new document to review with every application; worth
      revisiting only if named versions prove too coarse.
- [ ] **A fixed extraction script for LinkedIn result pages.** A JS extractor run in the page
      through the browser server, returning candidate JSON without a model reading the snapshot —
      faster, and free per page. Deferred until real sessions show which fields LinkedIn's
      obfuscated markup keeps stable; the agent-read snapshot stays as the fallback when the
      extractor's output fails the candidate schema.
- [x] **Attach to a normally launched job-search Chrome.** A `pnpm jobs:browser` command that opens
      the dedicated profile as an ordinary Chrome window with a local debugging port, and a
      `--browserUrl` server entry that attaches to it — so the window is not in test-automation
      mode, which sets `navigator.webdriver` for every site and blocks Google sign-in. Moved into v1
      and landed 2026-10-04 as `jobs browser launch|status`, after Ashby rejected the first agent
      submission from the automation-mode window as possible spam.
