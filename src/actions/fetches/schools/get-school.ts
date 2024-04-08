import "server-only";
import { cache } from "react";

import { prisma, isPrismaDoesNotExistError, isPrismaInvalidIdError } from "~/prisma/client";
import { type BrandSchool } from "~/prisma/model";

export const preloadSchool = (id: string) => {
  void getSchool(id);
};

export const getSchool = cache(async (id: string): Promise<BrandSchool | null> => {
  try {
    return await prisma.school.findUniqueOrThrow({
      where: { id },
    });
  } catch (e) {
    if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
      return null;
    }
    throw e;
  }
});
