import {
  type ApiExperience,
  DetailEntityType,
  type ExperienceIncludes,
  fieldIsIncluded,
} from '~/database/model';
import { db } from '~/database/prisma';
import { conditionalFilters } from '~/database/util';

import {
  type ActionCountParams,
  type ActionFilterParams,
  type ActionPaginationParams,
  clampPagination,
  constructTableSearchClause,
  type ExperiencesControls,
  getExperiencesOrdering,
  PAGE_SIZES,
  type ServerSidePaginationParams,
  type StandardFetchActionReturn,
  standardListFetchAction,
} from '~/actions';

const filtersClause = ({ filterIsVisible, filters }: ActionFilterParams<ExperiencesControls>) =>
  conditionalFilters([
    filters.search ? constructTableSearchClause('experience', filters.search) : undefined,
    filters.companies && filters.companies.length !== 0
      ? { companyId: { in: filters.companies } }
      : undefined,
    filters.skills && filters.skills.length !== 0
      ? { skills: { some: { id: { in: filters.skills } } } }
      : undefined,
    filters.highlighted !== undefined && filters.highlighted !== null
      ? { highlighted: filters.highlighted }
      : undefined,
    { visible: filterIsVisible(filters.visible) },
  ] as const);

const whereClause = ({ filterIsVisible, filters }: ActionFilterParams<ExperiencesControls>) => {
  const clause = filtersClause({ filterIsVisible, filters });
  if (clause.length !== 0) {
    return { AND: [...clause] };
  }
  return {};
};

export const fetchExperiencesCount = standardListFetchAction(
  async (
    { filters }: ActionCountParams<ExperiencesControls>,
    { filterIsVisible },
  ): StandardFetchActionReturn<{
    count: number;
  }> => {
    const count = await db.experience.count({ where: whereClause({ filterIsVisible, filters }) });
    return { count };
  },
  { adminOnly: true, authenticated: true },
);

export const fetchExperiencesPagination = standardListFetchAction(
  async (
    { filters, page }: ActionPaginationParams<ExperiencesControls>,
    { filterIsVisible },
  ): StandardFetchActionReturn<ServerSidePaginationParams> => {
    const count = await db.experience.count({
      where: whereClause({ filterIsVisible, filters }),
    });
    return clampPagination({ count, page, pageSize: PAGE_SIZES.experience });
  },
  { adminOnly: true, authenticated: true },
);

export const fetchExperiences = <I extends ExperienceIncludes>(includes: I) =>
  standardListFetchAction(
    async (
      { filters, limit, ordering, page, visibility }: Omit<ExperiencesControls<I>, 'includes'>,
      { filterIsVisible },
    ): StandardFetchActionReturn<ApiExperience<I>[]> => {
      let pagination: null | Omit<ServerSidePaginationParams, 'count'> = null;
      if (page !== undefined) {
        ({ data: pagination } = await fetchExperiencesPagination(
          { filters, page, visibility },
          { strict: true },
        ));
      }

      const experiences = (await db.experience.findMany({
        include: {
          company: true,
          skills: fieldIsIncluded('skills', includes)
            ? { where: { visible: filterIsVisible(filters.visible) } }
            : undefined,
        },
        orderBy: getExperiencesOrdering(ordering),
        skip: pagination ? pagination.pageSize * (pagination.page - 1) : undefined,
        take: pagination ? pagination.pageSize : limit,
        where: whereClause({ filterIsVisible, filters }),
      })) as ApiExperience<I>[];

      if (fieldIsIncluded('details', includes)) {
        const details = await db.detail.findMany({
          include: {
            nestedDetails: {
              include: {
                project: {
                  include: {
                    skills: fieldIsIncluded('skills', includes)
                      ? { where: { visible: filterIsVisible(filters.visible) } }
                      : undefined,
                  },
                },
                skills: fieldIsIncluded('skills', includes)
                  ? { where: { visible: filterIsVisible(filters.visible) } }
                  : undefined,
              },
              orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
              where: {
                visible: filterIsVisible(filters.visible),
              },
            },
            project: {
              include: {
                skills: fieldIsIncluded('skills', includes)
                  ? { where: { visible: filterIsVisible(filters.visible) } }
                  : undefined,
              },
            },
            skills: fieldIsIncluded('skills', includes)
              ? { where: { visible: filterIsVisible(filters.visible) } }
              : undefined,
          },
          where: {
            entityId: { in: experiences.map(e => e.id) },
            entityType: DetailEntityType.EXPERIENCE,
            visible: filterIsVisible(filters.visible),
          },
        });
        return experiences.map((edu): ApiExperience<I> => ({
          ...edu,
          details: details.filter(d => d.entityId === edu.id),
        }));
      }
      return experiences;
    },
    { adminOnly: false, authenticated: false },
  );
