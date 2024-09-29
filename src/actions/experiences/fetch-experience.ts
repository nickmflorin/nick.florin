import {
  type ApiExperience,
  removeRedundantTopLevelSkills,
  type ExperienceIncludes,
  DetailEntityType,
  fieldIsIncluded,
} from "~/database/model";
import { db } from "~/database/prisma";

import { standardDetailFetchAction, type StandardFetchActionReturn } from "~/actions";
import { ApiClientGlobalError } from "~/api";

export const fetchExperience = <I extends ExperienceIncludes>(includes: I) =>
  standardDetailFetchAction(
    async (id, _, { isAdmin, isVisible }): StandardFetchActionReturn<ApiExperience<I>> => {
      let experience = (await db.experience.findUnique({
        where: { id },
        include: {
          company: true,
          skills: fieldIsIncluded("skills", includes)
            ? { where: { visible: isVisible } }
            : undefined,
        },
      })) as ApiExperience<I>;

      if (!experience) {
        return ApiClientGlobalError.NotFound({
          message: "The experience could not be found.",
        });
      } else if (!isAdmin && !experience.visible) {
        ApiClientGlobalError.Forbidden({
          message: "The user does not have permission to access this data.",
        });
      }
      if (fieldIsIncluded("details", includes)) {
        experience = removeRedundantTopLevelSkills({
          ...experience,
          details: await db.detail.findMany({
            where: {
              entityType: DetailEntityType.EXPERIENCE,
              entityId: { in: [experience.id] },
              visible: isVisible,
            },
            include: {
              project: {
                include: {
                  skills: fieldIsIncluded("skills", includes)
                    ? { where: { visible: isVisible } }
                    : undefined,
                },
              },
              skills: fieldIsIncluded("skills", includes)
                ? { where: { visible: isVisible } }
                : undefined,
              nestedDetails: {
                orderBy: [{ createdAt: "desc" }, { id: "desc" }],
                where: {
                  visible: isVisible,
                },
                include: {
                  skills: fieldIsIncluded("skills", includes)
                    ? { where: { visible: isVisible } }
                    : undefined,
                  project: {
                    include: {
                      skills: fieldIsIncluded("skills", includes)
                        ? { where: { visible: isVisible } }
                        : undefined,
                    },
                  },
                },
              },
            },
          }),
        } as ApiExperience<I>);
      }
      return experience as ApiExperience<I>;
    },
    { authenticated: false, adminOnly: false },
  );
