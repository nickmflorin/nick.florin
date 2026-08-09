# Open Questions

Unresolved questions that need discussion before (or during) the corresponding backlog items. When
one is settled, record the outcome in [decisions.md](./decisions.md), clear it here, and unblock the
gated items in [backlog.md](./backlog.md).

## Chart replacement: `Competency` adoption or legacy bucketing?

The bucketed proficiency groups (`ADVANCED`, `EXPERT`, `PROFICIENT`, `FAMILIAR`) live on the new
`Competency` model from the resume-generation project, which the public site does not read yet — the
dashboard chart still consumes the legacy `Skill` model. Does the chart replacement (a) adopt
`Competency` as its data source, making it the first public-site consumer of the new models, or (b)
derive interim buckets from legacy `Skill` data (e.g. thresholds on `calculatedExperience`) until
the site-wide adoption happens? Option (a) is the durable shape but couples this project to
resume-generation's migration sequencing; option (b) ships sooner but bakes in a bucketing that the
real proficiency data will later contradict.

## What exactly are the "tag-only" views?

The intent is views that contain tag-only skills — skills rendered purely as tags, without a
proficiency or experience metric. To scope the backlog item, settle: which skills qualify
(competencies with null `proficiency`? a curated/flagged set?), and where these views appear (a
section of the new skills list page, a dashboard module, resume surfaces, or several of these).
