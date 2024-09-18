import { stdout } from "~/application/support";
import { json } from "~/database/fixtures";
import { DetailEntityType, type School } from "~/database/model";
import { type Transaction } from "~/database/prisma";
import { type SeedContext } from "~/scripts/context";

import { seedCourses } from "./seed-courses";
import { createDetail } from "./seed-details";
import { findCorresponding } from "./util";

export async function seedSchools(tx: Transaction, ctx: SeedContext) {
  if (json.schools.length !== 0) {
    let schools: School[] = [];

    const allSkills = await tx.skill.findMany({});

    /* This is simply for debugging, since in the case that the slug does not correspond to an
       actual skill, the Prisma error is not super descriptive. */
    const checkSkill = (skill: string) => {
      const sk = allSkills.find(sk => sk.slug === skill);
      if (sk === undefined) {
        throw new Error(`Invalid slug: ${skill}`);
      }
      return skill;
    };

    const output = stdout.begin(`Generating ${json.schools.length} Schools...`);

    for (let i = 0; i < json.schools.length; i++) {
      const { educations: jsonEducations = [], ...jsonSchool } = json.schools[i];
      output.begin(
        `Generating School ${jsonSchool.name} with ${jsonEducations.length} Educations...`,
      );
      const school = await tx.school.create({
        include: { educations: { include: { skills: true } } },
        data: {
          ...jsonSchool,
          createdBy: { connect: { id: ctx.user.id } },
          updatedBy: { connect: { id: ctx.user.id } },
          educations: {
            create: [
              /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
              ...jsonEducations.map(({ skills = [], details, courses, ...jsonEducation }) => ({
                ...jsonEducation,
                startDate: new Date(jsonEducation.startDate),
                endDate: jsonEducation.endDate ? new Date(jsonEducation.endDate) : undefined,
                createdById: ctx.user.id,
                updatedById: ctx.user.id,
                skills: {
                  connect: skills.map(sk => ({ slug: checkSkill(sk) })),
                },
              })),
            ],
          },
        },
      });
      schools = [...schools, school];
      for (const education of school.educations) {
        const jsonEducation = findCorresponding(jsonEducations, education, {
          field: "major",
          reference: "education",
          strict: true,
        });
        await seedCourses(tx, ctx, education, jsonEducation, output);

        const jsonDetails = jsonEducation.details ?? [];
        if (jsonDetails.length !== 0) {
          output.begin(
            `Generating ${jsonDetails.length} Detail(s) for Education: ${education.major}...`,
          );
          const details = await Promise.all(
            jsonDetails.map(jsonDetail =>
              createDetail(tx, ctx, {
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
      }

      output.complete("Successfully Generated School", {
        count: [i, json.schools.length],
        lineItems: [
          { label: "Name", value: school.name },
          {
            label: "Educations",
            items: school.educations.map(education => [
              {
                label: "Major",
                value: education.major,
              },
              {
                label: "Skills",
                items: education.skills.map(skill => ({ label: "Slug", value: skill.slug })),
                index: true,
              },
            ]),
          },
        ],
      });
    }
    output.complete(`Generated ${schools.length} Schools`, {
      lineItems: schools.map(s => s.name),
    });
  }
}
