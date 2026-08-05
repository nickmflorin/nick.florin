# Data Management in Resume Generation Project

The purpose of this document is to outline the next phase of the resume generation project in this
repository. This phase will be responsible for establishing the Prisma ORM models for the new
modeling schema and developing the script capabilities and functionality that will make it easy to
iterate on the content of the resume, website and LinkedIn profile while still being able to
translate that content to and from database storage.

In Scope:

- Establishing Prisma models for new schema structure and polishing those models with additional
  fields, additional models, etc. in order to fully support a flexible data management flow that can
  be used to syndicate across all mediums.
- Figuring out how the data should be represented in a way that allows Claude to easily iterate on
  the content while also allowing that content to be updated deterministically with scripts that
  read from the database and also scripts that read the content to update the data IN the database.
  I'm not sure yet how we should represent this data, yaml, json, etc. - we will work on that
  together.
- Developing a feature rich script CLI that will allow us to migrate data between the forms and is
  capable of informing us of exactly what is changing at any given point in time. For now, this will
  just be a simple script that takes args - eventually, it may be a more advanced CLI - but that is
  out of the scope for the time being.

  The script should be able to

  - Update fixture data/files based on data in the development database (locally).
  - Update fixture data/files based on data in the production database (locally).
  - Update the development database with fixture data in its current state (locally).
  - Update the production database with fixture data in its current state (locally).
  - Correlate relationships between the data models based on slug, to understand when existing data
    is being updated vs. new data is being added.
  - Display all updates to existing data as terminal styled git-style diffs that make it easy to see
    what is changing. In many cases, we need to explore whether or not changes to existing data
    should be explicitly confirmed before allowing to be written to the database.
  - Displaying all content that will be deleted as a result of the migration in ANY direction. In
    other words, if we are updating the prod database, or we are updating the fixture file, what
    content is being removed wholesale.
  - Develop a system that allows us to avoid hard deleting of content but instead hiding visibility
    under certain conditions.
  - Consider versioning fixture file content based on date and time so we have a record of what
    changed making it easier to go back in time and recover lost data (tentative).

  All data into and out of the database and into and out of the fixture data should be validated
  using zod schemas. The system should have a way to fail hard without committing any data if it
  detects certain anamolies like duplicate slugs, things like that.

  Data cleaning processes should allow cleanup of data in cases where the data relationships cannot
  be validated via the database models / postgres alone. For instance, if a given content item has
  no syndication mediums, it should just be more simply set to isVisible: false. Things like that,
  outputting warnings when it is stumbling into these things.

Out of Scope:

- Updating the core (site) application in any way. This means that we will not be updating the core
  application to be using the new Prisma models at all, and the (site) UI and components will be
  left entirely untouched (at least as it pertains to the data sourcing, we may do some other
  cleanup along the way but you should not modify this part of the application unless I instruct you
  to do so or you confirm with me first).
- Migrating data from the old schema models to the new schema models. Leave them alone for now, in a
  sandbox that is only used for resume generation in the PDF and HTML forms.

## Approach

To start, let's keep this simple. Let's not worry about the bells and whistles of the CLI yet - and
focus on the core functionality and mechanics that a script would expose as a v1 prototype and the
modeling/scaffolding necessary for this to work.

This is what I am thinking in terms of sequencing (reordered 2026-08-04 so the YAML definitions come
first, ahead of any Prisma work):

1. ~~Research, discuss and decide on an approach for data storage in fixture files that is amenable
   to reading and writing programatically, iterating on with Claude, and being easy to read and
   modify as a human. Mark the decision.~~ Done 2026-08-04: YAML, one file per model, authoring
   shape — see [decisions.md](./decisions.md).
2. ~~Establish the data fixture files in their new forms, maintaining the old data folder for
   backwards compatibility, so resume generation remains in tact but we have a parallel definition
   for data.~~ Done 2026-08-04: the YAML fixtures live in `src/documents/resume/fixtures/`, emitted
   from the TS data modules by `pnpm resume:fixtures` (`src/scripts/emit-resume-fixtures.ts`). Until
   the sync tooling lands, the data modules remain the operative source and parity is maintained by
   regenerating. Still open from this step: update all context, skills, etc. to instruct ai agents
   to maintain parity between the two when we are adding, removing or modifying content in the
   interim.
3. ~~Fine tune the models in the current resume type generation (types.ts) and generate the initial
   Prisma schema model definitions for those models, establishing data migrations for them as
   well.~~ Done 2026-08-04: the parallel models and enums are in `schema.prisma`, migration
   `20260804145452_parallel_content_models` is applied to the dev database, and the legacy `Degree`
   enum became `DegreeType` (see decisions.md).
4. DO NOT DELETE THE types.ts file and the fixture data until we are fully migrated to the Prisma
   models. The resume generation via the current script still needs to function based on the data
   fixtures as they exist today - so we will again be doing this in parallel.
5. Developing the systems, scripts and parsing/validation logic that will support the data transfer
   to and from the fixture files into and out of the database. This will involve the scripts, the
   Prisma operations, the zod schemas, the parsing/validating, the ability to recognize whether or
   not we are updating and/or deleting content, etc. For now - keep this simple - just stdout log
   cases where we are modifying content or deleting content.
6. Hold for further consideration and discussion.
