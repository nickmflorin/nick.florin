import "server-only";
import { cache } from "react";

import { logger } from "~/application/logger";
import { prisma } from "~/prisma/client";
import { type Profile } from "~/prisma/model";

export const preload = () => {
  void getProfile();
};

export const getProfile = cache(async (): Promise<Profile | null> => {
  const profiles = await prisma.profile.findMany({ orderBy: { createdAt: "desc" }, take: 1 });
  if (profiles.length === 0) {
    logger.error(
      "No profile found!  The layout will not include the social buttons in the header.",
    );
    return null;
  }
  return profiles[0];
});
