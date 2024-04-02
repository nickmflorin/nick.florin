import "server-only";
import { cache } from "react";

import { prisma } from "~/prisma/client";
import {
  type DetailEntityType,
  type DetailEntity,
  type ApiDetail,
  type DetailIncludes,
  type NestedApiDetail,
} from "~/prisma/model";

import { getEntity } from "../get-entity";

export const preloadDetails = <T extends DetailEntityType, I extends DetailIncludes>(
  id: string,
  entityType: T,
  params: { includes: I },
) => {
  void getDetails(id, entityType, params);
};

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
// Note: This is currently only used for the admin, so visibility is not applicable.
export const getDetails = cache(
  async <T extends DetailEntityType, I extends DetailIncludes>(
    id: string,
    entityType: T,
    { includes }: { includes: I },
  ): Promise<{ details: ApiDetail<I>[]; entity: DetailEntity<T> } | null> => {
    const entity: DetailEntity<T> | null = await getEntity(id, entityType);
    if (!entity) {
      return null;
    }

    if (includes.skills && includes.nestedDetails) {
      const baseDetails = await prisma.detail.findMany({
        where: { entityId: entity.id, entityType: entityType },
        include: {
          project: true,
          skills: true,
          nestedDetails: {
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            include: { skills: true, project: true },
          },
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      });

      // TODO: Figure out how to optimize based on both the details and their nested details...
      const skills = await prisma.skill.findMany({});

      const toApiDetail = ({
        skills: _skills,
        nestedDetails,
        ...detail
      }: (typeof baseDetails)[number]): ApiDetail<{ skills: true; nestedDetails: true }> => ({
        ...detail,
        skills: skills.filter(sk => _skills.some(d => d.skillId === sk.id)),
        nestedDetails: nestedDetails.map(
          ({ skills: _ndSkills, ...nd }): NestedApiDetail<{ skills: true }> => ({
            ...nd,
            skills: skills.filter(sk => _ndSkills.some(d => d.skillId === sk.id)),
          }),
        ),
      });

      return {
        details: baseDetails.map(detail => toApiDetail(detail) as ApiDetail<I>),
        entity,
      };
    } else if (includes.skills) {
      const baseDetails = await prisma.detail.findMany({
        where: { entityId: entity.id, entityType: entityType },
        include: {
          project: true,
          skills: true,
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      });

      // TODO: Figure out how to optimize based on both the details and their nested details...
      const skills = await prisma.skill.findMany({});

      const toApiDetail = ({
        skills: _skills,
        ...detail
      }: (typeof baseDetails)[number]): ApiDetail<{ skills: true; nestedDetails: false }> => ({
        ...detail,
        skills: skills.filter(sk => _skills.some(d => d.skillId === sk.id)),
      });
      return {
        details: baseDetails.map(detail => toApiDetail(detail) as ApiDetail<I>),
        entity,
      };
    } else if (includes.nestedDetails) {
      const details = await prisma.detail.findMany({
        where: { entityId: entity.id, entityType: entityType },
        include: {
          project: true,
          nestedDetails: {
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            include: { skills: true, project: true },
          },
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      });
      const toApiDetail = (
        detail: (typeof details)[number],
      ): ApiDetail<{ skills: false; nestedDetails: true }> => detail;

      return {
        details: details.map(d => toApiDetail(d)) as ApiDetail<I>[],
        entity,
      };
    } else {
      const details = await prisma.detail.findMany({
        where: { entityId: entity.id, entityType: entityType },
        include: {
          project: true,
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      });
      const toApiDetail = (
        detail: (typeof details)[number],
      ): ApiDetail<{ skills: false; nestedDetails: false }> => detail;
      return {
        details: details.map(d => toApiDetail(d)) as ApiDetail<I>[],
        entity,
      };
    }
  },
) as {
  <T extends DetailEntityType, I extends DetailIncludes>(
    id: string,
    entityType: T,
    { includes }: { includes: I },
  ): Promise<{ details: ApiDetail<I>[]; entity: DetailEntity<T> } | null>;
};
