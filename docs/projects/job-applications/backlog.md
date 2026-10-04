# Backlog

The running list of work items, organized by area. Check items off as they land (`[x]`), and add new
items to the appropriate section as they come up. Items are independent unless noted; each lands on
its own branch/PR.

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
- [ ] **Confirm or override at the start of each run.** One-screen summary plus any queued
      learning-loop edits; run as saved, adjust for this run only (recorded on the run's ledger
      entry, never written to the file), or update the saved preferences. (v1)
- [x] **Read LinkedIn's recommendations** (`/jobs/collections/recommended`) in the browser. (v1)
      Landed 2026-10-04: read through the `result-cards` page script; the recommendations page still
      links each card to its posting, so its cards carry identifiers.
- [ ] **Generate and run searches.** Title × keyword combinations derived from the profile, carrying
      LinkedIn's own filters as query parameters, stored in `preferences.yaml`. (v1) The URL builder
      landed 2026-10-03 as `jobs search url` (`src/scripts/job-search/discovery/search-urls.ts`):
      workplaces, posting age, experience levels and Easy Apply applied through LinkedIn's own
      filters, newest first.

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
- [ ] **Track search yield** in the ledger — postings found, and how many scored into the queue —
      and retire searches that stay barren. (v1)
- [ ] **Learn from review.** Record an optional short reason with each approve or skip, and
      periodically propose individual `preferences.yaml` edits from the reasons and yields. (v1)

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

- [x] **Derive the profile digest.** A cli command that condenses `src/documents/resume/fixtures/`
      into the compact summary the scoring agent reads (roles, competencies with years and
      proficiency). Landed 2026-10-03 as `jobs profile digest`.
- [ ] **Add the `job-screener` agent** under a new `.claude/agents/` directory: Sonnet, structured
      output (score, dimensions, dealbreakers, gaps, flags, rationale), instructed to flag
      label-versus-text contradictions. Thresholds read from `preferences.yaml`.
- [ ] **Derive title variants in setup.** Title matching is word-based, so `frontend` does not match
      `Front-End` and `senior` does not match `Sr.`; since the include list is a hard filter, setup
      should write the spellings and abbreviations of each title it derives.
- [ ] **Add the orchestrating skill** under `.claude/skills/`, sequencing discover → filter → score
      → review → apply. Treat any non-JSON output, or an exit code other than 0 or 2, from a
      `pnpm --silent jobs …` call as an error: argument errors are printed by the CLI framework
      before a command runs.
- [ ] **Add the guardrail rules** — human submit, no invented answers, stop on a challenge, human
      pace — under `.claude/rules/`, with their Copilot mirrors per the parity convention.

## Browser

- [x] **Add the `job-search-browser` server** to `.mcp.json`, with `--userDataDir` at
      `${HOME}/job-search/profiles/chrome`, and a README in `~/job-search/` explaining it. Landed
      2026-10-03, with usage statistics and CrUX lookups turned off; `~/job-search/README.md`
      created.
- [ ] **Detect a logged-out session** and stop the run with a request to log in manually in the
      job-search window.
- [ ] **Fill LinkedIn Easy Apply forms**, stopping before Submit. (v1)
- [x] **Classify external postings by applicant tracking system.** Resolve the Apply button's
      redirect target and map its host to a system (`boards.greenhouse.io`, `jobs.lever.co`,
      `jobs.ashbyhq.com`, `myworkdayjobs.com`, …), deterministically. (v1) Landed 2026-10-04 in
      `src/scripts/job-search/discovery/apply-systems.ts`, unwrapping LinkedIn's `safety/go`
      interstitial; triage resolves `unresolved` from the posting's `applyUrl`.
- [ ] **Prepare an answer packet for external postings** — drafted answers, the resume path, derived
      experience figures and the link — so a manual application takes minutes. (v1)

## Resume

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
      it in the guardrail rules. (v1) The deny rules landed 2026-10-03; the rule statement lands
      with the guardrail rules in stage 4.
- [ ] **Use the approved resume when applying.** Show it in the start-of-run summary (noting, as
      information only, when resume content has changed since approval); block filling without one;
      verify the copy's hash against the manifest before attaching; record the hash on each
      application; on Easy Apply, upload only when it differs from the last one sent. (v1)

## Cover Letters

- [ ] **Draft cover letters** where the form requires one, or offers one and the posting scored 80
      or above, from the description, profile digest, fit rationale and `voice.md`; cite the role or
      project behind each claim; save as Markdown in the posting's packet. (v1)
- [ ] **Render cover letters to PDF** for upload fields, reusing the headless-Chrome approach of
      `pnpm resume:generate`. (v1)

## Future Improvements

Beyond v1. Each was considered and deliberately deferred; see [decisions.md](./decisions.md).

- [ ] **Fill Greenhouse, Lever and Ashby forms**, stopping before Submit. Greenhouse's public
      job-board API returns a posting's questions, so answers can be drafted before the browser
      opens. (v2)
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
- [ ] **Attach to a normally launched job-search Chrome.** A `pnpm jobs:browser` command that opens
      the dedicated profile as an ordinary Chrome window with a local debugging port, and a
      `--browserUrl` server entry that attaches to it — so the window is not in test-automation
      mode, which sets `navigator.webdriver` for every site and blocks Google sign-in.
