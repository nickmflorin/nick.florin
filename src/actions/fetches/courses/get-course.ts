import "server-only";
import { cache } from "react";

import { prisma, isPrismaDoesNotExistError, isPrismaInvalidIdError } from "~/prisma/client";
import { type BrandCourse } from "~/prisma/model";
import { convertToPlainObject } from "~/actions/fetches/serialization";

export const preloadCourse = (id: string) => {
  void getCourse(id);
};

export const getCourse = cache(async (id: string): Promise<BrandCourse | null> => {
  try {
    return convertToPlainObject(
      await prisma.course.findUniqueOrThrow({
        where: { id },
      }),
    );
  } catch (e) {
    if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
      return null;
    }
    throw e;
  }
});
