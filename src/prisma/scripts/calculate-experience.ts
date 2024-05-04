import { prisma } from "~/prisma/client";
import { calculateSkillsExperience } from "~/prisma/model";

async function main() {
  await prisma.$transaction(
    async tx => {
      const skill = await tx.skill.findUnique({ where: { slug: "tox" } });
      if (!skill) {
        throw new Error("Skill not found");
      }
      console.log({ experience: skill.experience });
      const result = await calculateSkillsExperience(tx, skill.id, {
        persist: false,
        returnAs: "experience",
      });
      console.info(result);
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
