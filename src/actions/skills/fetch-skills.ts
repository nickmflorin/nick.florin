import { type ApiSkill, fieldIsIncluded, type SkillIncludes } from '~/database/model';
import { db } from '~/database/prisma';
import { conditionalFilters } from '~/database/util';

import {
  type ActionCountParams,
  type ActionFilterParams,
  type ActionPaginationParams,
  clampPagination,
  constructTableSearchClause,
  getSkillsOrdering,
  PAGE_SIZES,
  type ServerSidePaginationParams,
  type SkillsControls,
  type StandardFetchActionReturn,
  standardListFetchAction,
} from '~/actions';

const filtersClause = ({ filterIsVisible, filters }: ActionFilterParams<SkillsControls>) =>
  conditionalFilters([
    filters.search ? constructTableSearchClause('skill', filters.search) : undefined,
    filters.educations && filters.educations.length !== 0
      ? { educations: { some: { id: { in: filters.educations } } } }
      : undefined,
    filters.experiences && filters.experiences.length !== 0
      ? { experiences: { some: { id: { in: filters.experiences } } } }
      : undefined,
    filters.repositories && filters.repositories.length !== 0
      ? { repositories: { some: { id: { in: filters.repositories } } } }
      : undefined,
    filters.projects && filters.projects.length !== 0
      ? { projects: { some: { id: { in: filters.projects } } } }
      : undefined,
    filters.highlighted !== undefined && filters.highlighted !== null
      ? { highlighted: filters.highlighted }
      : undefined,
    filters.prioritized !== undefined && filters.prioritized !== null
      ? { prioritized: filters.prioritized }
      : undefined,
    filters.programmingDomains && filters.programmingDomains.length !== 0
      ? { programmingDomains: { hasSome: filters.programmingDomains } }
      : undefined,
    filters.programmingLanguages && filters.programmingLanguages.length !== 0
      ? { programmingLanguages: { hasSome: filters.programmingLanguages } }
      : undefined,
    filters.categories && filters.categories.length !== 0
      ? { categories: { hasSome: filters.categories } }
      : undefined,
    { visible: filterIsVisible(filters.visible) },
  ] as const);

const whereClause = ({ filterIsVisible, filters }: ActionFilterParams<SkillsControls>) => {
  const clause = filtersClause({ filterIsVisible, filters });
  if (clause.length !== 0) {
    return { AND: [...clause] };
  }
  return {};
};

export const fetchSkillsCount = standardListFetchAction(
  async (
    { filters }: ActionCountParams<SkillsControls>,
    { filterIsVisible },
  ): StandardFetchActionReturn<{
    count: number;
  }> => {
    const count = await db.skill.count({ where: whereClause({ filterIsVisible, filters }) });
    return { count };
  },
  { adminOnly: true, authenticated: true },
);

export const fetchSkillsPagination = standardListFetchAction(
  async (
    { filters, page }: ActionPaginationParams<SkillsControls>,
    { filterIsVisible },
  ): StandardFetchActionReturn<ServerSidePaginationParams> => {
    const count = await db.skill.count({
      where: whereClause({ filterIsVisible, filters }),
    });
    return clampPagination({ count, page, pageSize: PAGE_SIZES.skill });
  },
  { adminOnly: true, authenticated: true },
);

export const fetchSkills = <I extends SkillIncludes>(includes: I) =>
  standardListFetchAction(
    async (
      { filters, limit, ordering, page, visibility }: Omit<SkillsControls<I>, 'includes'>,
      { filterIsVisible },
    ): StandardFetchActionReturn<ApiSkill<I>[]> => {
      let pagination: null | Omit<ServerSidePaginationParams, 'count'> = null;
      if (page !== undefined) {
        ({ data: pagination } = await fetchSkillsPagination(
          { filters, page, visibility },
          { strict: true },
        ));
      }
      return (await db.skill.findMany({
        include: {
          courses: fieldIsIncluded('courses', includes)
            ? { where: { visible: filterIsVisible(filters.visible) } }
            : undefined,
          educations: fieldIsIncluded('educations', includes)
            ? {
                include: { school: true },
                orderBy: { startDate: 'desc' },
                where: {
                  visible: filterIsVisible(filters.visible),
                },
              }
            : undefined,
          experiences: fieldIsIncluded('experiences', includes)
            ? {
                include: { company: true },
                orderBy: { startDate: 'desc' },
                where: { visible: filterIsVisible(filters.visible) },
              }
            : undefined,
          projects: fieldIsIncluded('projects', includes),
          repositories: fieldIsIncluded('repositories', includes)
            ? { where: { visible: filterIsVisible(filters.visible) } }
            : undefined,
        },
        orderBy: getSkillsOrdering(ordering),
        skip: pagination ? pagination.pageSize * (pagination.page - 1) : undefined,
        take: pagination
          ? pagination.pageSize
          : limit !== undefined && limit !== 0
            ? limit
            : undefined,
        where: whereClause({ filterIsVisible, filters }),
      })) as ApiSkill<I>[];
    },
    { adminOnly: false, authenticated: false },
  );
