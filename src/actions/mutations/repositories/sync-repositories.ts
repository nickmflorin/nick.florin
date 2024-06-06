"use server";
import { getAuthedUser } from "~/application/auth/server";
import { githubClient } from "~/integrations/github";

export const syncRepositories = async () => {
  const { user } = await getAuthedUser();
  await githubClient.syncRepositories({ user });
};
