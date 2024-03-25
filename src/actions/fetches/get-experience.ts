import "server-only";
import { cache } from "react";

import { prisma, isPrismaDoesNotExistError, isPrismaInvalidIdError } from "~/prisma/client";
import { type ApiExperience } from "~/prisma/model";

export const preloadExperience = (id: string) => {
  void getExperience(id);
};

export const getExperience = cache(async (id: string): Promise<ApiExperience | null> => {
  try {
    // Note: This is currently only used for the admin, so visibility is not applicable.
    return await prisma.experience.findUniqueOrThrow({
      where: { id },
      include: { company: true },
    });
  } catch (e) {
    if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
      return null;
    }
    throw e;
  }
});
