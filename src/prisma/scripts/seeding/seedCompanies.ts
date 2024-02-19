import { prisma } from "../../client";
import { DetailEntityType } from "../../model";
import { json } from "../fixtures/json";

import { type SeedContext } from "./types";
import { findCorresponding } from "./util";

export async function seedCompanies(ctx: SeedContext) {
  /* eslint-disable-next-line no-console */
  console.info("Generating Companies...");
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
  /* eslint-disable-next-line no-console */
  console.info(`Generated ${companies.length} Companies`);

  /* eslint-disable-next-line no-console */
  console.info("Generating Company Experiences...");
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
      const allSkills = await prisma.skill.findMany({});
      for (const jsonSkill of jsonExperience.skills ?? []) {
        let correspondingSkill: (typeof allSkills)[number];
        /* Determine whether or not the skill label in the JSON fixture is already associated with
           a skill in the database.  If it is not, an error will be thrown. */
        const corresponding = findCorresponding(
          allSkills,
          { label: jsonSkill },
          {
            field: "label",
            reference: "skill",
            strict: false,
          },
        );
        if (!corresponding) {
          correspondingSkill = findCorresponding(
            allSkills,
            { slug: jsonSkill },
            {
              field: "slug",
              reference: "skill",
              strict: true,
            },
          );
        } else {
          correspondingSkill = corresponding;
        }
        await prisma.experienceOnSkills.create({
          data: {
            assignedById: ctx.user.id,
            skillId: correspondingSkill.id,
            experienceId: experience.id,
          },
        });
      }
    }
    /* eslint-disable-next-line no-console */
    console.info(
      `Successfully Generated ${company.experiences.length} Experiences for Company ${company.name}`,
    );
  }
}
