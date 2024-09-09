import "server-only";

import { cache } from "react";

import { prisma, isPrismaDoesNotExistError, isPrismaInvalidIdError } from "~/prisma/client";
import { type DetailEntity, DetailEntityType } from "~/prisma/model";

import { convertToPlainObject } from "~/api/serialization";

export const getEntity = cache(
  async <T extends DetailEntityType>(
    id: string,
    entityType: DetailEntityType,
  ): Promise<DetailEntity<T> | null> => {
    switch (entityType) {
      case DetailEntityType.EDUCATION:
        try {
          return convertToPlainObject(
            await prisma.education.findUniqueOrThrow({
              where: { id },
            }),
          ) as DetailEntity<T>;
        } catch (e) {
          if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
            return null;
          }
          throw e;
        }
      case DetailEntityType.EXPERIENCE:
        try {
          return convertToPlainObject(
            await prisma.experience.findUniqueOrThrow({
              where: { id },
            }),
          ) as DetailEntity<T>;
        } catch (e) {
          if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
            return null;
          }
          throw e;
        }
    }
  },
);
