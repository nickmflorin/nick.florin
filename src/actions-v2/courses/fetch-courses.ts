import { type Required } from "utility-types";

import type { ApiCourse, CourseIncludes } from "~/database/model";
import { fieldIsIncluded } from "~/database/model";
import { db } from "~/database/prisma";
import { conditionalFilters } from "~/database/util";

import { visibilityIsAdmin } from "~/actions-v2";
import {
  constructTableSearchClause,
  PAGE_SIZES,
  type ServerSidePaginationParams,
  isVisible,
  clampPagination,
  type CoursesControls,
  standardFetchAction,
  getCoursesOrdering,
  type StandardFetchActionReturn,
} from "~/actions-v2";
import { ApiClientGlobalError } from "~/api-v2";

const filtersClause = ({ filters, visibility }: Pick<CoursesControls, "filters" | "visibility">) =>
  conditionalFilters([
    filters.search ? constructTableSearchClause("course", filters.search) : undefined,
    filters.educations && filters.educations.length !== 0
      ? { educationId: { in: filters.educations } }
      : undefined,
    filters.skills && filters.skills.length !== 0
      ? { skills: { some: { id: { in: filters.skills } } } }
      : undefined,
    { visible: isVisible(visibility, filters.visible) },
  ] as const);

const whereClause = ({ filters, visibility }: Pick<CoursesControls, "filters" | "visibility">) => {
  const clause = filtersClause({ filters, visibility });
  if (clause.length !== 0) {
    return { AND: [...clause] };
  }
  return {};
};

export const fetchCoursesCount = standardFetchAction(
  async ({
    filters,
    visibility,
  }: Pick<CoursesControls, "filters" | "visibility">): StandardFetchActionReturn<{
    count: number;
  }> => {
    /* This check may be redundant, because of the 'adminOnly' flag in the standard fetch action
       method - but we want to include this just in case. */
    if (!visibilityIsAdmin(visibility) && filters.visible === false) {
      return ApiClientGlobalError.Forbidden({
        message: "The user does not have permission to access this data.",
      });
    }
    const count = await db.course.count({ where: whereClause({ filters, visibility }) });
    return { count };
  },
  { authenticated: true, adminOnly: true },
);

export const fetchCoursesPagination = standardFetchAction(
  async ({
    filters,
    page,
    visibility,
  }: Required<
    Pick<CoursesControls, "filters" | "visibility" | "page">,
    "page"
  >): StandardFetchActionReturn<ServerSidePaginationParams> => {
    /* This check may be redundant, because of the 'adminOnly' flag in the standard fetch action
       method - but we want to include this just in case. */
    if (!visibilityIsAdmin(visibility) && filters.visible === false) {
      return ApiClientGlobalError.Forbidden({
        message: "The user does not have permission to access this data.",
      });
    }
    const count = await db.course.count({
      where: whereClause({ filters, visibility }),
    });
    return clampPagination({ count, page, pageSize: PAGE_SIZES.course });
  },
  { authenticated: true, adminOnly: true },
);

export const fetchCourses = <I extends CourseIncludes>(includes: I) =>
  standardFetchAction(
    async ({
      filters,
      ordering,
      page,
      limit,
      visibility,
    }: Omit<CoursesControls<I>, "includes">): StandardFetchActionReturn<ApiCourse<I>[]> => {
      if (!visibilityIsAdmin(visibility) && filters.visible === false) {
        return ApiClientGlobalError.Forbidden({
          message: "The user does not have permission to access this data.",
        });
      }
      let pagination: Omit<ServerSidePaginationParams, "count"> | null = null;
      if (page !== undefined) {
        ({ data: pagination } = await fetchCoursesPagination(
          { filters, page, visibility },
          { strict: true },
        ));
      }

      const courses = await db.course.findMany({
        where: whereClause({ filters, visibility }),
        include: {
          education: fieldIsIncluded("education", includes)
            ? { include: { school: true } }
            : undefined,
          skills: fieldIsIncluded("skills", includes)
            ? { where: { visible: isVisible(visibility, filters.visible) } }
            : undefined,
        },
        orderBy: getCoursesOrdering(ordering),
        skip: pagination ? pagination.pageSize * (pagination.page - 1) : undefined,
        take: pagination ? pagination.pageSize : limit,
      });
      return courses as ApiCourse<I>[];
    },
    { authenticated: true, adminOnly: true },
  );
