import "server-only";
import { cache } from "react";

import { prisma, isPrismaDoesNotExistError, isPrismaInvalidIdError } from "~/prisma/client";
import { type ApiEducation } from "~/prisma/model";

export const preloadEducation = (id: string) => {
  void getEducation(id);
};

export const getEducation = cache(async (id: string): Promise<ApiEducation | null> => {
  try {
    return await prisma.education.findUniqueOrThrow({
      where: { id },
      include: { school: true },
    });
  } catch (e) {
    if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
      return null;
    }
    throw e;
  }
});
