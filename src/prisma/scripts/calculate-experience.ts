import { prisma } from "~/prisma/client";
import { calculateSkillsExperience } from "~/prisma/model";

import { getScriptContext } from "./context";
import { stdout } from "./stdout";

async function main() {
  await prisma.$transaction(
    async tx => {
      const { user } = await getScriptContext(tx, { upsertUser: false });
      const skills = await tx.skill.findMany();

      const output = stdout.begin(`Calculating experience for ${skills.length} skills...`);
      for (let i = 0; i < skills.length; i++) {
        const skill = skills[i];
        const experience = await calculateSkillsExperience(tx, skill.id, {
          persist: false,
          returnAs: "experience",
        });
        if (skill.experience !== null && experience !== skill.experience) {
          throw new Error(
            `The calculated experience for skill '${skill.label}' does not match the overidden ` +
              "experience value when it should.  This indicates there is something wrong with " +
              "the experience calculation!",
          );
        }
        if (skill.calculatedExperience !== experience) {
          stdout.warn(
            `The calculated experience value for the skill '${skill.label}', '${experience}', ` +
              `is different than what is stored in the database, '${skill.calculatedExperience}'. ` +
              "Updating the experience to the new, calculated value...",
            { count: [i, skills.length] },
          );
          await tx.skill.update({
            where: { id: skill.id },
            data: { calculatedExperience: experience, updatedById: user.id },
          });
        } else {
          output.success(
            `The calculated experience value for the skill '${skill.label}' matches that is ` +
              "stored in the database.  No update is necessary.",
            { count: [i, skills.length] },
          );
        }
      }
    },
    { timeout: 500000 },
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async e => {
    /* eslint-disable-next-line no-console */
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
