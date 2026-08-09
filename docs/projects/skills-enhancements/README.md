# Skills Enhancements Project — Working Context

This folder is the persistent working context for the skills-enhancements project: improving the
ways skills are displayed, browsed, and discovered in the app. It exists so that any session (human
or AI) can pick up exactly where the last one left off. **Read this file first, then
[status.md](./status.md).**

## What This Project Is

Skills are currently surfaced in three ways on the public site: the dashboard bar chart (Nivo,
plotting `calculatedExperience` in years per skill, defaulting to highlighted skills), skill badges
on project/experience/education cards (click opens the `VIEW_SKILL` drawer), and the resume
documents' `CompetencyBar` proficiency bars. There is no dedicated place to see _all_ skills, no way
to search them, and the headline chart communicates a single metric (years) that undersells how
skills actually differ — by proficiency tier, not just duration.

The project's charter:

1. **Replace the skills bar chart** with a display built around the bucketed proficiency groups —
   `ADVANCED`, `EXPERT`, `PROFICIENT`, `FAMILIAR` (the `Proficiency` enum on the new `Competency`
   model) — rather than a single years-of-experience axis.
2. **Add tag-only skill views** — views where sets of skills render purely as tags, for skills whose
   presence matters but for which a proficiency/experience metric is not meaningful to display.
3. **Build a master skills list page** — a public, searchable page listing every visible skill, used
   to identify and explore skills and jump to their related content.
4. **Add a global search bar** — site-wide search over portfolio content (skills, projects,
   experiences, educations, repositories, courses), not limited to the skills domain.

The proficiency bucketing rides on the resume-generation project's new content models: the
`Competency` model and `Proficiency` enum already exist in the schema (see
`docs/projects/resume-generation/`), but the public site UI still reads the legacy `Skill` model.
How the chart replacement sources its buckets — adopting `Competency` on the site versus deriving
buckets from legacy `Skill` data in the interim — is an open question for Phase 0.

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
- **Items are independent where possible.** The chart replacement, tag-only views, skills list page,
  and global search are separate deliverables; each lands on its own branch/PR unless a shared
  foundation (e.g. adopting `Competency` on the site) forces sequencing.
- **Coordinate with resume-generation, don't fork it.** Anything touching the `Competency` /
  `Proficiency` modeling defers to that project's decisions (`docs/projects/resume-generation/`);
  this project consumes the models, it does not reshape them.
- **The admin CMS is out of scope.** These are public-site surfaces; admin-side counterparts get
  filed as follow-ups, not bundled in.
