import { stdout } from "~/application/support";
import { json } from "~/database/fixtures";
import { type Skill } from "~/database/model";
import { type Transaction, getUniqueConstraintFields } from "~/database/prisma";
import { slugify, humanizeList } from "~/lib/formatters";
import { type SeedContext } from "~/scripts/context";

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
        /* Note: We initially seed the skills with a value of 0 for the calculated experience
           because the calculation requires that the repositories, courses, projects, experiences
           and educations that are associated with each skill also be in the database.  Since, at
           least in the current setup, the skills have to be seeded before the repositories,
           courses, projects, experiences and educations (since it is easier to reference the
           skills from each of those models - due to the slug reference - rather than referencing
           each of those models from the skills), this means that we have to initialize the
           calculated experience as 0, and then recalculate the experience for each skill after its
           associated models finish seeding. */
        skill = await tx.skill.create({ data: { ...data, calculatedExperience: 0 } });
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
