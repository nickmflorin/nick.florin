import type { ApiSchool, SchoolIncludes } from "~/database/model";
import { fieldIsIncluded } from "~/database/model";
import { db } from "~/database/prisma";
import { conditionalFilters } from "~/database/util";

import {
  constructTableSearchClause,
  PAGE_SIZES,
  type ServerSidePaginationParams,
  clampPagination,
  type SchoolsControls,
  standardListFetchAction,
  getSchoolsOrdering,
  type StandardFetchActionReturn,
  type ActionPaginationParams,
  type ActionCountParams,
  type ActionFilterParams,
} from "~/actions-v2";

const filtersClause = ({ filters }: Omit<ActionFilterParams<SchoolsControls>, "filterIsVisible">) =>
  conditionalFilters([
    filters.search ? constructTableSearchClause("school", filters.search) : undefined,
    filters.educations && filters.educations.length !== 0
      ? { educations: { some: { id: { in: filters.educations } } } }
      : undefined,
  ] as const);

const whereClause = ({ filters }: Omit<ActionFilterParams<SchoolsControls>, "filterIsVisible">) => {
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
  { authenticated: true, adminOnly: true },
);

export const fetchSchoolsPagination = standardListFetchAction(
  async ({
    filters,
    page,
    /* eslint-disable-next-line max-len */
  }: ActionPaginationParams<SchoolsControls>): StandardFetchActionReturn<ServerSidePaginationParams> => {
    const count = await db.school.count({
      where: whereClause({ filters }),
    });
    return clampPagination({ count, page, pageSize: PAGE_SIZES.school });
  },
  { authenticated: true, adminOnly: true },
);

export const fetchSchools = <I extends SchoolIncludes>(includes: I) =>
  standardListFetchAction(
    async (
      { filters, ordering, page, limit, visibility }: Omit<SchoolsControls<I>, "includes">,
      { isVisible },
    ): StandardFetchActionReturn<ApiSchool<I>[]> => {
      let pagination: Omit<ServerSidePaginationParams, "count"> | null = null;
      if (page !== undefined) {
        ({ data: pagination } = await fetchSchoolsPagination(
          { filters, page, visibility },
          { strict: true },
        ));
      }

      const schools = await db.school.findMany({
        where: whereClause({ filters }),
        include: {
          educations: fieldIsIncluded("educations", includes)
            ? { where: { visible: isVisible } }
            : undefined,
        },
        orderBy: getSchoolsOrdering(ordering),
        skip: pagination ? pagination.pageSize * (pagination.page - 1) : undefined,
        take: pagination ? pagination.pageSize : limit,
      });
      return schools as ApiSchool<I>[];
    },
    { authenticated: true, adminOnly: true },
  );
