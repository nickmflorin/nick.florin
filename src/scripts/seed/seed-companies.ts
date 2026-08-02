import { json } from '~/database/fixtures';
import { type Company, DetailEntityType } from '~/database/model';
import { type Transaction } from '~/database/prisma';
import { type cli } from '~/scripts';
import { stdout } from '~/support';

import { createDetail } from './seed-details';
import { findCorresponding } from './util';

export async function seedCompanies(tx: Transaction, ctx: cli.ScriptContext) {
  if (json.companies.length !== 0) {
    let companies: Company[] = [];

    const output = stdout.begin(`Generating ${json.companies.length} Companies...`);
    const allSkills = await tx.skill.findMany({});

    /**
     * This is simply for debugging, since in the case that the slug does not correspond to an
     * actual skill, the Prisma error is not super descriptive.
     */
    const checkSkill = (skill: string) => {
      const sk = allSkills.find(candidate => candidate.slug === skill);
      if (sk === undefined) {
        throw new Error(`Invalid slug: ${skill}`);
      }
      return skill;
    };

    for (let i = 0; i < json.companies.length; i++) {
      const { experiences: jsonExperiences = [], ...jsonCompany } = json.companies[i];
      output.begin(
        `Generating Company ${jsonCompany.name} with ${jsonExperiences.length} Experiences...`,
      );
      /* eslint-disable-next-line no-await-in-loop -- The queries are issued sequentially, in
         order, against a shared transaction client. */
      const company = await tx.company.create({
        data: {
          ...jsonCompany,
          createdBy: { connect: { id: ctx.user.id } },
          experiences: {
            create: [
              /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
              ...jsonExperiences.map(({ details, skills = [], ...jsonExperience }) => ({
                ...jsonExperience,
                createdById: ctx.user.id,
                endDate: jsonExperience.endDate ? new Date(jsonExperience.endDate) : undefined,
                skills: {
                  connect: skills.map(sk => ({ slug: checkSkill(sk) })),
                },
                startDate: new Date(jsonExperience.startDate),
                updatedById: ctx.user.id,
              })),
            ],
          },
          updatedBy: { connect: { id: ctx.user.id } },
        },
        include: { experiences: { include: { skills: true } } },
      });
      companies = [...companies, company];

      for (const experience of company.experiences) {
        const jsonExperience = findCorresponding(jsonExperiences, experience, {
          field: 'title',
          reference: 'experience',
          strict: true,
        });
        const jsonDetails = jsonExperience.details ?? [];
        if (jsonDetails.length !== 0) {
          output.begin(
            `Generating ${jsonDetails.length} Detail(s) for Experience: ${experience.title}...`,
          );
          /* eslint-disable-next-line no-await-in-loop -- The queries are issued sequentially, in
             order, against a shared transaction client. */
          const details = await Promise.all(
            jsonDetails.map(jsonDetail =>
              createDetail(tx, ctx, {
                detail: jsonDetail,
                entityId: experience.id,
                entityType: DetailEntityType.EXPERIENCE,
                skills: allSkills,
              }),
            ),
          );
          output.complete(
            `Generated ${details.length} Detail(s) for Experience: ${experience.title}...`,
            details.map(d => d.label),
          );
        }
      }

      output.complete('Successfully Generated Company', {
        count: [i, json.companies.length],
        lineItems: [
          { label: 'Name', value: company.name },
          {
            items: company.experiences.map(experience => [
              {
                label: 'Title',
                value: experience.title,
              },
              {
                index: true,
                items: experience.skills.map(skill => ({ label: 'Slug', value: skill.slug })),
                label: 'Skills',
              },
            ]),
            label: 'Experiences',
          },
        ],
      });
    }

    output.complete(`Generated ${companies.length} Companies`, {
      lineItems: companies.map(s => s.name),
    });
  }
}
