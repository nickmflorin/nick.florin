import "server-only";
import { cache } from "react";

import { prisma } from "~/prisma/client";
import { type DetailEntityType, type DetailEntity, type FullDetail } from "~/prisma/model";

import { getEntity } from "./get-entity";

export const preloadDetails = <T extends DetailEntityType>(id: string, entityType: T) => {
  void getDetails(id, entityType);
};

export const getDetails = cache(
  async <T extends DetailEntityType>(
    id: string,
    entityType: T,
  ): Promise<{ details: FullDetail[]; entity: DetailEntity<T> } | null> => {
    const entity = await getEntity(id, entityType);
    if (!entity) {
      return null;
    }
    return {
      details: await prisma.detail.findMany({
        where: { entityId: entity.id, entityType: entityType },
        include: { nestedDetails: true },
        /* In order to prevent the details from shifting around in the form whenever a page refresh
           is performed after one or more details are modified, we need to rely on a consistent
           ordering of the details based on attributes that are indepenedent of modifications to the
           details.

           For instance, if we were to use the 'updatedAt' field to order the details, then the
           details would shift around everytime one of them was modified in the frontend.

           Instead, we use the 'createdAt' field to order the details - but there is one caveat:
           because some of the details are created during the seeding process in a script, the
           'createdAt' values can be exactly the same - which can still lead to details shifting
           around in the frontend after one or more are modified.  While this is an edge case, and
           wouldn't happen in practice (outside of a seeding process), since we do want to allow the
           data in the application to be seeded for flexibility, we have to account for it.

           To account for this, the 'id' field is used as a secondary ordering attribute, which is
           guaranteed to be unique and not change, for each detail.  Then, the sorting is performed
           first based on whether or not the 'createdAt' values are the same, and if they are, the
           'id' field is used as a fallback. */
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      }),
      entity,
    } as { details: FullDetail[]; entity: DetailEntity<T> };
  },
);
