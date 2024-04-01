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
  findCorresponding(
    skills,
    jsonSkills.map(j => ({ slug: j, label: j })),
    {
      field: ["label", "slug"],
      strict: true,
      reference: "skill",
    },
  );

export const findCorrespondingSkills = async (jsonSkills: string[]): Promise<Skill[]> => {
  const allSkills = await prisma.skill.findMany({});
  return findCorrespondingSkillsSync(jsonSkills, allSkills);
};

const _seedSkills = async (ctx: SeedContext, skills: JsonSkill[]) => {
  if (skills.length !== 0) {
    const output = stdout.begin(`Generating Skills from ${skills.length} Fixtures...`);
    for (let i = 0; i < skills.length; i++) {
      const jsonSkill = skills[i];
      output.begin(`Generating Skill: ${jsonSkill.label}...`);
      let skill: Skill;
      const data = {
        ...jsonSkill,
        slug: jsonSkill.slug === undefined ? slugify(jsonSkill.label) : jsonSkill.slug,
        createdById: ctx.user.id,
        updatedById: ctx.user.id,
      };
      try {
        skill = await prisma.skill.create({ data });
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

export async function seedSkills(ctx: SeedContext, source: "json" | "ts" = "ts") {
  await _seedSkills(ctx, source === "ts" ? tsSkills : json.skills);
}
