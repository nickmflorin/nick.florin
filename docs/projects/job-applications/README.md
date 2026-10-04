# Job Applications Project — Working Context

This folder is the persistent working context for the job-applications project: a process — skills,
an agent, rules and deterministic CLI commands — that finds jobs on LinkedIn, decides which ones are
worth applying to against a configured set of preferences, and applies to them unattended, setting
aside for a human whatever it cannot finish from his data. It exists so that any session (human or
AI) can pick up exactly where the last one left off. **Read this file first, then
[status.md](./status.md).** To start a run — on demand, on a schedule in a session, or in the
background — see [running.md](./running.md).

## What This Project Is

Applying to jobs is a long tail of near-identical work: searching, reading descriptions, discarding
the obvious mismatches, and re-typing the same answers into the same forms. Most of it is mechanical
and the rest is judgment that can be written down. The project splits the two: deterministic code
does everything that can be decided by rule, an agent does the fit judgment, and the human makes the
final call on every submission.

```text
discover → hard-filter → dedupe → score fit → review queue → apply → ledger
(browser)  (cli)         (cli)    (agent)     (human)        (agent + human)  (cli)
```

The project's charter:

1. **A preferences config** — titles, seniority, location and remote policy, compensation floor,
   stack, company allow and block lists, dealbreakers — validated by a zod schema.
2. **Canned application answers** — work authorization, sponsorship, start date, compensation
   expectations, voluntary self-identification — so that form questions are answered from data
   rather than composed by the model.
3. **Deterministic `pnpm cli jobs …` commands** on the cli-v2 engine (`src/scripts/cli-v2/`): the
   hard filters, deduplication against the ledger, daily caps and pacing, and ledger reporting.
4. **A fit-scoring agent** (`.claude/agents/`) that scores a description against the preferences and
   the canonical career content in `src/documents/resume/fixtures/`, and explains its score.
5. **A browser driver** — a second `chrome-devtools-mcp` entry in `.mcp.json` driving a dedicated
   Chrome profile at `~/job-search/profiles/chrome`, logged into LinkedIn by hand once. No LinkedIn
   credentials are stored anywhere.
6. **An orchestrating skill** that sequences the pipeline and presents the review queue.

## Ground Rules

These hold regardless of how the open questions resolve.

- **The tooling is public; the data is not.** This repository is public. Everything committed here
  is generic machinery. Preferences, canned answers, the ledger and anything else personal live
  outside the repository and are located through a path in `.env.local`, which is already
  gitignored. Nothing personal is ever written to a tracked file, including test fixtures and
  examples in these docs.
- **Only a fully verified application is submitted unattended.** Under `applying.submit: verified`
  the agent submits an application only when every field was answered from Nick's data and read back
  from the form, and the approved resume was seen attached; anything else is deferred to him. Under
  `applying.submit: nick`, a human clicks Submit. (Revised 2026-10-04; see
  [decisions.md](./decisions.md).)
- **A human approves the resume.** Only a resume explicitly approved through an interactive command
  is ever attached. No agent can approve one, and regenerating the resume never changes what is
  sent.
- **No invented answers.** A form question that cannot be answered from the canned answers or
  derived deterministically from the career content halts that application and returns it to the
  queue with the question attached.
- **Stop on a challenge.** A CAPTCHA, an unexpected login wall, or any account-security prompt ends
  the run.
- **Human pace.** Volume is capped per day and actions are paced, because LinkedIn's User Agreement
  prohibits automated activity and restricts accounts that look automated.

## Files in This Folder

| File                                     | Purpose                                                          |
| ---------------------------------------- | ---------------------------------------------------------------- |
| [status.md](./status.md)                 | Current state: what's done, in progress, and next. Update often. |
| [decisions.md](./decisions.md)           | Decision log. Every non-trivial decision gets an entry.          |
| [backlog.md](./backlog.md)               | Running checklist of work items, organized by area               |
| [open-questions.md](./open-questions.md) | Unresolved questions that need discussion/decisions              |

## Working Conventions for This Project

- **Update as you go.** When a work session makes progress or a decision, update `status.md`,
  `backlog.md` (check items off, add new ones), and (if applicable) `decisions.md` before finishing.
  Stale context is worse than no context.
- **Dates are absolute.** Never write "yesterday" or "last week" in these files.
- **Nothing personal in this folder.** These docs describe the machinery. Preference values, target
  companies, compensation figures and application history never appear here.
