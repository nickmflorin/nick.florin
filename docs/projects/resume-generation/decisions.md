# Decision Log

Every non-trivial decision made on this project gets an entry here, newest first. Each entry records
the decision, the date, the reasoning, and any alternatives that were rejected. This is the file to
consult before re-opening a settled question.

Format:

```
## YYYY-MM-DD — Short decision title

**Decision:** What was decided.
**Why:** The reasoning.
**Alternatives considered:** What was rejected and why (omit if none).
```

---

## 2026-08-02 — New-model naming: `Competency`, `Role`, `Degree`

**Decision:** The new parallel models are named as follows: the successor to `Skill` is
**`Competency`** (plural "competencies" — from here on, project discussion says "competencies", not
"skills", when referring to the new modeling); the successor to `Experience` is **`Role`**; the
successor to `Education` is **`Degree`**.

**Why:** The old and new models must coexist during the parallel period, so the new names cannot
collide with existing Prisma models. `Competency` reads naturally in schema and prose, collides with
nothing in either repo, and is semantically broader than `Skill`, fitting the added configurability.
`Role` and `Degree` are already the names of resume-gen's presentation types, so this aligns the two
vocabularies.

**Alternatives considered:** `Capability` (overloaded in software contexts) and `Expertise` (awkward
as a countable row) for the `Skill` successor; `Proficiency` was unavailable — resume-gen already
uses it for the familiarity-bucket enum (`FAMILIAR | PROFICIENT | ADVANCED | EXPERT`).

## 2026-08-02 — Schema/implementation work deferred until research phase concludes

**Decision:** No new Prisma models or implementation work yet, even though resume-gen's
`docs/content-model.md` contains a paste-ready target schema. Research and discussion items (repo
structure, Astro vs. React, PDF pipeline, `Detail.shortDescription`, sync design, LinkedIn
feasibility) are tracked as first-class tasks in the Research & Discussion section of
[backlog.md](./backlog.md) and are worked first: research → written recommendation → discussion with
Nick → decision recorded here. Nothing is decided unilaterally.

**Why:** We are laying groundwork. Several of the open questions (notably repo structure and
`Detail.shortDescription`) change the shape of the schema and the codebase layout; implementing
before they are settled would bake in guesses.

## 2026-08-02 — Project context lives in `docs/projects/resume-generation/`

**Decision:** All persistent working context for this project (status, decisions, codebase maps,
open questions) lives in this repo under `docs/projects/resume-generation/`, committed to git.
(Originally created as a top-level `resume-generation-project/` folder, moved under `docs/projects/`
the same day.)

**Why:** The project spans many sessions over a long period. Context in the repo is versioned,
visible to both the developer and AI sessions, and survives any single conversation. Living under
`docs/` keeps it alongside the repo's other human-readable documentation.
