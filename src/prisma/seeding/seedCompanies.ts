import { prisma } from "../client";
import { json } from "../fixtures";
import { DetailEntityType } from "../model";

import { type SeedContext } from "./types";
import { findCorresponding } from "./util";

export async function seedCompanies(ctx: SeedContext) {
  const companies = await Promise.all(
    json.companies.map(({ experiences: jsonExperiences, ...jsonCompany }) =>
      prisma.company.create({
        include: { experiences: true },
        data: {
          ...jsonCompany,
          createdBy: { connect: { id: ctx.user.id } },
          updatedBy: { connect: { id: ctx.user.id } },
          experiences: {
            create: [
              /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
              ...jsonExperiences.map(({ skills, details, ...jsonExperience }) => ({
                ...jsonExperience,
                title: jsonExperience.title,
                startDate: new Date(jsonExperience.startDate),
                endDate: jsonExperience.endDate ? new Date(jsonExperience.endDate) : undefined,
                createdById: ctx.user.id,
                updatedById: ctx.user.id,
              })),
            ],
          },
        },
      }),
    ),
  );
  for (const company of companies) {
    const jsonCompany = findCorresponding(json.companies, company, {
      field: "name",
      reference: "company",
      strict: true,
    });
    for (const experience of company.experiences) {
      const jsonExperience = findCorresponding(jsonCompany.experiences, experience, {
        field: "title",
        reference: "experience",
        strict: true,
      });
      await Promise.all(
        (jsonExperience.details ?? []).map(({ nestedDetails, ...jsonDetail }) =>
          prisma.detail.create({
            data: {
              ...jsonDetail,
              entityId: experience.id,
              entityType: DetailEntityType.EXPERIENCE,
              createdById: ctx.user.id,
              updatedById: ctx.user.id,
              nestedDetails: {
                create: (nestedDetails ?? []).map(jsonNestedDetail => ({
                  ...jsonNestedDetail,
                  createdById: ctx.user.id,
                  updatedById: ctx.user.id,
                })),
              },
            },
          }),
        ),
      );
      /* Create or establish relationships for all skills associated with the experience.  Since
         our fixtures reference skills as string labels, two different experiences may have the
         same skill, we need to check current skills and skill/experience relationships in the
         database before creating new skills or establishing relationships between existing skills
         and new experiences. */
      const allSkills = await prisma.skill.findMany({});
      for (const skillLabel of jsonExperience.skills ?? []) {
        /* Determine whether or not the skill label in the JSON fixture is already associated with
           a skill in the database. */
        const correspondingSkill = findCorresponding(
          allSkills,
          { label: skillLabel },
          {
            field: "label",
            reference: "skill",
          },
        );
        /* If the skill does not exist in the database, the skill needs to be created along with the
           relationship between the skill and the experience. */
        if (!correspondingSkill) {
          await prisma.skill.create({
            data: {
              label: skillLabel,
              createdBy: { connect: { id: ctx.user.id } },
              updatedBy: { connect: { id: ctx.user.id } },
              experiences: {
                create: [
                  {
                    assignedById: ctx.user.id,
                    experience: { connect: { id: experience.id } },
                  },
                ],
              },
            },
          });
        } else {
          /* If the skill does exist in the database, we need to determine whether or not that skill
             is already associated with the experience.  If it is not, the relationship needs to be
             established. */
          const experienceSkill = await prisma.skill.findUnique({
            where: {
              id: correspondingSkill.id,
            },
          });
          if (!experienceSkill) {
            await prisma.experienceOnSkills.create({
              data: {
                assignedById: ctx.user.id,
                skillId: correspondingSkill.id,
                experienceId: experience.id,
              },
            });
          }
        }
      }
    }
  }
}
