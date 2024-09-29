import type { ApiCourse, CourseIncludes } from "~/database/model";
import { fieldIsIncluded } from "~/database/model";
import { db } from "~/database/prisma";
import { conditionalFilters } from "~/database/util";

import {
  constructTableSearchClause,
  PAGE_SIZES,
  type ServerSidePaginationParams,
  clampPagination,
  type CoursesControls,
  standardListFetchAction,
  getCoursesOrdering,
  type StandardFetchActionReturn,
  type ActionPaginationParams,
  type ActionCountParams,
  type ActionFilterParams,
} from "~/actions";

const filtersClause = ({ filters, filterIsVisible }: ActionFilterParams<CoursesControls>) =>
  conditionalFilters([
    filters.search ? constructTableSearchClause("course", filters.search) : undefined,
    filters.educations && filters.educations.length !== 0
      ? { educationId: { in: filters.educations } }
      : undefined,
    filters.skills && filters.skills.length !== 0
      ? { skills: { some: { id: { in: filters.skills } } } }
      : undefined,
    { visible: filterIsVisible(filters.visible) },
  ] as const);

const whereClause = ({ filters, filterIsVisible }: ActionFilterParams<CoursesControls>) => {
  const clause = filtersClause({ filters, filterIsVisible });
  if (clause.length !== 0) {
    return { AND: [...clause] };
  }
  return {};
};

export const fetchCoursesCount = standardListFetchAction(
  async (
    { filters }: ActionCountParams<CoursesControls>,
    { filterIsVisible },
  ): StandardFetchActionReturn<{
    count: number;
  }> => {
    const count = await db.course.count({ where: whereClause({ filters, filterIsVisible }) });
    return { count };
  },
  { authenticated: true, adminOnly: true },
);

export const fetchCoursesPagination = standardListFetchAction(
  async (
    { filters, page }: ActionPaginationParams<CoursesControls>,
    { filterIsVisible },
  ): StandardFetchActionReturn<ServerSidePaginationParams> => {
    const count = await db.course.count({
      where: whereClause({ filters, filterIsVisible }),
    });
    return clampPagination({ count, page, pageSize: PAGE_SIZES.course });
  },
  { authenticated: true, adminOnly: true },
);

export const fetchCourses = <I extends CourseIncludes>(includes: I) =>
  standardListFetchAction(
    async (
      { filters, ordering, page, limit, visibility }: Omit<CoursesControls<I>, "includes">,
      { filterIsVisible },
    ): StandardFetchActionReturn<ApiCourse<I>[]> => {
      let pagination: Omit<ServerSidePaginationParams, "count"> | null = null;
      if (page !== undefined) {
        ({ data: pagination } = await fetchCoursesPagination(
          { filters, page, visibility },
          { strict: true },
        ));
      }

      const courses = await db.course.findMany({
        where: whereClause({ filters, filterIsVisible }),
        include: {
          education: fieldIsIncluded("education", includes)
            ? { include: { school: true } }
            : undefined,
          skills: fieldIsIncluded("skills", includes)
            ? { where: { visible: filterIsVisible(filters.visible) } }
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
