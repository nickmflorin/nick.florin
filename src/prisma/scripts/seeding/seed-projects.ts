import { humanizeList, slugify } from "~/lib/formatters";

import { prisma, getUniqueConstraintFields } from "../../client";
import { type Project, type Skill } from "../../model";
import { json } from "../fixtures/json";

import { stdout } from "./stdout";
import { type SeedContext } from "./types";
import { findCorresponding } from "./util";

export const findCorrespondingProjectSync = (name: string, projects: Project[]): Project =>
  findCorresponding(
    projects,
    { name, slug: name },
    {
      field: ["name", "slug"],
      strict: true,
      reference: "skill",
    },
  );

export const findCorrespondingProject = async (name: string): Promise<Project> => {
  const projects = await prisma.project.findMany({});
  return findCorrespondingProjectSync(name, projects);
};

export async function seedProjects(ctx: SeedContext) {
  if (json.projects.length !== 0) {
    const output = stdout.begin(`Generating ${json.projects.length} Projects...`);

    let projects: Project[] = [];
    for (let i = 0; i < json.projects.length; i++) {
      const {
        skills: jsonSkills = [],
        repositories: jsonRepositories,
        ...jsonProject
      } = json.projects[i];

      output.begin(`Generating Project: ${jsonProject.name}...`);
      let project: Project & { readonly skills: Skill[] };
      try {
        project = await prisma.project.create({
          include: { skills: true },
          data: {
            ...jsonProject,
            repositories: { connect: (jsonRepositories ?? []).map((slug: string) => ({ slug })) },
            slug: jsonProject.slug === undefined ? slugify(jsonProject.name) : jsonProject.slug,
            createdById: ctx.user.id,
            updatedById: ctx.user.id,
            skills: {
              connect: jsonSkills.map((skill: string) => ({ slug: skill })),
            },
          },
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
      projects = [...projects, project];

      output.complete("Successfully Generated Project", {
        lineItems: [
          { label: "Name", value: project.name },
          { label: "Slug", value: project.slug },
          {
            label: "Skills",
            items: project.skills.map(skill => ({ label: "Slug", value: skill.slug })),
            index: true,
          },
        ],
        count: [i, json.projects.length],
      });
    }
    output.complete(`Successfully Generated ${projects.length} Project(s)`, {
      lineItems: projects.map(p => p.name),
    });
  }
}
