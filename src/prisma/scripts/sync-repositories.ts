import { prisma } from "~/prisma/client";

import { githubClient } from "~/integrations/github";

import { getScriptContext } from "./context";

async function main() {
  await prisma.$transaction(
    async tx => {
      const ctx = await getScriptContext(tx, { upsertUser: true });
      await githubClient.syncRepositories({ tx, user: ctx.user });
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
