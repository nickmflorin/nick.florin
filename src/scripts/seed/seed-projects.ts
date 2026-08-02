import { json } from '~/database/fixtures';
import { type Project, type Skill } from '~/database/model';
import { getUniqueConstraintFields, type Transaction } from '~/database/prisma';
import { humanizeList, slugify } from '~/lib/formatters';
import { type cli } from '~/scripts';
import { stdout } from '~/support';

import { findCorresponding } from './util';

export const findCorrespondingProjectSync = (name: string, projects: Project[]): Project =>
  findCorresponding(
    projects,
    { name, slug: name },
    {
      field: ['name', 'slug'],
      reference: 'skill',
      strict: true,
    },
  );

export const findCorrespondingProject = async (tx: Transaction, name: string): Promise<Project> => {
  const projects = await tx.project.findMany({});
  return findCorrespondingProjectSync(name, projects);
};

export async function seedProjects(tx: Transaction, ctx: cli.ScriptContext) {
  if (json.projects.length !== 0) {
    const output = stdout.begin(`Generating ${json.projects.length} Projects...`);

    let projects: Project[] = [];
    for (let i = 0; i < json.projects.length; i++) {
      const {
        repositories: jsonRepositories,
        skills: jsonSkills = [],
        ...jsonProject
      } = json.projects[i];

      output.begin(`Generating Project: ${jsonProject.name}...`);
      let project: { readonly skills: Skill[] } & Project;
      try {
        /* eslint-disable-next-line no-await-in-loop -- The queries are issued sequentially, in
           order, against a shared transaction client. */
        project = await tx.project.create({
          data: {
            ...jsonProject,
            createdById: ctx.user.id,
            repositories: { connect: (jsonRepositories ?? []).map((slug: string) => ({ slug })) },
            skills: {
              connect: jsonSkills.map((skill: string) => ({ slug: skill })),
            },
            slug: jsonProject.slug ?? slugify(jsonProject.name),
            updatedById: ctx.user.id,
          },
          include: { skills: true },
        });
      } catch (e) {
        const fields = getUniqueConstraintFields(e);
        if (fields !== null && fields.length !== 0) {
          throw new Error(
            'The following field(s) are not unique: ' +
              humanizeList(fields, { conjunction: 'and', formatter: field => `'${field}'` }),
          );
        }
        throw e;
      }
      projects = [...projects, project];

      output.complete('Successfully Generated Project', {
        count: [i, json.projects.length],
        lineItems: [
          { label: 'Name', value: project.name },
          { label: 'Slug', value: project.slug },
          {
            index: true,
            items: project.skills.map(skill => ({ label: 'Slug', value: skill.slug })),
            label: 'Skills',
          },
        ],
      });
    }
    output.complete(`Successfully Generated ${projects.length} Project(s)`, {
      lineItems: projects.map(p => p.name),
    });
  }
}
