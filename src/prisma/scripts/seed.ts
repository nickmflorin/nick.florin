import clerk from "@clerk/clerk-sdk-node";

import { prisma } from "../client";
import { upsertUserFromClerk } from "../model/user";

import {
  seedSchools,
  seedCompanies,
  type SeedContext,
  seedProfile,
  seedSkills,
  seedProjects,
  seedRepositories,
} from "./seeding";

async function main() {
  const personalClerkId = process.env.PERSONAL_CLERK_USER_ID;
  if (personalClerkId === undefined) {
    /* The only reason this value can be undefined is because is for the test environment - so as
       long as we are not running the seed process in a test environment, this check is just to
       satisfy TS. */
    throw new Error(
      "Cannot seed database without the 'PERSONAL_CLERK_USER_ID' as an environment variable.",
    );
  }
  const clerkUser = await clerk.users.getUser(personalClerkId);
  const ctx: SeedContext = {
    clerkUser,
    user: await upsertUserFromClerk(clerkUser, { isAdmin: true }),
  };
  await seedProfile(ctx);
  await seedRepositories(ctx); // Must be done before skills and projects.
  await seedSkills(ctx); // Must be done before projects, schools & companies.
  await seedProjects(ctx); // Must be done after skills, but before schools and companies.
  await seedSchools(ctx);
  await seedCompanies(ctx);
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
