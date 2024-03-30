import { prisma } from "../../client";
import { DetailEntityType } from "../../model";
import { json } from "../fixtures/json";

import { createDetail } from "./seed-details";
import { findCorrespondingSkills } from "./seed-skills";
import { stdout } from "./stdout";
import { type SeedContext } from "./types";
import { findCorresponding } from "./util";

export async function seedCompanies(ctx: SeedContext) {
  stdout.begin(`Generating ${json.companies.length} Companies...`);
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
  stdout.complete(
    `Successfully Generated ${companies.length} Companies`,
    companies.map(({ name }) => ({ label: "Name", value: name })),
  );

  stdout.begin(
    `Generating Company Experience Skills & Details for ${companies.length} Companies...`,
  );
  for (const company of companies) {
    const jsonCompany = findCorresponding(json.companies, company, {
      field: "name",
      reference: "company",
      strict: true,
    });
    if (company.experiences.length !== 0) {
      for (const experience of company.experiences) {
        const jsonExperience = findCorresponding(jsonCompany.experiences, experience, {
          field: "title",
          reference: "experience",
          strict: true,
        });
        const jsonDetails = jsonExperience.details ?? [];
        if (jsonDetails.length !== 0) {
          stdout.info(
            `Generating ${jsonDetails.length} Detail(s) for Experience: ${experience.title}...`,
          );
          const allSkills = await prisma.skill.findMany({});
          const details = await Promise.all(
            jsonDetails.map(jsonDetail =>
              createDetail(ctx, {
                entityId: experience.id,
                entityType: DetailEntityType.EXPERIENCE,
                skills: allSkills,
                detail: jsonDetail,
              }),
            ),
          );
          stdout.complete(
            `Generated ${details.length} Detail(s) for Experience: ${experience.title}...`,
          );
        }
        const jsonSkills = jsonExperience.skills ?? [];
        if (jsonSkills.length !== 0) {
          stdout.info(
            `Associating ${jsonSkills.length} Skills(s) with Experience: ${experience.title}...`,
          );
          const skills = await findCorrespondingSkills(jsonSkills);
          const relationships = await prisma.experienceOnSkills.createMany({
            data: skills.map(skill => ({
              assignedById: ctx.user.id,
              skillId: skill.id,
              experienceId: experience.id,
            })),
          });
          stdout.complete(
            `Associated ${relationships.count} Skills(s) with Experience: ${experience.title}`,
            { lineItems: skills.map(sk => sk.label), indexLineItems: true },
          );
        }
      }
      stdout.complete(
        `Successfully Generated ${company.experiences.length} Experience(s) for Company ${company.name}`,
      );
    }
  }
}
