import {
  type ApiEducation,
  removeRedundantTopLevelSkills,
  type EducationIncludes,
  DetailEntityType,
  fieldIsIncluded,
} from "~/database/model";
import { db } from "~/database/prisma";

import { standardDetailFetchAction, type StandardFetchActionReturn } from "~/actions";
import { ApiClientGlobalError } from "~/api";

export const fetchEducation = <I extends EducationIncludes>(includes: I) =>
  standardDetailFetchAction(
    async (id, _, { isAdmin, isVisible }): StandardFetchActionReturn<ApiEducation<I>> => {
      const education = await db.education.findUnique({
        where: { id },
        include: {
          school: true,
          skills: fieldIsIncluded("skills", includes)
            ? { where: { visible: isVisible } }
            : undefined,
          courses: fieldIsIncluded("courses", includes)
            ? {
                where: { visible: isVisible },
                include: {
                  skills: fieldIsIncluded("skills", includes)
                    ? { where: { visible: isVisible } }
                    : undefined,
                },
              }
            : undefined,
        },
      });

      if (!education) {
        return ApiClientGlobalError.NotFound({
          message: "The education could not be found.",
        });
      } else if (!isAdmin && !education.visible) {
        ApiClientGlobalError.Forbidden({
          message: "The user does not have permission to access this data.",
        });
      }
      if (fieldIsIncluded("details", includes)) {
        const e = {
          ...education,
          details: await db.detail.findMany({
            where: {
              entityType: DetailEntityType.EDUCATION,
              entityId: { in: [education.id] },
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
        } as ApiEducation<I>;
        if (fieldIsIncluded("skills", includes)) {
          return removeRedundantTopLevelSkills(
            e as ApiEducation<["skills", "details"]>,
          ) as ApiEducation<I>;
        }
        return e;
      }
      return education as ApiEducation<I>;
    },
    { authenticated: false, adminOnly: false },
  );
