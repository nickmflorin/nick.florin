import { prisma } from "~/prisma/client";
import { getScriptContext } from "~/prisma/scripts/context";

import { calculateSkillExperiences } from "./calculate-skill-experiences";
import { seedCompanies } from "./seed-companies";
import { seedProfile } from "./seed-profile";
import { seedProjects } from "./seed-projects";
import { seedRepositories } from "./seed-repositories";
import { seedResumes } from "./seed-resumes";
import { seedSchools } from "./seed-schools";
import { seedSkills } from "./seed-skills";

async function main() {
  await prisma.$transaction(
    async tx => {
      const ctx = await getScriptContext(tx, { upsertUser: true });

      await seedProfile(tx, ctx);
      await seedResumes(tx, ctx);
      await seedSkills(tx, ctx); // Must be done before projects, repositories, schools & companies.
      await seedRepositories(tx, ctx); // Must be done after skills but before projects.
      await seedProjects(tx, ctx); // Must be done after skills, but before schools and companies.
      await seedSchools(tx, ctx);
      await seedCompanies(tx, ctx);
      // Must be done after all skill-related models have been created.
      await calculateSkillExperiences(tx, ctx);
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
