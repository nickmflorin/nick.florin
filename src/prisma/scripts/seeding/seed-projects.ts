import { humanizeList, slugify } from "~/lib/formatters";

import { prisma, getUniqueConstraintFields } from "../../client";
import { type Project } from "../../model";
import { json } from "../fixtures/json";

import { findCorrespondingSkills } from "./seed-skills";
import { stdout } from "./stdout";
import { type SeedContext } from "./types";

export async function seedProjects(ctx: SeedContext) {
  if (json.projects.length !== 0) {
    stdout.begin(`Generating ${json.projects.length} Projects...`);
    for (let i = 0; i < json.projects.length; i++) {
      const { skills: jsonSkills = [], ...jsonProject } = json.projects[i];
      let project: Project;
      try {
        project = await prisma.project.create({
          data: {
            ...jsonProject,
            slug: jsonProject.slug === undefined ? slugify(jsonProject.name) : jsonProject.slug,
            createdById: ctx.user.id,
            updatedById: ctx.user.id,
          },
        });
        stdout.info("Successfully Generated Project", {
          lineItems: [
            { label: "Name", value: project.name },
            { label: "Slug", value: project.slug },
          ],
          count: [i, json.projects.length],
        });
      } catch (e) {
        const fields = getUniqueConstraintFields(e);
        if (fields !== null && fields.length !== 0) {
          throw new Error(
            "The following field(s) are not unique: " +
              humanizeList(fields, { conjunction: "and", formatter: field => `'${field}'` }),
          );
        }
        throw e;
      }
      if (jsonSkills.length !== 0) {
        stdout.info(`Associating ${jsonSkills.length} Skills(s) with Project: ${project.name}...`);
        const skills = await findCorrespondingSkills(jsonSkills);
        const relationships = await prisma.projectOnSkills.createMany({
          data: skills.map(skill => ({
            assignedById: ctx.user.id,
            skillId: skill.id,
            projectId: project.id,
          })),
        });
        stdout.complete(
          `Associated ${relationships.count} Skills(s) with Project: ${project.name}`,
          { lineItems: skills.map(sk => sk.label), indexLineItems: true },
        );
      }
    }
    stdout.complete(`Successfully Created ${json.projects.length} Projects'`);
  }
}
