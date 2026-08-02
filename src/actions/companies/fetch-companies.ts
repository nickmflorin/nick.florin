import { type ApiCompany, type CompanyIncludes, fieldIsIncluded } from '~/database/model';
import { db } from '~/database/prisma';
import { conditionalFilters } from '~/database/util';

import {
  type ActionCountParams,
  type ActionFilterParams,
  type ActionPaginationParams,
  clampPagination,
  type CompaniesControls,
  constructTableSearchClause,
  getCompaniesOrdering,
  PAGE_SIZES,
  type ServerSidePaginationParams,
  type StandardFetchActionReturn,
  standardListFetchAction,
} from '~/actions';

const filtersClause = ({
  filters,
}: Omit<ActionFilterParams<CompaniesControls>, 'filterIsVisible'>) =>
  conditionalFilters([
    filters.search ? constructTableSearchClause('company', filters.search) : undefined,
    filters.experiences && filters.experiences.length !== 0
      ? { experiences: { some: { id: { in: filters.experiences } } } }
      : undefined,
  ] as const);

const whereClause = ({
  filters,
}: Omit<ActionFilterParams<CompaniesControls>, 'filterIsVisible'>) => {
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
  { adminOnly: true, authenticated: true },
);

export const fetchCompaniesPagination = standardListFetchAction(
  async (
    params: ActionPaginationParams<CompaniesControls>,
  ): StandardFetchActionReturn<ServerSidePaginationParams> => {
    const { filters, page } = params;
    const count = await db.company.count({
      where: whereClause({ filters }),
    });
    return clampPagination({ count, page, pageSize: PAGE_SIZES.company });
  },
  { adminOnly: true, authenticated: true },
);

export const fetchCompanies = <I extends CompanyIncludes>(includes: I) =>
  standardListFetchAction(
    async (
      { filters, limit, ordering, page, visibility }: Omit<CompaniesControls<I>, 'includes'>,
      { isVisible },
    ): StandardFetchActionReturn<ApiCompany<I>[]> => {
      let pagination: null | Omit<ServerSidePaginationParams, 'count'> = null;
      if (page !== undefined) {
        ({ data: pagination } = await fetchCompaniesPagination(
          { filters, page, visibility },
          { strict: true },
        ));
      }

      const companies = await db.company.findMany({
        include: {
          experiences: fieldIsIncluded('experiences', includes)
            ? { where: { visible: isVisible } }
            : undefined,
        },
        orderBy: getCompaniesOrdering(ordering),
        skip: pagination ? pagination.pageSize * (pagination.page - 1) : undefined,
        take: pagination ? pagination.pageSize : limit,
        where: whereClause({ filters }),
      });
      return companies as ApiCompany<I>[];
    },
    { adminOnly: true, authenticated: true },
  );
