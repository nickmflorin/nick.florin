import "server-only";
import { cache } from "react";

import { prisma, isPrismaDoesNotExistError, isPrismaInvalidIdError } from "~/prisma/client";
import { type Company } from "~/prisma/model";

export const preloadCompany = (id: string) => {
  void getCompany(id);
};

export const getCompany = cache(async (id: string): Promise<Company | null> => {
  try {
    return await prisma.company.findUniqueOrThrow({
      where: { id },
    });
  } catch (e) {
    if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
      return null;
    }
    throw e;
  }
});
