import { db } from "~/database/prisma";
import { cli } from "~/scripts";

import { githubClient } from "~/integrations/github";

const script: cli.Script = async ctx => {
  await db.$transaction(
    async tx => {
      await githubClient.syncRepositories({ tx, user: ctx.user });
    },
    { timeout: 500000 },
  );
};

cli.runScript(script, { upsertUser: false, devOnly: false });
