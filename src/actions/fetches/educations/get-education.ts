import "server-only";
import { cache } from "react";

import { prisma, isPrismaDoesNotExistError, isPrismaInvalidIdError } from "~/prisma/client";
import { type ApiEducation } from "~/prisma/model";
import { convertToPlainObject } from "~/actions/fetches/serialization";

export const preloadEducation = (id: string) => {
  void getEducation(id);
};

export const getEducation = cache(async (id: string): Promise<ApiEducation | null> => {
  try {
    // Note: This is currently only used for the admin, so visibility is not applicable.
    return convertToPlainObject(
      await prisma.education.findUniqueOrThrow({
        where: { id },
        include: { school: true },
      }),
    );
  } catch (e) {
    if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
      return null;
    }
    throw e;
  }
});
