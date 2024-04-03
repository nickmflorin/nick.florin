import "server-only";
import { cache } from "react";

import { prisma, isPrismaDoesNotExistError, isPrismaInvalidIdError } from "~/prisma/client";
import { type ApiDetail, type Project } from "~/prisma/model";

export const preloadDetail = (id: string) => {
  void getDetail(id);
};

export const getDetail = cache(async (id: string): Promise<ApiDetail<[], Project> | null> => {
  try {
    // Note: This is currently only used for the admin, so visibility is not applicable.
    return await prisma.detail.findUniqueOrThrow({
      where: { id },
      include: { project: true },
    });
  } catch (e) {
    if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
      return null;
    }
    throw e;
  }
});
