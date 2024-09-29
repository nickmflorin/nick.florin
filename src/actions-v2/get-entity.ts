import "server-only";

import { cache } from "react";

import { type DetailEntity, DetailEntityType } from "~/database/model";
import { db } from "~/database/prisma";

export const getEntity = cache(
  async <T extends DetailEntityType>(
    id: string,
    entityType: DetailEntityType,
  ): Promise<DetailEntity<T> | null> => {
    switch (entityType) {
      case DetailEntityType.EDUCATION:
        return (await db.education.findUnique({ where: { id } })) as DetailEntity<T> | null;
      case DetailEntityType.EXPERIENCE:
        return (await db.experience.findUnique({ where: { id } })) as DetailEntity<T> | null;
    }
  },
);
