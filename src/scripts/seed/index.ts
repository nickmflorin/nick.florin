import { db } from '~/database/prisma';
import { cli } from '~/scripts';

import { calculateSkillExperiences } from './calculate-skill-experiences';
import { seedCompanies } from './seed-companies';
import { seedProfile } from './seed-profile';
import { seedProjects } from './seed-projects';
import { seedRepositories } from './seed-repositories';
import { seedResumes } from './seed-resumes';
import { seedSchools } from './seed-schools';
import { seedSkills } from './seed-skills';

const script: cli.Script = async ctx => {
  await db.$transaction(
    async tx => {
      await seedProfile(tx, ctx);
      await seedResumes(tx, ctx);
      // Must be done before projects, repositories, schools & companies.
      await seedSkills(tx, ctx);
      // Must be done after skills but before projects.
      await seedRepositories(tx, ctx);
      // Must be done after skills, but before schools and companies.
      await seedProjects(tx, ctx);
      await seedSchools(tx, ctx);
      await seedCompanies(tx, ctx);
      // Must be done after all skill-related models have been created.
      await calculateSkillExperiences(tx, ctx);
    },
    { timeout: 500000 },
  );
};

void cli.runScript(script, { devOnly: false, upsertUser: true });
