import "server-only";

import { cache } from "react";

import { getClerkAuthedUser } from "~/application/auth/server";
import { logger } from "~/internal/logger";
import { humanizeList } from "~/lib/formatters";
import { isUuid } from "~/lib/typeguards";
import { prisma } from "~/database/prisma";
import {
  type DetailEntityType,
  type DetailEntity,
  type ApiDetail,
  type DetailIncludes,
  fieldIsIncluded,
} from "~/database/model";

import { type ApiStandardDetailQuery, type Visibility } from "~/api/query";
import { convertToPlainObject } from "~/api/serialization";

import { getEntity } from "../get-entity";

export type GetDetailsParams<I extends DetailIncludes> = ApiStandardDetailQuery<I>;

/*
Note: (r.e. Ordering):
---------------------
In order to prevent the details from shifting around in the form whenever a page refresh is
performed after one or more details are modified, we need to rely on a consistent ordering of the
details based on attributes that are indepenedent of modifications to the details.

For instance, if we were to use the 'updatedAt' field to order the details, then the details would
shift around everytime one of them was modified in the frontend.

Instead, we use the 'createdAt' field to order the details - but there is one caveat: because some
of the details are created during the seeding process in a script, the 'createdAt' values can be
exactly the same - which can still lead to details shifting around in the frontend after one or more
are modified.  While this is an edge case, and wouldn't happen in practice (outside of a seeding
process), since we do want to allow the data in the application to be seeded for flexibility, we
have to account for it.

To account for this, the 'id' field is used as a secondary ordering attribute, which is guaranteed
to be unique and not change, for each detail.  Then, the sorting is performed first based on whether
or not the 'createdAt' values are the same, and if they are, the 'id' field is used as a fallback.
*/
export const getDetails = cache(
  async <T extends DetailEntityType, I extends DetailIncludes>(
    ids: string[],
    entityType: T,
    { includes, visibility }: GetDetailsParams<I>,
  ): Promise<ApiDetail<I>[]> => {
    await getClerkAuthedUser({ strict: visibility === "admin" });

    const invalid = ids.filter(id => !isUuid(id));
    if (invalid.length > 0) {
      logger.error(
        `The id(s) ${humanizeList(invalid, {
          conjunction: "and",
          formatter: v => `'${v}'`,
        })} are not valid UUID(s).`,
        { invalid },
      );
    }
    const details = await prisma.detail.findMany({
      where: {
        entityId: { in: ids.filter(isUuid) },
        entityType: entityType,
        visible: visibility === "public" ? true : undefined,
      },
      include: {
        project: {
          include: {
            skills: fieldIsIncluded("skills", includes)
              ? { where: { visible: visibility === "public" ? true : undefined } }
              : undefined,
          },
        },
        skills: fieldIsIncluded("skills", includes)
          ? { where: { visible: visibility === "public" ? true : undefined } }
          : undefined,
        nestedDetails: fieldIsIncluded("nestedDetails", includes)
          ? {
              /* Accounts for cases where multiple details were created at the same time due to
             seeding. */
              orderBy: [{ createdAt: "desc" }, { id: "desc" }],
              include: {
                skills: fieldIsIncluded("skills", includes)
                  ? { where: { visible: visibility === "public" ? true : undefined } }
                  : undefined,
                project: {
                  include: {
                    skills: fieldIsIncluded("skills", includes)
                      ? { where: { visible: visibility === "public" ? true : undefined } }
                      : undefined,
                  },
                },
              },
            }
          : undefined,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
    return details.map(convertToPlainObject) as ApiDetail<I>[];
  },
) as {
  <T extends DetailEntityType, I extends DetailIncludes>(
    ids: string[],
    entityType: T,
    params: { includes: I; visibility: Visibility },
  ): Promise<ApiDetail<I>[]>;
};

export const getEntityDetails = cache(
  async <T extends DetailEntityType, I extends DetailIncludes>(
    id: string,
    entityType: T,
    params: { includes: I; visibility: Visibility },
  ): Promise<{ details: ApiDetail<I>[]; entity: DetailEntity<T> } | null> => {
    const entity: DetailEntity<T> | null = await getEntity(id, entityType);
    if (!entity) {
      return null;
    }
    const details = await getDetails([id], entityType, params);
    return { details, entity };
  },
) as {
  <T extends DetailEntityType, I extends DetailIncludes>(
    id: string,
    entityType: T,
    params: { includes: I; visibility: Visibility },
  ): Promise<{ details: ApiDetail<I>[]; entity: DetailEntity<T> } | null>;
};
