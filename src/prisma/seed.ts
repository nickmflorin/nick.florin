import clerk from "@clerk/clerk-sdk-node";

import { env } from "~/env.mjs";

import { upsertUserFromClerk } from "./clerk";
import { prisma } from "./client";
import { seedSchools, seedCompanies, type SeedContext, seedProfile, seedSkills } from "./seeding";

async function main() {
  if (env.PERSONAL_CLERK_USER_ID === undefined) {
    /* The only reason this value can be undefined is because is for the test environment - so as
       long as we are not running the seed process in a test environment, this check is just to
       satisfy TS. */
    throw new Error(
      "Cannot seed database without the 'PERSONAL_CLERK_USER_ID' as an environment variable.",
    );
  }
  const clerkUser = await clerk.users.getUser(env.PERSONAL_CLERK_USER_ID);
  const ctx: SeedContext = {
    clerkUser,
    user: await upsertUserFromClerk(clerkUser),
  };
  await seedProfile(ctx);
  await seedSkills(ctx); // Must be done first
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
