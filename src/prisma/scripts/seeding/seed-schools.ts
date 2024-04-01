import { prisma } from "../../client";
import { DetailEntityType } from "../../model";
import { json } from "../fixtures/json";

import { seedCourses } from "./seed-courses";
import { createDetail } from "./seed-details";
import { findCorrespondingSkills } from "./seed-skills";
import { stdout } from "./stdout";
import { type SeedContext } from "./types";
import { findCorresponding } from "./util";

export async function seedSchools(ctx: SeedContext) {
  if (json.schools.length !== 0) {
    const output = stdout.begin(`Generating ${json.schools.length} Schools...`);
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

    for (const school of schools) {
      const jsonSchool = findCorresponding(json.schools, school, {
        field: "name",
        reference: "school",
        strict: true,
      });
      output.begin(`Generating School: ${school.name}`);
      if (school.educations.length !== 0) {
        output.begin(
          `Generating ${school.educations.length} Educations(s) for School ${school.name}`,
        );
        for (let i = 0; i < school.educations.length; i++) {
          const education = school.educations[i];
          const jsonEducation = findCorresponding(jsonSchool.educations, education, {
            field: "major",
            reference: "education",
            strict: true,
          });
          output.begin(`Generating Education: ${education.major}`);

          await seedCourses(ctx, education, jsonEducation, output);

          const jsonDetails = jsonEducation.details ?? [];
          if (jsonDetails.length !== 0) {
            output.begin(
              `Generating ${jsonDetails.length} Detail(s) for Experience: ${education.major}...`,
            );
            const allSkills = await prisma.skill.findMany({});
            const details = await Promise.all(
              jsonDetails.map(jsonDetail =>
                createDetail(ctx, {
                  entityId: education.id,
                  entityType: DetailEntityType.EDUCATION,
                  skills: allSkills,
                  detail: jsonDetail,
                }),
              ),
            );
            output.complete(
              `Generated ${details.length} Detail(s) for Education: ${education.major}...`,
              details.map(d => d.label),
            );
          }

          const jsonSkills = jsonEducation.skills ?? [];
          if (jsonSkills.length !== 0) {
            output.begin(
              `Associating ${jsonSkills.length} Skills(s) with Education: ${education.major}...`,
            );
            const skills = await findCorrespondingSkills(jsonSkills);
            const relationships = await prisma.educationOnSkills.createMany({
              data: skills.map(skill => ({
                assignedById: ctx.user.id,
                skillId: skill.id,
                educationId: education.id,
              })),
            });
            output.complete(
              `Associated ${relationships.count} Skills(s) with Education: ${education.major}`,
              { lineItems: skills.map(sk => sk.label) },
            );
          }
          output.complete("Successfully Generated Education", {
            lineItems: [{ label: "Major", value: education.major }],
            count: [i, school.educations.length],
          });
        }
        output.complete(
          `Generated ${school.educations.length} Educations for School ${school.name}`,
          school.educations.map(edu => edu.major),
        );
      }
    }
    output.complete(`Generated ${schools.length} Schools`, {
      lineItems: schools.map(s => s.name),
    });
  }
}
