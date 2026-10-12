# Project Status

_Last updated: 2026-10-11_

## Phase

**v1 is built and in live use (from 2026-10-06).** Design (2026-10-02 to 2026-10-03) settled all ten
questions, recorded in [decisions.md](./decisions.md); the v1 build merged to `master` as PR #5 on
2026-10-05; the first live runs on 2026-10-06 submitted eleven applications unattended, and the
fixes they prompted are in PR #6 (`job-applications/live-runs`), open.
[open-questions.md](./open-questions.md) is empty.

## Done

- 2026-10-02: Project folder created; registered in `docs/index.md`. Decided: the tooling is
  committed here with personal data outside the repository; a human submits every application;
  external applications are staged by applicant tracking system; private data lives in iCloud Drive;
  preferences split into hard filters and soft signals; Claude derives the searches and learns
  preferences from review.
- 2026-10-03: Stage 1 (foundations) written on `job-applications/foundations`: `JOBS_DATA_DIR` in
  the typed environment, the data-directory resolver and its outside-every-repository guard, the
  preferences, answers and ledger schemas, the ledger storage port and YAML adapter, and unit tests
  for each under `src/__tests__/unit/scripts/job-search/`. Verified the same day: `tsc`, ESLint and
  cspell clean, all unit suites passing, and the configured `JOBS_DATA_DIR` resolved end to end
  against the real environment. The `answers.yaml` shape was approved.
- 2026-10-03: Stage 1 opened as draft PR #5. Stage 2 (deterministic commands) written on the same
  branch: hard filters and triage, the daily budget with pacing and cooldowns, run start and finish,
  the profile digest with derived years of experience, resume provenance captured at HTML emission
  and carried into each PDF, `jobs resume approve`, and deny rules keeping approval from agents.
  `tsc`, ESLint and cspell clean; all 23 unit suites (272 tests) pass; `jobs profile digest`, the
  JSON error path and a full `resume:generate` run verified against the real environment.
- 2026-10-03: Decided: the data folder moves to `job-search/ai/`; setup fills only missing fields
  and each run confirms or overrides; fit scoring by a Sonnet agent with tunable thresholds; daily
  limits and pacing enforced by the cli; the ledger is YAML files behind a storage port; a dedicated
  Chrome profile at `~/job-search/profiles/chrome`; cover letters only where the form asks; v1
  attaches one explicitly approved resume. Phase 0 complete.

## In Progress

- The first Workday application, filled through its first three steps under the attached browser and
  stopped when the board's session expired; it resumes once Nick signs in there again.
- PR #6 is open and has not been through `tsc`, Jest, ESLint or cspell; those run before it merges.

## Next

The v1 build, in dependency order (items in [backlog.md](./backlog.md)):

1. **Foundations** — done 2026-10-03.
2. **Deterministic commands** — done 2026-10-03.
3. **Browser, setup and discovery** — done 2026-10-04, split so nothing touched LinkedIn before the
   preferences existed:
   - 3a — done 2026-10-03: the `job-search-browser` server, `~/job-search/` and its README, and
     `jobs search url`.
   - 3b — done 2026-10-03: the setup machinery, and the setup itself, run with Nick, which wrote
     `preferences.yaml` (with generated searches, rewritten as query phrases on 2026-10-04) and
     `answers.yaml` to the private data directory.
   - 3c — done 2026-10-04: a full discovery run (run `2026-10-03-2`) read the recommendations and
     all six searches, pooled 72 unique card survivors, opened the 19 most promising, and recorded
     16 postings as pending their score (8 Easy Apply, 3 Ashby, 2 Greenhouse, 1 Workday, 2 other)
     and 11 rejections; the day used 35 of 120 page views.
4. **Judgment and orchestration** — done 2026-10-04: the 16 pending postings were described (16 page
   views) and scored by four parallel `job-screener` agents (7 queued, 9 maybe, after one re-score);
   Nick reviewed the queue, approving 15 and skipping Ladders as an account funnel, which led to the
   blocked-sites filter and the `applying.newAccounts` policy.
