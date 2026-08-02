import { type ApiCourse, type CourseIncludes, fieldIsIncluded } from '~/database/model';
import { db } from '~/database/prisma';
import { conditionalFilters } from '~/database/util';

import {
  type ActionCountParams,
  type ActionFilterParams,
  type ActionPaginationParams,
  clampPagination,
  constructTableSearchClause,
  type CoursesControls,
  getCoursesOrdering,
  PAGE_SIZES,
  type ServerSidePaginationParams,
  type StandardFetchActionReturn,
  standardListFetchAction,
} from '~/actions';

const filtersClause = ({ filterIsVisible, filters }: ActionFilterParams<CoursesControls>) =>
  conditionalFilters([
    filters.search ? constructTableSearchClause('course', filters.search) : undefined,
    filters.educations && filters.educations.length !== 0
      ? { educationId: { in: filters.educations } }
      : undefined,
    filters.skills && filters.skills.length !== 0
      ? { skills: { some: { id: { in: filters.skills } } } }
      : undefined,
    { visible: filterIsVisible(filters.visible) },
  ] as const);

const whereClause = ({ filterIsVisible, filters }: ActionFilterParams<CoursesControls>) => {
  const clause = filtersClause({ filterIsVisible, filters });
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
    const count = await db.course.count({ where: whereClause({ filterIsVisible, filters }) });
    return { count };
  },
  { adminOnly: true, authenticated: true },
);

export const fetchCoursesPagination = standardListFetchAction(
  async (
    { filters, page }: ActionPaginationParams<CoursesControls>,
    { filterIsVisible },
  ): StandardFetchActionReturn<ServerSidePaginationParams> => {
    const count = await db.course.count({
      where: whereClause({ filterIsVisible, filters }),
    });
    return clampPagination({ count, page, pageSize: PAGE_SIZES.course });
  },
  { adminOnly: true, authenticated: true },
);

export const fetchCourses = <I extends CourseIncludes>(includes: I) =>
  standardListFetchAction(
    async (
      { filters, limit, ordering, page, visibility }: Omit<CoursesControls<I>, 'includes'>,
      { filterIsVisible },
    ): StandardFetchActionReturn<ApiCourse<I>[]> => {
      let pagination: null | Omit<ServerSidePaginationParams, 'count'> = null;
      if (page !== undefined) {
        ({ data: pagination } = await fetchCoursesPagination(
          { filters, page, visibility },
          { strict: true },
        ));
      }

      const courses = await db.course.findMany({
        include: {
          education: fieldIsIncluded('education', includes)
            ? { include: { school: true } }
            : undefined,
          skills: fieldIsIncluded('skills', includes)
            ? { where: { visible: filterIsVisible(filters.visible) } }
            : undefined,
        },
        orderBy: getCoursesOrdering(ordering),
        skip: pagination ? pagination.pageSize * (pagination.page - 1) : undefined,
        take: pagination ? pagination.pageSize : limit,
        where: whereClause({ filterIsVisible, filters }),
      });
      return courses as ApiCourse<I>[];
    },
    { adminOnly: true, authenticated: true },
  );
