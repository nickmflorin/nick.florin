import { type Required } from "utility-types";

import type { ApiDetail, DetailIncludes } from "~/database/model";
import { fieldIsIncluded } from "~/database/model";
import { db } from "~/database/prisma";
import { conditionalFilters } from "~/database/util";
import { logger } from "~/internal/logger";
import { humanizeList } from "~/lib/formatters";
import { isUuid } from "~/lib/typeguards";

import {
  constructTableSearchClause,
  getDetailsOrdering,
  isVisible,
  PAGE_SIZES,
  type ServerSidePaginationParams,
  clampPagination,
  type DetailsControls,
  standardListFetchAction,
  type StandardFetchActionReturn,
} from "~/actions-v2";
import { visibilityIsAdmin } from "~/actions-v2";
import { ApiClientGlobalError } from "~/api-v2";

const filtersClause = ({
  filters,
  visibility,
}: Pick<DetailsControls, "filters" | "visibility">) => {
  /* If there are invalid UUIDs in the 'entityIds' filter, just log the error - do not throw.  We
     will filter out the invalid UUIDs when the filter is applied. */
  const invalid = (filters.entityIds ?? []).filter(id => !isUuid(id));
  if (invalid.length > 0) {
    logger.error(
      `The id(s) ${humanizeList(invalid, {
        conjunction: "and",
        formatter: v => `'${v}'`,
      })} are not valid UUID(s).`,
      { invalid },
    );
  }
  return conditionalFilters([
    filters.search ? constructTableSearchClause("detail", filters.search) : undefined,
    filters.skills && filters.skills.length !== 0
      ? { skills: { some: { id: { in: filters.skills } } } }
      : undefined,
    filters.entityTypes && filters.entityTypes.length !== 0
      ? { entityType: { in: filters.entityTypes } }
      : undefined,
    filters.entityIds && filters.entityIds.length !== 0
      ? { entityId: { in: filters.entityIds.filter(isUuid) } }
      : undefined,
    { visible: isVisible(visibility, filters.visible) },
  ] as const);
};

const whereClause = ({ filters, visibility }: Pick<DetailsControls, "filters" | "visibility">) => {
  const clause = filtersClause({ filters, visibility });
  if (clause.length !== 0) {
    return { AND: [...clause] };
  }
  return {};
};

export const fetchDetailsCount = standardListFetchAction(
  async ({
    filters,
    visibility,
  }: Pick<DetailsControls, "filters" | "visibility">): StandardFetchActionReturn<{
    count: number;
  }> => {
    /* This check may be redundant, because of the 'adminOnly' flag in the standard fetch action
       method - but we want to include this just in case. */
    if (!visibilityIsAdmin(visibility) && filters.visible === false) {
      return ApiClientGlobalError.Forbidden({
        message: "The user does not have permission to access this data.",
      });
    }
    const count = await db.skill.count({ where: whereClause({ filters, visibility }) });
    return { count };
  },
  { authenticated: true, adminOnly: true },
);

export const fetchDetailsPagination = standardListFetchAction(
  async ({
    filters,
    page,
    visibility,
  }: Required<
    Pick<DetailsControls, "filters" | "visibility" | "page">,
    "page"
  >): StandardFetchActionReturn<ServerSidePaginationParams> => {
    /* This check may be redundant, because of the 'adminOnly' flag in the standard fetch action
       method - but we want to include this just in case. */
    if (!visibilityIsAdmin(visibility) && filters.visible === false) {
      return ApiClientGlobalError.Forbidden({
        message: "The user does not have permission to access this data.",
      });
    }
    const count = await db.skill.count({
      where: whereClause({ filters, visibility }),
    });
    return clampPagination({ count, page, pageSize: PAGE_SIZES.skill });
  },
  { authenticated: true, adminOnly: true },
);

export const fetchDetails = <I extends DetailIncludes>(includes: I) =>
  standardListFetchAction(
    async ({
      filters,
      ordering,
      page,
      limit,
      visibility,
    }: Omit<DetailsControls<I>, "includes">): StandardFetchActionReturn<ApiDetail<I>[]> => {
      if (!visibilityIsAdmin(visibility) && filters.visible === false) {
        return ApiClientGlobalError.Forbidden({
          message: "The user does not have permission to access this data.",
        });
      }

      let pagination: Omit<ServerSidePaginationParams, "count"> | null = null;
      if (page !== undefined) {
        ({ data: pagination } = await fetchDetailsPagination(
          { filters, page, visibility },
          { strict: true },
        ));
      }

      const details = await db.detail.findMany({
        where: whereClause({ filters, visibility }),
        orderBy: getDetailsOrdering(ordering),
        skip: pagination ? pagination.pageSize * (pagination.page - 1) : undefined,
        take: pagination ? pagination.pageSize : limit,
        include: {
          project: {
            include: {
              skills: fieldIsIncluded("skills", includes)
                ? { where: { visible: isVisible(visibility, filters.visible) } }
                : undefined,
            },
          },
          skills: fieldIsIncluded("skills", includes)
            ? { where: { visible: isVisible(visibility, filters.visible) } }
            : undefined,
          nestedDetails: fieldIsIncluded("nestedDetails", includes)
            ? {
                /* Accounts for cases where multiple details were created at the same time due to
                   seeding. */
                orderBy: [{ createdAt: "desc" }, { id: "desc" }],
                where: { visible: isVisible(visibility, filters.visible) },
                include: {
                  skills: fieldIsIncluded("skills", includes)
                    ? { where: { visible: isVisible(visibility, filters.visible) } }
                    : undefined,
                  project: {
                    include: {
                      skills: fieldIsIncluded("skills", includes)
                        ? { where: { visible: isVisible(visibility, filters.visible) } }
                        : undefined,
                    },
                  },
                },
              }
            : undefined,
        },
      });
      return details as ApiDetail<I>[];
    },
    { authenticated: false, adminOnly: false },
  );
