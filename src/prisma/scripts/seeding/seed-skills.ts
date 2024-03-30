import { slugify, humanizeList } from "~/lib/formatters";

import { prisma, getUniqueConstraintFields } from "../../client";
import { type Skill } from "../../model";
import { json } from "../fixtures/json";
import { type JsonSkill } from "../fixtures/schemas";
import { json as tsSkills } from "../fixtures/skills";

import { stdout } from "./stdout";
import { type SeedContext } from "./types";
import { findCorresponding } from "./util";

export const findCorrespondingSkillsSync = (jsonSkills: string[], skills: Skill[]): Skill[] =>
  jsonSkills.map((jsonSkill): Skill => {
    /* Determine whether or not the skill label in the JSON fixture is already associated with
     a skill in the database.  If it is not, an error will be thrown. */
    const corresponding = findCorresponding(
      skills,
      { label: jsonSkill },
      {
        field: "label",
        reference: "skill",
        strict: false,
      },
    );
    if (!corresponding) {
      return findCorresponding(
        skills,
        { slug: jsonSkill },
        {
          field: "slug",
          reference: "skill",
          strict: true,
        },
      );
    }
    return corresponding;
  });

export const findCorrespondingSkills = async (jsonSkills: string[]): Promise<Skill[]> => {
  const allSkills = await prisma.skill.findMany({});
  return findCorrespondingSkillsSync(jsonSkills, allSkills);
};

const _seedSkills = async (ctx: SeedContext, skills: JsonSkill[]) => {
  if (skills.length !== 0) {
    stdout.begin(`Generating Skills from ${skills.length} Fixtures...`);
    for (let i = 0; i < skills.length; i++) {
      const jsonSkill = skills[i];
      try {
        const skill = await prisma.skill.create({
          data: {
            ...jsonSkill,
            slug: jsonSkill.slug === undefined ? slugify(jsonSkill.label) : jsonSkill.slug,
            createdById: ctx.user.id,
            updatedById: ctx.user.id,
          },
        });
        stdout.info("Successfully Generated Skill", {
          lineItems: [
            { label: "Label", value: skill.label },
            { label: "Slug", value: skill.slug },
          ],
          count: [i, json.skills.length],
        });
      } catch (e) {
        const fields = getUniqueConstraintFields(e);
        if (fields !== null && fields.length !== 0) {
          throw new Error(
            "The following field(s) are not unique: " +
              humanizeList(fields, { conjunction: "and", formatter: field => `'${field}'` }),
          );
        }
        throw e;
      }
    }
    stdout.complete(`Successfully Created ${json.skills.length} Skills`);
  }
};

export async function seedSkills(ctx: SeedContext, source: "json" | "ts" = "ts") {
  await _seedSkills(ctx, source === "ts" ? tsSkills : json.skills);
}
