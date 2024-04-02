import "server-only";
import { cache } from "react";

import { prisma } from "~/prisma/client";
import {
  type DetailEntityType,
  type DetailEntity,
  type ApiDetail,
  type DetailIncludes,
  type NestedApiDetail,
  type Project,
} from "~/prisma/model";
import { type Visibility } from "~/api/query";

import { getEntity } from "../get-entity";

const hasNested = (
  details: ApiDetail<null, Project>[] | ApiDetail<{ nestedDetails: true }, Project>[],
): details is ApiDetail<{ nestedDetails: true }, Project>[] =>
  details.length !== 0 &&
  (details as ApiDetail<{ nestedDetails: true }, Project>[])[0].nestedDetails !== undefined;

const getDetailsSkills = async (
  details: ApiDetail<null, Project>[] | ApiDetail<{ nestedDetails: true }, Project>[],
  { visibility = "public" }: { visibility: Visibility },
) => {
  const projects = [...details]
    .reduce(
      (
        prev: (Project | null)[],
        curr: ApiDetail<null, Project> | ApiDetail<{ nestedDetails: true }, Project>,
      ) => [
        ...prev,
        curr.project,
        ...((curr as ApiDetail<{ nestedDetails: true }>).nestedDetails ?? []).map(nd => nd.project),
      ],
      [],
    )
    .filter((p): p is Project => p !== null);
  return await prisma.skill.findMany({
    where: {
      AND: [
        { visible: visibility === "public" ? true : undefined },
        {
          OR: [
            { details: { some: { detailId: { in: details.map(d => d.id) } } } },
            { projects: { some: { projectId: { in: projects.map(p => p.id) } } } },
            {
              nestedDetails: hasNested(details)
                ? {
                    some: {
                      nestedDetailId: {
                        in: details.flatMap(det => det.nestedDetails.map(d => d.id)),
                      },
                    },
                  }
                : undefined,
            },
          ],
        },
      ],
    },
  });
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
export const getDetails = cache(
  async <T extends DetailEntityType, I extends DetailIncludes>(
    ids: string[],
    entityType: T,
    { includes, visibility = "public" }: { includes: I; visibility?: Visibility },
  ): Promise<ApiDetail<I>[]> => {
    if (includes.skills && includes.nestedDetails) {
      const details = await prisma.detail.findMany({
        where: {
          entityId: { in: ids },
          entityType: entityType,
          visible: visibility === "public" ? true : undefined,
        },
        include: {
          project: { include: { skills: true } },
          skills: true,
          nestedDetails: {
            /* Accounts for cases where multiple details were created at the same time due to
               seeding. */
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            include: { skills: true, project: { include: { skills: true } } },
          },
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      });
      // The skills for all projects, details and nested details associated with the entity(s).
      const skills = await getDetailsSkills(details, { visibility });
      return details.map(
        ({
          skills: _skills,
          nestedDetails,
          project,
          ...d
        }): ApiDetail<{ skills: true; nestedDetails: true }> => ({
          ...d,
          project: project
            ? {
                ...project,
                skills: skills.filter(sk => project.skills.some(d => d.skillId === sk.id)),
              }
            : null,
          /* Include skills for each Detail by identifying the skills in the overall set that have
             IDs in the Detail's skills array. */
          skills: skills.filter(sk => _skills.some(d => d.skillId === sk.id)),
          nestedDetails: nestedDetails.map(
            ({
              skills: _ndSkills,
              project: nestedProject,
              ...nd
            }): NestedApiDetail<{ skills: true }> => ({
              ...nd,
              project: nestedProject
                ? {
                    ...nestedProject,
                    skills: skills.filter(sk =>
                      nestedProject.skills.some(d => d.skillId === sk.id),
                    ),
                  }
                : null,
              /* Include skills for each NestedDetail by identifying the skills in the overall set
                 that have IDs in the NestedDetail's skills array. */
              skills: skills.filter(sk => _ndSkills.some(d => d.nestedDetailId === sk.id)),
            }),
          ),
        }),
      ) as ApiDetail<I>[];
    } else if (includes.skills) {
      const details = await prisma.detail.findMany({
        where: {
          entityId: { in: ids },
          entityType: entityType,
          visible: visibility === "public" ? true : undefined,
        },
        include: {
          project: { include: { skills: true } },
          skills: true,
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      });

      const skills = await getDetailsSkills(details, { visibility });

      return details.map(
        ({
          skills: _skills,
          project,
          ...d
        }): ApiDetail<{ skills: true; nestedDetails: false }> => ({
          ...d,
          project: project
            ? {
                ...project,
                skills: skills.filter(sk => project.skills.some(d => d.skillId === sk.id)),
              }
            : null,
          /* Include skills for each Detail by identifying the skills in the overall set that have
             IDs in the Detail's skills array. */
          skills: skills.filter(sk => _skills.some(d => d.skillId === sk.id)),
        }),
      ) as ApiDetail<I>[];
    } else if (includes.nestedDetails) {
      return (await prisma.detail.findMany({
        where: {
          entityId: { in: ids },
          entityType: entityType,
          visible: visibility === "public" ? true : undefined,
        },
        include: {
          project: true,
          nestedDetails: {
            /* Accounts for cases where multiple details were created at the same time due to
               seeding. */
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            include: { project: true },
          },
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      })) as ApiDetail<I>[];
    } else {
      return (await prisma.detail.findMany({
        where: {
          entityId: { in: ids },
          entityType: entityType,
          visible: visibility === "public" ? true : undefined,
        },
        include: { project: true },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      })) as ApiDetail<I>[];
    }
  },
) as {
  <T extends DetailEntityType, I extends DetailIncludes>(
    ids: string[],
    entityType: T,
    params: { includes: I; visibility?: Visibility },
  ): Promise<ApiDetail<I>[]>;
};

export const getEntityDetails = cache(
  async <T extends DetailEntityType, I extends DetailIncludes>(
    id: string,
    entityType: T,
    params: { includes: I; visibility?: Visibility },
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
    params: { includes: I; visibility?: Visibility },
  ): Promise<{ details: ApiDetail<I>[]; entity: DetailEntity<T> } | null>;
};
