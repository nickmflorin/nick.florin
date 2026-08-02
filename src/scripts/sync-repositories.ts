import { db } from '~/database/prisma';
import { cli } from '~/scripts';

import { githubClient } from '~/integrations/github';

const script: cli.Script = async ctx => {
  await db.$transaction(
    async tx => {
      await githubClient.syncRepositories({ tx, user: ctx.user });
    },
    { timeout: 500000 },
  );
};

void cli.runScript(script, { devOnly: false, upsertUser: false });
