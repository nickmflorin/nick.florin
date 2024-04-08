import "server-only";
import { cache } from "react";

import { prisma, isPrismaDoesNotExistError, isPrismaInvalidIdError } from "~/prisma/client";
import { type BrandProject } from "~/prisma/model";

export const preloadProject = (id: string) => {
  void getProject(id);
};

export const getProject = cache(async (id: string): Promise<BrandProject | null> => {
  try {
    return await prisma.project.findUniqueOrThrow({
      where: { id },
    });
  } catch (e) {
    if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
      return null;
    }
    throw e;
  }
});
