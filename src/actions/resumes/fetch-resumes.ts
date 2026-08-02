import { type BrandResume } from '~/database/model';
import { db } from '~/database/prisma';
import { conditionalFilters } from '~/database/util';
import { logger } from '~/internal/logger';

import {
  type ActionCountParams,
  type ActionFilterParams,
  type ActionPaginationParams,
  clampPagination,
  constructTableSearchClause,
  getResumesOrdering,
  PAGE_SIZES,
  type ResumesControls,
  type ServerSidePaginationParams,
  type StandardFetchActionReturn,
  standardListFetchAction,
} from '~/actions';

/**
 * Returns the provided resumes with the `primary` flag reconciled so that at most one resume is
 * flagged as primary.
 *
 * More than one resume having the `primary` flag set to `true` represents a data inconsistency; in
 * that case, the most recently uploaded resume is treated as the primary resume.
 */
export const setResumesPrimaryFlag = (resumes: BrandResume[]) => {
  const primaries = resumes.filter(r => r.primary === true);
  if (primaries.length > 1) {
    logger.warn("Encountered multiple resumes with the 'primary' flag set to 'true'.", {
      resumes: primaries.map(r => r.id),
    });
    return resumes.map(r =>
      r.id === primaries[0].id ? { ...r, primary: true } : { ...r, primary: false },
    );
  }
  return resumes;
};

const filtersClause = ({ filters }: Omit<ActionFilterParams<ResumesControls>, 'filterIsVisible'>) =>
  conditionalFilters([
    filters.search ? constructTableSearchClause('resume', filters.search) : undefined,
  ] as const);

const whereClause = ({ filters }: Omit<ActionFilterParams<ResumesControls>, 'filterIsVisible'>) => {
  const clause = filtersClause({ filters });
  if (clause.length !== 0) {
    return { AND: [...clause] };
  }
  return {};
};

export const fetchResumesCount = standardListFetchAction(
  async ({
    filters,
  }: ActionCountParams<ResumesControls>): StandardFetchActionReturn<{
    count: number;
  }> => {
    const count = await db.resume.count({ where: whereClause({ filters }) });
    return { count };
  },
  { adminOnly: true, authenticated: true },
);

export const fetchResumesPagination = standardListFetchAction(
  async (
    params: ActionPaginationParams<ResumesControls>,
  ): StandardFetchActionReturn<ServerSidePaginationParams> => {
    const { filters, page } = params;
    const count = await db.resume.count({
      where: whereClause({ filters }),
    });
    return clampPagination({ count, page, pageSize: PAGE_SIZES.resume });
  },
  { adminOnly: true, authenticated: true },
);

export const fetchResumes = standardListFetchAction(
  async ({
    filters,
    limit,
    ordering,
    page,
    visibility,
  }: ResumesControls): StandardFetchActionReturn<BrandResume[]> => {
    let pagination: null | Omit<ServerSidePaginationParams, 'count'> = null;
    if (page !== undefined) {
      ({ data: pagination } = await fetchResumesPagination(
        { filters, page, visibility },
        { strict: true },
      ));
    }

    const resumes = await db.resume.findMany({
      orderBy: getResumesOrdering(ordering),
      skip: pagination ? pagination.pageSize * (pagination.page - 1) : undefined,
      take: pagination ? pagination.pageSize : limit,
      where: whereClause({ filters }),
    });
    return setResumesPrimaryFlag(resumes);
  },
  { adminOnly: false, authenticated: false },
);
