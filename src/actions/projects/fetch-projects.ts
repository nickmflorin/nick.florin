import { type ApiProject, fieldIsIncluded, type ProjectIncludes } from '~/database/model';
import { db } from '~/database/prisma';
import { conditionalFilters } from '~/database/util';

import {
  type ActionCountParams,
  type ActionFilterParams,
  type ActionPaginationParams,
  clampPagination,
  constructTableSearchClause,
  getProjectsOrdering,
  PAGE_SIZES,
  type ProjectsControls,
  type ServerSidePaginationParams,
  type StandardFetchActionReturn,
  standardListFetchAction,
} from '~/actions';

const filtersClause = ({ filterIsVisible, filters }: ActionFilterParams<ProjectsControls>) =>
  conditionalFilters([
    filters.search ? constructTableSearchClause('project', filters.search) : undefined,
    filters.repositories && filters.repositories.length !== 0
      ? { repositories: { some: { id: { in: filters.repositories } } } }
      : undefined,
    filters.skills && filters.skills.length !== 0
      ? { skills: { some: { id: { in: filters.skills } } } }
      : undefined,
    filters.highlighted !== undefined && filters.highlighted !== null
      ? { highlighted: filters.highlighted }
      : undefined,
    { visible: filterIsVisible(filters.visible) },
  ] as const);

const whereClause = ({ filterIsVisible, filters }: ActionFilterParams<ProjectsControls>) => {
  const clause = filtersClause({ filterIsVisible, filters });
  if (clause.length !== 0) {
    return { AND: [...clause] };
  }
  return {};
};

export const fetchProjectsCount = standardListFetchAction(
  async (
    { filters }: ActionCountParams<ProjectsControls>,
    { filterIsVisible },
  ): StandardFetchActionReturn<{
    count: number;
  }> => {
    const count = await db.project.count({ where: whereClause({ filterIsVisible, filters }) });
    return { count };
  },
  { adminOnly: true, authenticated: true },
);

export const fetchProjectsPagination = standardListFetchAction(
  async (
    { filters, page }: ActionPaginationParams<ProjectsControls>,
    { filterIsVisible },
  ): StandardFetchActionReturn<ServerSidePaginationParams> => {
    const count = await db.project.count({
      where: whereClause({ filterIsVisible, filters }),
    });
    return clampPagination({ count, page, pageSize: PAGE_SIZES.project });
  },
  { adminOnly: true, authenticated: true },
);

export const fetchProjects = <I extends ProjectIncludes>(includes: I) =>
  standardListFetchAction(
    async (
      { filters, limit, ordering, page, visibility }: Omit<ProjectsControls<I>, 'includes'>,
      { filterIsVisible },
    ): StandardFetchActionReturn<ApiProject<I>[]> => {
      let pagination: null | Omit<ServerSidePaginationParams, 'count'> = null;
      if (page !== undefined) {
        ({ data: pagination } = await fetchProjectsPagination(
          { filters, page, visibility },
          { strict: true },
        ));
      }

      let projects = (await db.project.findMany({
        include: {
          repositories: fieldIsIncluded('repositories', includes)
            ? { where: { visible: filterIsVisible(filters.visible) } }
            : undefined,
          skills: fieldIsIncluded('skills', includes)
            ? { where: { visible: filterIsVisible(filters.visible) } }
            : undefined,
        },
        orderBy: getProjectsOrdering(ordering),
        skip: pagination ? pagination.pageSize * (pagination.page - 1) : undefined,
        take: pagination ? pagination.pageSize : limit,
        where: whereClause({ filterIsVisible, filters }),
      })) as ApiProject<I>[];

      if (fieldIsIncluded('nestedDetails', includes)) {
        const nestedDetails = await db.nestedDetail.findMany({
          where: { projectId: { in: projects.map(p => p.id) } },
        });
        projects = projects.map((proj): ApiProject<I> => ({
          ...proj,
          nestedDetails: nestedDetails.filter(d => d.projectId === proj.id),
        }));
      }

      if (fieldIsIncluded('details', includes)) {
        const details = await db.detail.findMany({
          where: { projectId: { in: projects.map(p => p.id) } },
        });
        projects = projects.map((proj): ApiProject<I> => ({
          ...proj,
          details: details.filter(d => d.projectId === proj.id),
        }));
      }
      return projects;
    },
    { adminOnly: false, authenticated: false },
  );
