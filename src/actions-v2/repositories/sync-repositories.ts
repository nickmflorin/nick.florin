"use server";
import { getAuthedUser } from "~/application/auth/server-v2";
import { db } from "~/database/prisma";

import { type MutationActionResponse } from "~/actions-v2";
import { ApiClientGlobalError } from "~/api-v2";
import { githubClient } from "~/integrations/github";

export const syncRepositories = async (): Promise<MutationActionResponse<{ message: string }>> => {
  const { error, user, isAdmin } = await getAuthedUser();
  if (error) {
    return { error: error.json };
  } else if (!isAdmin) {
    return {
      error: ApiClientGlobalError.Forbidden({}).json,
    };
  }
  return await db.$transaction(async tx => {
    await githubClient.syncRepositories({ tx, user });
    return { data: { message: "Repositories synced successfully" } };
  });
};
