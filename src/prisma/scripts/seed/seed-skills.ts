import { slugify, humanizeList } from "~/lib/formatters";
import { type Transaction, getUniqueConstraintFields } from "~/prisma/client";
import { type Skill } from "~/prisma/model";

import { json } from "../fixtures/json";
import { stdout } from "../stdout";

import { type SeedContext } from "./types";

export const seedSkills = async (tx: Transaction, ctx: SeedContext) => {
  const skills = json.skills;
  if (skills.length !== 0) {
    const output = stdout.begin(`Generating Skills from ${skills.length} Fixtures...`);

    for (let i = 0; i < skills.length; i++) {
      const jsonSkill = skills[i];
      output.begin(`Generating Skill: ${jsonSkill.label}...`);
      let skill: Skill;
      const data = {
        ...jsonSkill,
        slug:
          jsonSkill.slug === undefined || jsonSkill.slug === null
            ? slugify(jsonSkill.label)
            : jsonSkill.slug,
        createdBy: { connect: { id: ctx.user.id } },
        updatedBy: { connect: { id: ctx.user.id } },
      };
      try {
        skill = await tx.skill.create({ data });
      } catch (e) {
        const fields = getUniqueConstraintFields(e);
        if (fields !== null && fields.length !== 0) {
          throw new Error(
            "The following field(s) are not unique: " +
              humanizeList(
                fields.map(f => `${f} = '${data[f as keyof typeof data]}'`),
                { conjunction: "and" },
              ),
          );
        }
        throw e;
      }
      output.complete("Successfully Generated Skill", {
        lineItems: [
          { label: "Label", value: skill.label },
          { label: "Slug", value: skill.slug },
        ],
        count: [i, json.skills.length],
      });
    }
    output.complete(`Successfully Created ${json.skills.length} Skills`);
  }
};