5. **Applying** — in progress.
   - 5a — done 2026-10-04: `jobs answers resolve|add`, `jobs packet build`,
     `jobs application filled|submitted`.
   - 5b — written 2026-10-04: a live Easy Apply walkthrough of an approved posting, discarded at the
     review step, then the generic form reader, planner and filler, the verified draft that gates
     `jobs application filled`, per-application resume staging, and
     `jobs apply start|plan|check|pause|discard`. The reader and planner were run against live Ashby
     and Greenhouse forms, and Greenhouse's comboboxes and location typeahead were filled live;
     nothing was submitted. The same day, the first Easy Apply application was filled end to end
     under run `2026-10-04-1` — every step planned, filled and verified, the approved resume
     uploaded and seen selected, the follow checkbox cleared — and left on its review step for Nick
     to submit.
   - The same day, after Nick submitted that first application himself, applying became unattended:
     the agent submits fully verified applications under `applying.submit: verified`, defers the
     rest to one held list (`jobs apply defer|held`), and postings scored into the queue are
     approved automatically. Yes-or-no answers no longer answer inverted questions.
   - Later the same day, in one pass: the jobs commands named by noun with an index barrel, and the
     first `tsc`, Jest, ESLint and cspell runs (clean, 412 tests); account-system postings handed to
     Nick with an answer packet and `submitted --by-hand`; sign-in detection; Ashby's yes-or-no
     buttons and embedded boards; the browser server attached to a normally launched Chrome after
     Ashby rejected the first agent submission (deferred) as spam from the automation-mode window;
     title spellings normalized; the approved resume reported at run start; cover letters drafted
     unattended and attached once Nick approves them; and the run pool ranked deterministically.
   - Then: runs stay on demand (the three ways to start one are in [running.md](./running.md));
     automatic LinkedIn sign-in from `.env.local`, behind a setting; a mailing address distinct from
     the stated location, and a start date set as a span or a date; Workday and BambooHR forms read
     and planned.
   - 2026-10-05, from the first Workday application: the form tools are installed on the page by the
     first reading and called in one line after it, and readings travel through a file the plan and
     check delete; fields the form already shows correctly are recorded and checked rather than
     reported unplanned; Workday's search prompts, question dropdowns and drop-zone uploads are read
     and filled; an expired session or an error page is refused rather than planned.
   - 2026-10-06, the first live run (`2026-10-06-1`), over the approved queue: six applications
     submitted by the agent across Easy Apply, Ashby and Greenhouse, with no spam rejection from the
     attached browser; six deferred with questions only Nick can answer; the Workday application
     waits on his sign-in there. The run's fixes are on `job-applications/live-runs`: reading forms
     through the CLI over the DevTools protocol, required-question and validation detection, salary
     as a single figure or a range, self-identification answers with several phrasings, and Ashby's
     and Greenhouse's quirks.
   - Later the same day, after Nick answered the deferred questions (`jobs answers add`), a second
     run (`2026-10-06-2`) re-ran them: five submitted, one closed by the employer. It added an
     answer for "eligible to work without sponsorship", kept the reader on a dialog step with no
     fields, and compared typeahead choices the same way in the planner and the check.
   - Answer policies Nick set while answering the held questions (the values stay in the private
     data directory; the policies are in [decisions.md](./decisions.md)): a voluntary question is
     never declined, a technology he lacks or barely has is answered No, or "limited experience" in
     free text, and salary is a single figure or a range depending on what the form allows.

   What is left, in order:

   1. Run `tsc`, Jest, ESLint and cspell on PR #6, then merge it.
   2. Nick signs in to Workday; the Workday application resumes and, as the first Workday
      submission, stops for his review before Submit.
   3. Fill with trusted input from the CLI, which Ashby needs (three of four Ashby submissions were
      refused once until a field was retyped or clicked through the browser server).
   4. Answer more screening questions from the data, which most deferrals asked.
   5. A discovery run for new postings; the learning report shows the recommendations source with
      eight found and none scored.
   6. `voice.md`, so cover-letter drafts sound like Nick; his decision on rewriting PR #5's history
      does not apply now that it is squashed into `master`.

6. **Learning** — done 2026-10-04: `jobs learning report` (each source's yield, barren searches,
   skip reasons), with proposals put to Nick at the end of each unattended run.
7. **Discovery fixes** — written 2026-10-11 on `job-applications/discovery-fixes`, from problems in
   a live discovery run: `jobs cards read` (read and triage a page's cards in one step, waiting for
   results to render) and `jobs pool open` (open the pooled postings the page in view shows, verify
   each job identifier, triage at the detail stage and attach the text) replace the agent's scratch
   scripts; a company equal to the title is parsed correctly; recommendations are opened by their
   own address so no text is saved for the wrong posting; a run that finished still accepts triage
   unless it ended on a challenge or logout; and the job-detail script reports a posting that no
   longer accepts applications, which the skill checks before taking an `easy-apply-fill` unit. Unit
   tested with a fake page; not yet run against live LinkedIn (see [backlog.md](./backlog.md)).
