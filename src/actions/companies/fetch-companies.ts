import type { ApiCompany, CompanyIncludes } from "~/database/model";
import { fieldIsIncluded } from "~/database/model";
import { db } from "~/database/prisma";
import { conditionalFilters } from "~/database/util";

import {
  constructTableSearchClause,
  PAGE_SIZES,
  type ServerSidePaginationParams,
  clampPagination,
  type CompaniesControls,
  standardListFetchAction,
  getCompaniesOrdering,
  type StandardFetchActionReturn,
  type ActionPaginationParams,
  type ActionCountParams,
  type ActionFilterParams,
} from "~/actions";

const filtersClause = ({
  filters,
}: Omit<ActionFilterParams<CompaniesControls>, "filterIsVisible">) =>
  conditionalFilters([
    filters.search ? constructTableSearchClause("company", filters.search) : undefined,
    filters.experiences && filters.experiences.length !== 0
      ? { experiences: { some: { id: { in: filters.experiences } } } }
      : undefined,
  ] as const);

const whereClause = ({
  filters,
}: Omit<ActionFilterParams<CompaniesControls>, "filterIsVisible">) => {
  const clause = filtersClause({ filters });
  if (clause.length !== 0) {
    return { AND: [...clause] };
  }
  return {};
};

export const fetchCompaniesCount = standardListFetchAction(
  async ({
    filters,
  }: ActionCountParams<CompaniesControls>): StandardFetchActionReturn<{
    count: number;
  }> => {
    const count = await db.company.count({ where: whereClause({ filters }) });
    return { count };
  },
  { authenticated: true, adminOnly: true },
);

export const fetchCompaniesPagination = standardListFetchAction(
  async ({
    filters,
    page,
    /* eslint-disable-next-line max-len */
  }: ActionPaginationParams<CompaniesControls>): StandardFetchActionReturn<ServerSidePaginationParams> => {
    const count = await db.company.count({
      where: whereClause({ filters }),
    });
    return clampPagination({ count, page, pageSize: PAGE_SIZES.company });
  },
  { authenticated: true, adminOnly: true },
);

export const fetchCompanies = <I extends CompanyIncludes>(includes: I) =>
  standardListFetchAction(
    async (
      { filters, ordering, page, limit, visibility }: Omit<CompaniesControls<I>, "includes">,
      { isVisible },
    ): StandardFetchActionReturn<ApiCompany<I>[]> => {
      let pagination: Omit<ServerSidePaginationParams, "count"> | null = null;
      if (page !== undefined) {
        ({ data: pagination } = await fetchCompaniesPagination(
          { filters, page, visibility },
          { strict: true },
        ));
      }

      const companies = await db.company.findMany({
        where: whereClause({ filters }),
        include: {
          experiences: fieldIsIncluded("experiences", includes)
            ? { where: { visible: isVisible } }
            : undefined,
        },
        orderBy: getCompaniesOrdering(ordering),
        skip: pagination ? pagination.pageSize * (pagination.page - 1) : undefined,
        take: pagination ? pagination.pageSize : limit,
      });
      return companies as ApiCompany<I>[];
    },
    { authenticated: true, adminOnly: true },
  );
