import { slugify } from "~/lib/formatters";

import { prisma, getUniqueConstraintFields } from "../client";
import { json } from "../fixtures/json";

import { type SeedContext } from "./types";

export async function seedSkills(ctx: SeedContext) {
  /* eslint-disable-next-line no-console */
  console.info(`Generating Skills from ${json.skills.length} Fixtures...`);
  for (let i = 0; i < json.skills.length; i++) {
    const jsonSkill = json.skills[i];
    try {
      const skill = await prisma.skill.create({
        data: {
          ...jsonSkill,
          slug: jsonSkill.slug === undefined ? slugify(jsonSkill.label) : jsonSkill.slug,
          createdById: ctx.user.id,
          updatedById: ctx.user.id,
        },
      });
      /* eslint-disable-next-line no-console */
      console.info(
        `Successfully Generated Skill\n Label: ${skill.label} \n Slug: ${skill.slug} \n (${i + 1}/${
          json.skills.length
        })`,
      );
    } catch (e) {
      const fields = getUniqueConstraintFields(e);
      if (fields !== null) {
        if (fields.includes("slug") && fields.includes("label")) {
          throw new Error(
            `The slug '${jsonSkill.slug}' and label '${jsonSkill.label}' are not unique!`,
          );
        } else if (fields.includes("slug")) {
          throw new Error(`The slug '${jsonSkill.slug}' is not unique!`);
        } else if (fields.includes("label")) {
          throw new Error(`The label '${jsonSkill.label}' is not unique!`);
        }
      }
      throw e;
    }
  }
  /* eslint-disable-next-line no-console */
  console.info(`Successfully created ${json.skills.length} Skills`);
}
