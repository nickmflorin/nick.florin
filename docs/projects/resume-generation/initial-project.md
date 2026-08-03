# Resume Generation Project

Goal: Bringing more flexibility and control into how the content of my portfolio is modeled,
presented and distributed through various mediums. Currently, these mediums are as follows:

1. PDF Resume (Distributed file)
2. HTML Resume (Distributed file)
3. Website (This App)
4. LinkedIn Profile (Updated and kept in sync with an API)

The goal here is to bring all of these mediums into a single source of truth, which can be used to
control what content is presented where, the form it comes in, the details of it, how it is
displayed, and how it is distributed.

As a part of this, the effort is intentionally being designed so that we can more easily go between
the production database, a local development database, and fixture-based files that can be used to
automatically iterate on content with Claude without the need to have a full database running. This
would involve the ability to sync data in both local and production databases with a fixture-based
file (or files) containing content that makes up the resume, portfolio and other mediums that are
being distributed to. Similarly, we should easily be able to go from the databases to the fixture
file in the reverse direction.

## Implementation Approach

This is critically important: This is a longer term project that will be implemented incrementally,
completely in parallel, with the existing app's modeling, database and functionality. This project
will primarily involve a re-do of the database modeling to support a form more conducive for these
goals, and we will be building that foundation in parallel to the existing code, establishing the
structure and mechanics of the data management side without focusing on the UI at first. Then, as
things become more stable, we will gradually start relyong on this new structure in the UI and the
content that renders in the app today.

The goal is centralization of all content. That may mean managing two sources of truth for an
intermitten period of time.

## Resume Generation

There is currently a repo, `resume-gen`, that is being used to generate my PDF and HTML forms of the
resume. This repository is currently in the process of being created (it was created yesterday) with
the sole purpose of automating just the resume generation aspect of the project in a separate repo
with the intention of gradually porting that into this application and the processes/scripts this
application holds.

That repo is an Astro app that is lightweight and is designed to be capable of generating the PDF
and HTML form of the resumes that I eventually want this app to be able to generate based on the
data in the database, dynamically.

The types and structure of the content in that repo is _generally_ (not entirely, but a good
starting point) the direction where I want the modeling here to go in. This is evident from the new
types that are used to define the content structure and the various flags such as 'isVisible' and
'isLinkedInVisible' (or a similarly named boolean) that are begining to show how the content will be
flagged and distributed.

Eventually, the goal is for this app to be able to dynamically generate the resume based on the most
up to date content in the database on the fly, when a user clicks a button in the browser. However,
this functionality still needs to be exposed as a script I can execute programatically - especially
one that can rely on updated fixture data in a file that is not stored in the database yet for
purposes of testing and iterating on the content with Claude.

I am not sure how we will be able to incorporate that repo's functionality into this app, since it
is an Astro app and it may mean having to convert the Astro content to React (which will likely make
the most sense) but that is something we will need to explore together.

## Modeling

There will be some changes in terms of how we think about different constructs in this application,
expressed by the updated modeling that we will be implementing.

Since we are doing this in parallel, maintaining parity and functionality of the admin CMS is the
lowest priority - since that is only something I use in the app. Don't mistake this to mean that the
Admin CMS can be left in a broken state - it cannot be, the app still needs to build. It just means
that we can leave the Admin CMS pointing at old data models entirely for now, and we will only
incrementally adopt the new data models in the UI presentational layers that are not being a login
screen when and if we finish the data modeling (new models and structure) and the processes around
that (i.e. generating the resume from the database and/or fixture files) before we start to adopt
the new models in the Admin CMS. The Admin CMS will eventually be updated to use the new models, but
that is not a priority at this time.

## Data Management

The data models should be capable of completely describing how and where the data should be rendered
or distributed at any given point in time. This means that the data models should be able to
describe how to syndicate the content via the LinkedIn API, or how it should be shown in a PDF
resume.

Additionally, we will want to do a better job integrating with external APIs besides LinkedIn, such
as GitHub. We will want to start automating the updating and syncing of content in all of these
mediums that we distribute to based on Claude reading content from GitHub in a non-deterministic way
(i.e. looking for skills that I have obtained over time based on the repositories I have contributed
to) but also in a deterministic way, for instance - to update my LinkedIn profile with projects, or
new job information, or new skills that I have obtained.

## Application Structure

Currently, this is a single NextJS app. We are not using a monorepo, microfrontends, or anything
like that. However, this work _may_ warrant changing or at least reconsidering some of that. Does it
makes sense to have a separate app for the Astro resume generation? I don't know yet - that's what I
need your help with.
