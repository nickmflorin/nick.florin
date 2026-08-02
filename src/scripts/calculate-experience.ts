import { calculateSkillsExperience } from '~/database/model';
import { db } from '~/database/prisma';
import { cli } from '~/scripts';
import { stdout } from '~/support';

const script: cli.Script = async ctx => {
  await db.$transaction(
    async tx => {
      const skills = await tx.skill.findMany();

      const output = stdout.begin(`Calculating experience for ${skills.length} skills...`);
      for (let i = 0; i < skills.length; i++) {
        const skill = skills[i];
        /* eslint-disable-next-line no-await-in-loop -- The queries are issued sequentially, in
           order, against a shared transaction client. */
        const experience = await calculateSkillsExperience(tx, skill.id, {
          persist: false,
          returnAs: 'experience',
        });
        if (skill.experience !== null && experience !== skill.experience) {
          throw new cli.CommandLineError(
            `The calculated experience for skill '${skill.label}' does not match the overridden ` +
              'experience value when it should.  This indicates there is something wrong with ' +
              'the experience calculation!',
          );
        }
        if (skill.calculatedExperience === experience) {
          output.success(
            `The calculated experience value for the skill '${skill.label}' matches that is ` +
              'stored in the database.  No update is necessary.',
            { count: [i, skills.length] },
          );
        } else {
          stdout.warn(
            `The calculated experience value for the skill '${skill.label}', '${experience}', is ` +
              `different than what is stored in the database, '${skill.calculatedExperience}'. ` +
              'Updating the experience to the new, calculated value...',
            { count: [i, skills.length] },
          );
          /* eslint-disable-next-line no-await-in-loop -- The queries are issued sequentially, in
             order, against a shared transaction client. */
          await tx.skill.update({
            data: { calculatedExperience: experience, updatedById: ctx.user.id },
            where: { id: skill.id },
          });
        }
      }
    },
    { timeout: 500000 },
  );
};

void cli.runScript(script, { devOnly: true, upsertUser: false });
