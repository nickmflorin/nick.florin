import { prisma } from "../../client";
import { DetailEntityType } from "../../model";
import { json } from "../fixtures/json";

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
      stdout.info(
        `Generating Skills & Details for ${company.experiences.length} Experiences of Company: ${company.name}...`,
      );
    }
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
        const details = await Promise.all(
          jsonDetails.map(({ nestedDetails, ...jsonDetail }) =>
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
        stdout.complete(
          `Generated ${details.length} Detail(s) for Experience: ${experience.title}...`,
        );
      }
      const allSkills = await prisma.skill.findMany({});
      const jsonSkills = jsonExperience.skills ?? [];
      if (jsonSkills.length !== 0) {
        stdout.info(
          `Generating ${jsonSkills.length} Skills(s) for Experience: ${experience.title}...`,
        );
        let relationships: Array<Awaited<ReturnType<typeof prisma.experienceOnSkills.create>>> = [];
        for (const jsonSkill of jsonSkills) {
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
          relationships = [
            ...relationships,
            await prisma.experienceOnSkills.create({
              data: {
                assignedById: ctx.user.id,
                skillId: correspondingSkill.id,
                experienceId: experience.id,
              },
            }),
          ];
        }
        stdout.complete(
          `Generated ${relationships.length} Detail(s) for Experience: ${experience.title}`,
        );
      }
    }
    stdout.complete(
      `Successfully Generated ${company.experiences.length} Experience(s) for Company ${company.name}`,
    );
  }
}
