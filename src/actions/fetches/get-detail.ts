import "server-only";
import { cache } from "react";

import { prisma, isPrismaDoesNotExistError, isPrismaInvalidIdError } from "~/prisma/client";
import { type Detail } from "~/prisma/model";

export const preloadDetail = (id: string) => {
  void getDetail(id);
};

export const getDetail = cache(async (id: string): Promise<Detail | null> => {
  try {
    return await prisma.detail.findUniqueOrThrow({
      where: { id },
    });
  } catch (e) {
    if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
      return null;
    }
    throw e;
  }
});
