import type { ApiCourse, CourseIncludes } from "~/database/model";
import { fieldIsIncluded } from "~/database/model";
import { db } from "~/database/prisma";

import { standardDetailFetchAction, type StandardFetchActionReturn } from "~/actions-v2";
import { ApiClientGlobalError } from "~/api-v2";

export const fetchCourse = <I extends CourseIncludes>(includes: I) =>
  standardDetailFetchAction(
    async (id, _, { isAdmin, isVisible }): StandardFetchActionReturn<ApiCourse<I>> => {
      const course = (await db.course.findUnique({
        where: { id },
        include: {
          education: fieldIsIncluded("education", includes)
            ? { include: { school: true } }
            : undefined,
          skills: fieldIsIncluded("skills", includes)
            ? { where: { visible: isVisible } }
            : undefined,
        },
      })) as ApiCourse<I>;
      if (!course) {
        return ApiClientGlobalError.NotFound({
          message: "The course could not be found.",
        });
      } else if (!isAdmin && !course.visible) {
        ApiClientGlobalError.Forbidden({
          message: "The user does not have permission to access this data.",
        });
      }
      return course as ApiCourse<I>;
    },
    { authenticated: false, adminOnly: false },
  );
