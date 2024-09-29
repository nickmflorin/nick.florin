import { BrandResume } from "~/database/model";
import { db } from "~/database/prisma";
import { conditionalFilters } from "~/database/util";
import { logger } from "~/internal/logger";
import {
  constructTableSearchClause,
  PAGE_SIZES,
  type ServerSidePaginationParams,
  clampPagination,
  type ResumesControls,
  standardListFetchAction,
  getResumesOrdering,
  type StandardFetchActionReturn,
  type ActionPaginationParams,
  type ActionCountParams,
  type ActionFilterParams,
} from "~/actions";

export const setResumesPrimaryFlag = (resumes: BrandResume[]) => {
  const primaries = resumes.filter(r => r.primary === true);
  /* If there are multiple primary resumes - this is a data inconsistency.  We will assume the
       most recently uploaded resume is the primary. */
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

const filtersClause = ({ filters }: Omit<ActionFilterParams<ResumesControls>, "filterIsVisible">) =>
  conditionalFilters([
    filters.search ? constructTableSearchClause("resume", filters.search) : undefined,
  ] as const);

const whereClause = ({ filters }: Omit<ActionFilterParams<ResumesControls>, "filterIsVisible">) => {
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
  { authenticated: true, adminOnly: true },
);

export const fetchResumesPagination = standardListFetchAction(
  async ({
    filters,
    page,
    /* eslint-disable-next-line max-len */
  }: ActionPaginationParams<ResumesControls>): StandardFetchActionReturn<ServerSidePaginationParams> => {
    const count = await db.resume.count({
      where: whereClause({ filters }),
    });
    return clampPagination({ count, page, pageSize: PAGE_SIZES.resume });
  },
  { authenticated: true, adminOnly: true },
);

export const fetchResumes = standardListFetchAction(
  async ({
    filters,
    ordering,
    page,
    limit,
    visibility,
  }: ResumesControls): StandardFetchActionReturn<BrandResume[]> => {
    let pagination: Omit<ServerSidePaginationParams, "count"> | null = null;
    if (page !== undefined) {
      ({ data: pagination } = await fetchResumesPagination(
        { filters, page, visibility },
        { strict: true },
      ));
    }

    const resumes = await db.resume.findMany({
      where: whereClause({ filters }),
      orderBy: getResumesOrdering(ordering),
      skip: pagination ? pagination.pageSize * (pagination.page - 1) : undefined,
      take: pagination ? pagination.pageSize : limit,
    });
    return setResumesPrimaryFlag(resumes);
  },
  { authenticated: false, adminOnly: false },
);
