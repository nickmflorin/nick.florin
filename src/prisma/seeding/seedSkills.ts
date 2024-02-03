import { prisma, getUniqueConstraintFields } from "../client";
import { json } from "../fixtures";

import { type SeedContext } from "./types";

const toSkillSlug = (v: string) => v.toLowerCase().replaceAll(".", "").replaceAll(" ", "-");

export async function seedSkills(ctx: SeedContext) {
  for (const jsonSkill of json.skills) {
    try {
      await prisma.skill.create({
        data: {
          slug: toSkillSlug(jsonSkill.label),
          ...jsonSkill,
          createdById: ctx.user.id,
          updatedById: ctx.user.id,
        },
      });
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
  console.info(`Created ${json.skills.length} Skills`);
}
