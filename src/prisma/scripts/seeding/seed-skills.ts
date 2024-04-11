import { slugify, humanizeList } from "~/lib/formatters";

import { prisma, getUniqueConstraintFields } from "../../client";
import { type Skill } from "../../model";
import { json } from "../fixtures/json";
import { type JsonSkill } from "../fixtures/schemas";
import { json as tsSkills } from "../fixtures/skills";

import { stdout } from "./stdout";
import { type SeedContext } from "./types";

const _seedSkills = async (ctx: SeedContext, skills: JsonSkill[]) => {
  if (skills.length !== 0) {
    const output = stdout.begin(`Generating Skills from ${skills.length} Fixtures...`);

    for (let i = 0; i < skills.length; i++) {
      const { repositories: jsonRepositories, ...jsonSkill } = skills[i];
      output.begin(`Generating Skill: ${jsonSkill.label}...`);
      let skill: Skill;
      const data = {
        ...jsonSkill,
        repositories: {
          connect: (jsonRepositories ?? []).map(slug => ({ slug })),
        },
        slug: jsonSkill.slug === undefined ? slugify(jsonSkill.label) : jsonSkill.slug,
        createdBy: { connect: { id: ctx.user.id } },
        updatedBy: { connect: { id: ctx.user.id } },
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
