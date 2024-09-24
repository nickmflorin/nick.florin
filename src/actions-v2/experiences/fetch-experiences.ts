import { type Required } from "utility-types";

import type {
  ApiExperience,
  ExperienceIncludes,
  ExperienceToDetailIncludes,
} from "~/database/model";
import { DetailEntityType, fieldIsIncluded } from "~/database/model";
import { db } from "~/database/prisma";
import { conditionalFilters } from "~/database/util";

import { ExperiencesOrderingMap, visibilityIsAdmin } from "~/actions-v2";
import {
  constructTableSearchClause,
  PAGE_SIZES,
  type ServerSidePaginationParams,
  isVisible,
  clampPagination,
  type ExperiencesControls,
  standardFetchAction,
  type StandardFetchActionReturn,
} from "~/actions-v2";
import { fetchDetails } from "~/actions-v2/details/fetch-details";
import { ApiClientGlobalError } from "~/api-v2";

const filtersClause = ({
  filters,
  visibility,
}: Pick<ExperiencesControls, "filters" | "visibility">) =>
  conditionalFilters([
    filters.search ? constructTableSearchClause("experience", filters.search) : undefined,
    filters.companies && filters.companies.length !== 0
      ? { companyId: { in: filters.companies } }
      : undefined,
    filters.skills && filters.skills.length !== 0
      ? { skills: { some: { id: { in: filters.skills } } } }
      : undefined,
    filters.highlighted !== undefined && filters.highlighted !== null
      ? { highlighted: filters.highlighted }
      : undefined,
    { visible: isVisible(visibility, filters.visible) },
  ] as const);

const whereClause = ({
  filters,
  visibility,
}: Pick<ExperiencesControls, "filters" | "visibility">) => {
  const clause = filtersClause({ filters, visibility });
  if (clause.length !== 0) {
    return { AND: [...clause] };
  }
  return {};
};

export const fetchExperiencesCount = standardFetchAction(
  async ({
    filters,
    visibility,
  }: Pick<ExperiencesControls, "filters" | "visibility">): StandardFetchActionReturn<{
    count: number;
  }> => {
    /* This check may be redundant, because of the 'adminOnly' flag in the standard fetch action
       method - but we want to include this just in case. */
    if (!visibilityIsAdmin(visibility) && filters.visible === false) {
      return ApiClientGlobalError.Forbidden({
        message: "The user does not have permission to access this data.",
      });
    }
    const count = await db.experience.count({ where: whereClause({ filters, visibility }) });
    return { count };
  },
  { authenticated: true, adminOnly: true },
);

export const fetchExperiencesPagination = standardFetchAction(
  async ({
    filters,
    page,
    visibility,
  }: Required<
    Pick<ExperiencesControls, "filters" | "visibility" | "page">,
    "page"
  >): StandardFetchActionReturn<ServerSidePaginationParams> => {
    /* This check may be redundant, because of the 'adminOnly' flag in the standard fetch action
       method - but we want to include this just in case. */
    if (!visibilityIsAdmin(visibility) && filters.visible === false) {
      return ApiClientGlobalError.Forbidden({
        message: "The user does not have permission to access this data.",
      });
    }
    const count = await db.experience.count({
      where: whereClause({ filters, visibility }),
    });
    return clampPagination({ count, page, pageSize: PAGE_SIZES.experience });
  },
  { authenticated: true, adminOnly: true },
);

export const fetchExperiences = <I extends ExperienceIncludes>(includes: I) =>
  standardFetchAction(
    async ({
      filters,
      ordering,
      page,
      limit,
      visibility,
    }: Omit<ExperiencesControls<I>, "includes">): StandardFetchActionReturn<ApiExperience<I>[]> => {
      if (!visibilityIsAdmin(visibility) && filters.visible === false) {
        return ApiClientGlobalError.Forbidden({
          message: "The user does not have permission to access this data.",
        });
      }
      let pagination: Omit<ServerSidePaginationParams, "count"> | null = null;
      if (page !== undefined) {
        ({ data: pagination } = await fetchExperiencesPagination(
          { filters, page, visibility },
          { strict: true },
        ));
      }

      const experiences = await db.experience.findMany({
        where: whereClause({ filters, visibility }),
        include: {
          company: true,
          skills: fieldIsIncluded("skills", includes)
            ? { where: { visible: isVisible(visibility, filters.visible) } }
            : undefined,
        },
        orderBy: ordering
          ? [
              ...ExperiencesOrderingMap[ordering.orderBy](ordering.order),
              { createdAt: "desc" },
              { id: "desc" },
            ]
          : [{ createdAt: "desc" }, { id: "desc" }],
        skip: pagination ? pagination.pageSize * (pagination.page - 1) : undefined,
        take: pagination ? pagination.pageSize : limit,
      });

      if (fieldIsIncluded("details", includes)) {
        const fetcher = fetchDetails(
          (fieldIsIncluded("skills", includes)
            ? ["nestedDetails", "skills"]
            : ["nestedDetails"]) as ExperienceToDetailIncludes<I>,
        );
        const { data: details, error } = await fetcher(
          {
            filters: {
              visible: filters.visible,
              entityIds: experiences.map(e => e.id),
              entityTypes: [DetailEntityType.EXPERIENCE],
            },
            visibility,
          },
          { strict: false, scope: "api" },
        );
        if (error) {
          return error;
        }
        return experiences.map(
          (edu): ApiExperience<I> =>
            ({ ...edu, details: details.filter(d => d.entityId === edu.id) }) as ApiExperience<I>,
        );
      }
      return experiences as ApiExperience<I>[];
    },
    { authenticated: false, adminOnly: false },
  );
