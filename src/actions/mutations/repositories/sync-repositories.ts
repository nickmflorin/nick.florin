"use server";
import { getAuthedUser } from "~/application/auth/server";
import { db } from "~/database/prisma";

import { githubClient } from "~/integrations/github";

export const syncRepositories = async () => {
  const { user } = await getAuthedUser();
  await db.$transaction(async tx => {
    await githubClient.syncRepositories({ tx, user });
  });
};
