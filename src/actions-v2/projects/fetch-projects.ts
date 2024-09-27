import { type Required } from "utility-types";

import type { ApiProject, ProjectIncludes } from "~/database/model";
import { fieldIsIncluded } from "~/database/model";
import { db } from "~/database/prisma";
import { conditionalFilters } from "~/database/util";

import { visibilityIsAdmin } from "~/actions-v2";
import {
  constructTableSearchClause,
  PAGE_SIZES,
  type ServerSidePaginationParams,
  isVisible,
  clampPagination,
  type ProjectsControls,
  standardFetchAction,
  getProjectsOrdering,
  type StandardFetchActionReturn,
} from "~/actions-v2";
import { ApiClientGlobalError } from "~/api-v2";

const filtersClause = ({ filters, visibility }: Pick<ProjectsControls, "filters" | "visibility">) =>
  conditionalFilters([
    filters.search ? constructTableSearchClause("project", filters.search) : undefined,
    filters.repositories && filters.repositories.length !== 0
      ? { repositories: { some: { id: { in: filters.repositories } } } }
      : undefined,
    filters.skills && filters.skills.length !== 0
      ? { skills: { some: { id: { in: filters.skills } } } }
      : undefined,
    filters.highlighted !== undefined && filters.highlighted !== null
      ? { highlighted: filters.highlighted }
      : undefined,
    { visible: isVisible(visibility, filters.visible) },
  ] as const);

const whereClause = ({ filters, visibility }: Pick<ProjectsControls, "filters" | "visibility">) => {
  const clause = filtersClause({ filters, visibility });
  if (clause.length !== 0) {
    return { AND: [...clause] };
  }
  return {};
};

export const fetchProjectsCount = standardFetchAction(
  async ({
    filters,
    visibility,
  }: Pick<ProjectsControls, "filters" | "visibility">): StandardFetchActionReturn<{
    count: number;
  }> => {
    /* This check may be redundant, because of the 'adminOnly' flag in the standard fetch action
       method - but we want to include this just in case. */
    if (!visibilityIsAdmin(visibility) && filters.visible === false) {
      return ApiClientGlobalError.Forbidden({
        message: "The user does not have permission to access this data.",
      });
    }
    const count = await db.project.count({ where: whereClause({ filters, visibility }) });
    return { count };
  },
  { authenticated: true, adminOnly: true },
);

export const fetchProjectsPagination = standardFetchAction(
  async ({
    filters,
    page,
    visibility,
  }: Required<
    Pick<ProjectsControls, "filters" | "visibility" | "page">,
    "page"
  >): StandardFetchActionReturn<ServerSidePaginationParams> => {
    /* This check may be redundant, because of the 'adminOnly' flag in the standard fetch action
       method - but we want to include this just in case. */
    if (!visibilityIsAdmin(visibility) && filters.visible === false) {
      return ApiClientGlobalError.Forbidden({
        message: "The user does not have permission to access this data.",
      });
    }
    const count = await db.project.count({
      where: whereClause({ filters, visibility }),
    });
    return clampPagination({ count, page, pageSize: PAGE_SIZES.project });
  },
  { authenticated: true, adminOnly: true },
);

export const fetchProjects = <I extends ProjectIncludes>(includes: I) =>
  standardFetchAction(
    async ({
      filters,
      ordering,
      page,
      limit,
      visibility,
    }: Omit<ProjectsControls<I>, "includes">): StandardFetchActionReturn<ApiProject<I>[]> => {
      if (!visibilityIsAdmin(visibility) && filters.visible === false) {
        return ApiClientGlobalError.Forbidden({
          message: "The user does not have permission to access this data.",
        });
      }
      let pagination: Omit<ServerSidePaginationParams, "count"> | null = null;
      if (page !== undefined) {
        ({ data: pagination } = await fetchProjectsPagination(
          { filters, page, visibility },
          { strict: true },
        ));
      }

      let projects = (await db.project.findMany({
        where: whereClause({ filters, visibility }),
        include: {
          skills: fieldIsIncluded("skills", includes)
            ? { where: { visible: isVisible(visibility, filters.visible) } }
            : undefined,
          repositories: fieldIsIncluded("repositories", includes)
            ? { where: { visible: isVisible(visibility, filters.visible) } }
            : undefined,
        },
        orderBy: getProjectsOrdering(ordering),
        skip: pagination ? pagination.pageSize * (pagination.page - 1) : undefined,
        take: pagination ? pagination.pageSize : limit,
      })) as ApiProject<I>[];

      if (fieldIsIncluded("nestedDetails", includes)) {
        const nestedDetails = await db.nestedDetail.findMany({
          where: { projectId: { in: projects.map(p => p.id) } },
        });
        projects = projects.map(
          (proj): ApiProject<I> =>
            ({
              ...proj,
              nestedDetails: nestedDetails.filter(d => d.projectId === proj.id),
            }) as ApiProject<I>,
        );
      }

      if (fieldIsIncluded("details", includes)) {
        const details = await db.detail.findMany({
          where: { projectId: { in: projects.map(p => p.id) } },
        });
        projects = projects.map(
          (proj): ApiProject<I> =>
            ({ ...proj, details: details.filter(d => d.projectId === proj.id) }) as ApiProject<I>,
        );
      }
      return projects;
    },
    { authenticated: false, adminOnly: false },
  );
