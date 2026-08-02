import { type ApiSchool, fieldIsIncluded, type SchoolIncludes } from '~/database/model';
import { db } from '~/database/prisma';
import { conditionalFilters } from '~/database/util';

import {
  type ActionCountParams,
  type ActionFilterParams,
  type ActionPaginationParams,
  clampPagination,
  constructTableSearchClause,
  getSchoolsOrdering,
  PAGE_SIZES,
  type SchoolsControls,
  type ServerSidePaginationParams,
  type StandardFetchActionReturn,
  standardListFetchAction,
} from '~/actions';

const filtersClause = ({ filters }: Omit<ActionFilterParams<SchoolsControls>, 'filterIsVisible'>) =>
  conditionalFilters([
    filters.search ? constructTableSearchClause('school', filters.search) : undefined,
    filters.educations && filters.educations.length !== 0
      ? { educations: { some: { id: { in: filters.educations } } } }
      : undefined,
  ] as const);

const whereClause = ({ filters }: Omit<ActionFilterParams<SchoolsControls>, 'filterIsVisible'>) => {
  const clause = filtersClause({ filters });
  if (clause.length !== 0) {
    return { AND: [...clause] };
  }
  return {};
};

export const fetchSchoolsCount = standardListFetchAction(
  async ({
    filters,
  }: ActionCountParams<SchoolsControls>): StandardFetchActionReturn<{
    count: number;
  }> => {
    const count = await db.school.count({ where: whereClause({ filters }) });
    return { count };
  },
  { adminOnly: true, authenticated: true },
);

export const fetchSchoolsPagination = standardListFetchAction(
  async (
    params: ActionPaginationParams<SchoolsControls>,
  ): StandardFetchActionReturn<ServerSidePaginationParams> => {
    const { filters, page } = params;
    const count = await db.school.count({
      where: whereClause({ filters }),
    });
    return clampPagination({ count, page, pageSize: PAGE_SIZES.school });
  },
  { adminOnly: true, authenticated: true },
);

export const fetchSchools = <I extends SchoolIncludes>(includes: I) =>
  standardListFetchAction(
    async (
      { filters, limit, ordering, page, visibility }: Omit<SchoolsControls<I>, 'includes'>,
      { isVisible },
    ): StandardFetchActionReturn<ApiSchool<I>[]> => {
      let pagination: null | Omit<ServerSidePaginationParams, 'count'> = null;
      if (page !== undefined) {
        ({ data: pagination } = await fetchSchoolsPagination(
          { filters, page, visibility },
          { strict: true },
        ));
      }

      const schools = await db.school.findMany({
        include: {
          educations: fieldIsIncluded('educations', includes)
            ? { where: { visible: isVisible } }
            : undefined,
        },
        orderBy: getSchoolsOrdering(ordering),
        skip: pagination ? pagination.pageSize * (pagination.page - 1) : undefined,
        take: pagination ? pagination.pageSize : limit,
        where: whereClause({ filters }),
      });
      return schools as ApiSchool<I>[];
    },
    { adminOnly: true, authenticated: true },
  );
