import "server-only";

import { cache } from "react";

import { type Profile } from "~/database/model";
import { db } from "~/database/prisma";
import { logger } from "~/internal/logger";

import { convertToPlainObject } from "~/api/serialization";

export const preloadProfile = () => {
  void getProfile();
};

export const getProfile = cache(async (): Promise<Profile | null> => {
  const profiles = await db.profile.findMany({ orderBy: { createdAt: "desc" }, take: 1 });
  if (profiles.length === 0) {
    logger.error(
      "No profile found!  The layout will not include the social buttons in the header.",
    );
    return null;
  }
  return convertToPlainObject(profiles[0]);
});
