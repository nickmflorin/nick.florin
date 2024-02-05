import { prisma } from "../client";
import { json } from "../fixtures/json";
import { DetailEntityType } from "../model";

import { type SeedContext } from "./types";
import { findCorresponding } from "./util";

export async function seedSchools(ctx: SeedContext) {
  /* eslint-disable-next-line no-console */
  console.info("Generating Schools...");
  const schools = await Promise.all(
    json.schools.map(({ educations: jsonEducations, ...jsonSchool }) =>
      prisma.school.create({
        include: { educations: true },
        data: {
          ...jsonSchool,
          createdBy: { connect: { id: ctx.user.id } },
          updatedBy: { connect: { id: ctx.user.id } },
          educations: {
            create: [
              /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
              ...jsonEducations.map(({ skills, details, ...jsonEducation }) => ({
                ...jsonEducation,
                startDate: new Date(jsonEducation.startDate),
                endDate: jsonEducation.endDate ? new Date(jsonEducation.endDate) : undefined,
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
  console.info(`Generated ${schools.length} Schools`);

  /* eslint-disable-next-line no-console */
  console.info("Generating School Educations...");
  for (const school of schools) {
    const jsonSchool = findCorresponding(json.schools, school, {
      field: "name",
      reference: "school",
      strict: true,
    });
    for (const education of school.educations) {
      const jsonEducation = findCorresponding(jsonSchool.educations, education, {
        field: "major",
        reference: "education",
        strict: true,
      });
      await Promise.all(
        (jsonEducation.details ?? []).map(({ nestedDetails, ...jsonDetail }) =>
          prisma.detail.create({
            data: {
              ...jsonDetail,
              entityId: education.id,
              entityType: DetailEntityType.EDUCATION,
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
      for (const jsonSkill of jsonEducation.skills ?? []) {
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
        await prisma.educationOnSkills.create({
          data: {
            assignedById: ctx.user.id,
            skillId: correspondingSkill.id,
            educationId: education.id,
          },
        });
      }
    }
    /* eslint-disable-next-line no-console */
    console.info(
      `Successfully Generated ${school.educations.length} Educations for School ${school.name}`,
    );
  }
}
