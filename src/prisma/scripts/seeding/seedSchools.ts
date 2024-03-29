import * as terminal from "~/application/support/terminal";

import { prisma } from "../../client";
import { DetailEntityType } from "../../model";
import { json } from "../fixtures/json";

import { seedCourses } from "./seedCourses";
import { stdout } from "./stdout";
import { type SeedContext } from "./types";
import { findCorresponding } from "./util";

export async function seedSchools(ctx: SeedContext) {
  if (json.schools.length !== 0) {
    stdout.begin(`Generating ${json.schools.length} Schools...`);
    const schools = await Promise.all(
      json.schools.map(({ educations: jsonEducations, ...jsonSchool }) => {
        const school = prisma.school.create({
          include: { educations: true },
          data: {
            ...jsonSchool,
            createdBy: { connect: { id: ctx.user.id } },
            updatedBy: { connect: { id: ctx.user.id } },
            educations: {
              create: [
                /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
                ...jsonEducations.map(({ skills, details, courses, ...jsonEducation }) => ({
                  ...jsonEducation,
                  startDate: new Date(jsonEducation.startDate),
                  endDate: jsonEducation.endDate ? new Date(jsonEducation.endDate) : undefined,
                  createdById: ctx.user.id,
                  updatedById: ctx.user.id,
                })),
              ],
            },
          },
        });
        return school;
      }),
    );
    stdout.complete(`Successfully Generated ${schools.length} Schools`);

    stdout.begin(`Generating Details & Skills of Educations for ${schools.length} Schools...`);
    for (const school of schools) {
      const jsonSchool = findCorresponding(json.schools, school, {
        field: "name",
        reference: "school",
        strict: true,
      });
      if (school.educations.length !== 0) {
        stdout.begin(
          `Generating Details, Courses & Skills for Educations of School ${jsonSchool.name}...`,
        );
        for (const education of school.educations) {
          const jsonEducation = findCorresponding(jsonSchool.educations, education, {
            field: "major",
            reference: "education",
            strict: true,
          });
          await seedCourses(ctx, education, jsonEducation);

          const jsonDetails = jsonEducation.details ?? [];
          if (jsonDetails.length !== 0) {
            stdout.info(
              `Generating ${jsonDetails.length} Detail(s) for Education ${jsonEducation.major}...`,
            );
            const details = await Promise.all(
              jsonDetails.map(({ nestedDetails, ...jsonDetail }) =>
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
            stdout.complete(
              `Successfully Generated ${details.length} Detail(s) for Education ${jsonEducation.major}...`,
            );
          }

          const allSkills = await prisma.skill.findMany({});
          const jsonSkills = jsonEducation.skills ?? [];
          if (jsonSkills.length !== 0) {
            stdout.info(
              `Generating ${jsonSkills.length} Skills(s) for Education: ${education.major}...`,
            );
            let relationships: Array<Awaited<ReturnType<typeof prisma.educationOnSkills.create>>> =
              [];
            for (const jsonSkill of jsonSkills) {
              let correspondingSkill: (typeof allSkills)[number];
              /* Determine whether or not the skill label in the JSON fixture is already associated
                 with a skill in the database.  If it is not, an error will be thrown. */
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
              relationships = [
                ...relationships,
                await prisma.educationOnSkills.create({
                  data: {
                    assignedById: ctx.user.id,
                    skillId: correspondingSkill.id,
                    educationId: education.id,
                  },
                }),
              ];
            }
            stdout.complete(
              `Generated ${relationships.length} Detail(s) for Education: ${education.major}`,
            );
          }
        }
      }
      /* eslint-disable-next-line no-console */
      console.info(
        terminal.GREEN +
          `Successfully Generated ${school.educations.length} Educations for School ${school.name}` +
          terminal.RESET,
      );
    }
  }
}
