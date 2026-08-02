import { json } from '~/database/fixtures';
import { type Skill } from '~/database/model';
import { getUniqueConstraintFields, type Transaction } from '~/database/prisma';
import { humanizeList, slugify } from '~/lib/formatters';
import { type cli } from '~/scripts';
import { stdout } from '~/support';

/**
 * Skills are initially seeded with a value of 0 for the calculated experience because the
 * calculation requires that the repositories, courses, projects, experiences and educations that
 * are associated with each skill also be in the database.
 *
 * Since the skills have to be seeded before the repositories, courses, projects, experiences and
 * educations (since it is easier to reference the skills from each of those models, due to the slug
 * reference, rather than referencing each of those models from the skills), the calculated
 * experience is initialized as 0 and then recalculated for each skill after its associated models
 * finish seeding.
 */
const InitialCalculatedExperience = 0;

export const seedSkills = async (tx: Transaction, ctx: cli.ScriptContext) => {
  const skills = json.skills;
  if (skills.length !== 0) {
    const output = stdout.begin(`Generating Skills from ${skills.length} Fixtures...`);

    for (let i = 0; i < skills.length; i++) {
      const jsonSkill = skills[i];
      output.begin(`Generating Skill: ${jsonSkill.label}...`);
      let skill: Skill;
      const data = {
        ...jsonSkill,
        createdBy: { connect: { id: ctx.user.id } },
        slug: jsonSkill.slug ?? slugify(jsonSkill.label),
        updatedBy: { connect: { id: ctx.user.id } },
      };
      try {
        /* eslint-disable-next-line no-await-in-loop -- The queries are issued sequentially, in
           order, against a shared transaction client. */
        skill = await tx.skill.create({
          data: { ...data, calculatedExperience: InitialCalculatedExperience },
        });
      } catch (e) {
        const fields = getUniqueConstraintFields(e);
        if (fields !== null && fields.length !== 0) {
          throw new Error(
            'The following field(s) are not unique: ' +
              humanizeList(
                fields.map(f => `${f} = '${JSON.stringify(data[f as keyof typeof data])}'`),
                { conjunction: 'and' },
              ),
          );
        }
        throw e;
      }
      output.complete('Successfully Generated Skill', {
        count: [i, json.skills.length],
        lineItems: [
          { label: 'Label', value: skill.label },
          { label: 'Slug', value: skill.slug },
        ],
      });
    }
    output.complete(`Successfully Created ${json.skills.length} Skills`);
  }
};
