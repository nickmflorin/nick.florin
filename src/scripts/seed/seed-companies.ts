import { json } from "~/database/fixtures";
import { DetailEntityType, type Company } from "~/database/model";
import { type Transaction } from "~/database/prisma";
import { type cli } from "~/scripts";
import { stdout } from "~/support";

import { createDetail } from "./seed-details";
import { findCorresponding } from "./util";

export async function seedCompanies(tx: Transaction, ctx: cli.ScriptContext) {
  if (json.companies.length !== 0) {
    let companies: Company[] = [];

    const output = stdout.begin(`Generating ${json.companies.length} Companies...`);
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

    for (let i = 0; i < json.companies.length; i++) {
      const { experiences: jsonExperiences = [], ...jsonCompany } = json.companies[i];
      output.begin(
        `Generating Company ${jsonCompany.name} with ${jsonExperiences.length} Experiences...`,
      );
      const company = await tx.company.create({
        include: { experiences: { include: { skills: true } } },
        data: {
          ...jsonCompany,
          createdBy: { connect: { id: ctx.user.id } },
          updatedBy: { connect: { id: ctx.user.id } },
          experiences: {
            create: [
              /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
              ...jsonExperiences.map(({ skills = [], details, ...jsonExperience }) => ({
                ...jsonExperience,
                startDate: new Date(jsonExperience.startDate),
                endDate: jsonExperience.endDate ? new Date(jsonExperience.endDate) : undefined,
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
      companies = [...companies, company];

      for (const experience of company.experiences) {
        const jsonExperience = findCorresponding(jsonExperiences, experience, {
          field: "title",
          reference: "experience",
          strict: true,
        });
        const jsonDetails = jsonExperience.details ?? [];
        if (jsonDetails.length !== 0) {
          output.begin(
            `Generating ${jsonDetails.length} Detail(s) for Experience: ${experience.title}...`,
          );
          const details = await Promise.all(
            jsonDetails.map(jsonDetail =>
              createDetail(tx, ctx, {
                entityId: experience.id,
                entityType: DetailEntityType.EXPERIENCE,
                skills: allSkills,
                detail: jsonDetail,
              }),
            ),
          );
          output.complete(
            `Generated ${details.length} Detail(s) for Experience: ${experience.title}...`,
            details.map(d => d.label),
          );
        }
      }

      output.complete("Successfully Generated Company", {
        count: [i, json.companies.length],
        lineItems: [
          { label: "Name", value: company.name },
          {
            label: "Experiences",
            items: company.experiences.map(experience => [
              {
                label: "Title",
                value: experience.title,
              },
              {
                label: "Skills",
                items: experience.skills.map(skill => ({ label: "Slug", value: skill.slug })),
                index: true,
              },
            ]),
          },
        ],
      });
    }

    output.complete(`Generated ${companies.length} Companies`, {
      lineItems: companies.map(s => s.name),
    });
  }
}
