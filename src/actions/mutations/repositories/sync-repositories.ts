"use server";
import { getAuthedUser } from "~/application/auth/server";
import { prisma } from "~/prisma/client";

import { githubClient } from "~/integrations/github";

export const syncRepositories = async () => {
  const { user } = await getAuthedUser();
  await prisma.$transaction(async tx => {
    await githubClient.syncRepositories({ tx, user });
  });
};
