import { json } from "~/database/fixtures";
import type { BrandRepository, BrandSkill } from "~/database/model";
import { type Transaction } from "~/database/prisma";
import { differingFields } from "~/lib/differences";
import { humanizeList } from "~/lib/formatters";
import { type cli } from "~/scripts";
import { stdout } from "~/support";

import { githubClient } from "~/integrations/github";

export async function seedRepositories(tx: Transaction, ctx: cli.ScriptContext) {
  const output = stdout.begin("Generating Repositories...");

  output.begin("Fetching repositories from GitHub...");
  const githubRepositories = await githubClient.fetchRepositories();
  output.complete(`Fetched ${githubRepositories.length} repositories from GitHub.`);

  if (githubRepositories.length !== 0) {
    output.begin(`Processing ${githubRepositories.length} repositories from GitHub...`);
    for (let i = 0; i < githubRepositories.length; i++) {
      const repo = githubRepositories[i];
      output.begin(`Processing GitHub repository ${repo.name}...`);

      let repository: BrandRepository & { readonly skills: BrandSkill[] };

      const filtered = json.repositories.filter(jsonRepo => jsonRepo.slug === repo.name);
      if (filtered.length > 1) {
        throw new Error(
          `Encountered multiple repositories in the JSON fixture data with slug '${repo.name}'!`,
        );
      } else if (filtered.length === 0) {
        output.info(
          `A GitHub repository with name/slug '${repo.name}' does not exist in the JSON fixture ` +
            "data.  Creating a new repository with the data from GitHub's API, setting the " +
            "visibility to false by default.",
        );
        repository = await tx.repository.create({
          include: { skills: true },
          data: {
            slug: repo.name,
            description: repo.description,
            startDate: new Date(repo.created_at),
            createdBy: { connect: { id: ctx.user.id } },
            updatedBy: { connect: { id: ctx.user.id } },
            visible: false,
            highlighted: false,
          },
        });
      } else {
        const existing = filtered[0];
        const differing = differingFields(
          existing,
          { slug: repo.name, startDate: new Date(repo.created_at), description: repo.description },
          ["slug", "description", "startDate"],
        ).filter(d => d.previousValue === undefined);
        if (differing.length !== 0) {
          const humanized = humanizeList(
            differing.map(d => d.field),
            { formatter: v => `'${v}'` },
          );
          output.info(
            `The GitHub repository with name/slug '${repo.name}' exists in the JSON fixture data ` +
              `but the field(s) ${humanized} are not defined and will be supplemented with data from ` +
              "GitHub's API.  Creating the repository with data from both the JSON fixture data " +
              "and data from GitHub's API.",
          );
          repository = await tx.repository.create({
            include: { skills: true },
            data: {
              highlighted: false,
              visible: false,
              ...existing,
              description: existing.description ?? repo.description,
              startDate: existing.startDate ?? new Date(repo.created_at),
              createdBy: { connect: { id: ctx.user.id } },
              updatedBy: { connect: { id: ctx.user.id } },
              skills: { connect: existing.skills.map(skill => ({ slug: skill })) },
            },
          });
        } else {
          output.info(
            `The GitHub repository with name/slug '${repo.name}' does not need to have it's ` +
              "JSON fixture data supplemented with the data from GitHub's API, because the " +
              "fields are the same.  Creating the repository with data from the JSON fixture " +
              "data alone.",
          );
          if (existing.startDate === undefined || existing.description === undefined) {
            /* This should not happen - the associated values from GitHub's API will never be
             undefined - so if the values from the JSON fixture data are undefined, then the array
             of differing fields should not be empty and this block should have never been
             reached. */
            throw new TypeError(
              "Encountered undefined fields for the JSON repository fixture.  This should not " +
                "happen, as the logic previously checked whether or not the fields were " +
                "undefined when comparing to the data from GtiHub's API.",
            );
          }
          repository = await tx.repository.create({
            include: { skills: true },
            data: {
              visible: false,
              highlighted: false,
              ...existing,
              startDate: existing.startDate as Date,
              createdBy: { connect: { id: ctx.user.id } },
              updatedBy: { connect: { id: ctx.user.id } },
              skills: { connect: existing.skills.map(skill => ({ slug: skill })) },
            },
          });
        }
      }
      output.complete("Successfully Processed Repository", {
        lineItems: [
          { label: "Slug", value: repository.slug },
          { label: "Description", value: repository.description ?? "" },
          repository.skills.length !== 0
            ? {
                label: "Skills",
                items: repository.skills.map(sk => ({ label: "Slug", value: sk.slug })),
              }
            : null,
        ],
        count: [i, githubRepositories.length],
      });
    }
    output.complete(`Finished processing ${githubRepositories.length} repositories from GitHub...`);
  }

  /* After processing repositories associated with data from GitHub's API, we have to also process
     repositories that are in the JSON fixture data but not in GitHub's API.  While this is an
     edge case, we still have to account for them.  We could either (a) ignore them, and treat
     GitHub as the source of truth, or (b) create them, and treat the production database as the
     source of truth.  Right now, we are going to favor (b). */
  const unprocessed = json.repositories.filter(
    repo => !githubRepositories.map(r => r.name).includes(repo.slug),
  );
  if (unprocessed.length !== 0) {
    output.begin(`Processing ${unprocessed.length} repositories not found in GitHub...`);
    for (let i = 0; i < unprocessed.length; i++) {
      const repo = unprocessed[i];
      output.begin(`Processing JSON repository ${repo.slug}...`);

      if (repo.description === undefined || repo.startDate === undefined) {
        throw new Error(
          `The repository with slug '${repo.slug}' was not found in GitHub, and is missing ` +
            "required fields required to create the model in the database (which cannot be " +
            "supplemented with data from GitHub's API).",
        );
      }
      const repository = await tx.repository.create({
        include: { skills: true },
        data: {
          ...repo,
          startDate: new Date(repo.startDate),
          createdBy: { connect: { id: ctx.user.id } },
          updatedBy: { connect: { id: ctx.user.id } },
          visible: repo.visible ?? false,
          highlighted: repo.highlighted ?? false,
          skills: { connect: repo.skills.map(skill => ({ slug: skill })) },
        },
      });
      output.complete("Successfully Processed Repository", {
        lineItems: [
          { label: "Slug", value: repository.slug },
          { label: "Description", value: repository.description ?? "" },
          repository.skills.length !== 0
            ? {
                label: "Skills",
                items: repository.skills.map(sk => ({ label: "Slug", value: sk.slug })),
              }
            : null,
        ],
        count: [i, unprocessed.length],
      });
    }
  }
}
