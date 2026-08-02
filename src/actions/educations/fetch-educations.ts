import {
  type ApiEducation,
  DetailEntityType,
  type EducationIncludes,
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
  type EducationsControls,
  getEducationsOrdering,
  PAGE_SIZES,
  type ServerSidePaginationParams,
  type StandardFetchActionReturn,
  standardListFetchAction,
} from '~/actions';

const filtersClause = ({ filterIsVisible, filters }: ActionFilterParams<EducationsControls>) =>
  conditionalFilters([
    filters.search ? constructTableSearchClause('education', filters.search) : undefined,
    filters.schools && filters.schools.length !== 0
      ? { schoolId: { in: filters.schools } }
      : undefined,
    filters.skills && filters.skills.length !== 0
      ? { skills: { some: { id: { in: filters.skills } } } }
      : undefined,
    filters.courses && filters.courses.length !== 0
      ? { courses: { some: { id: { in: filters.courses } } } }
      : undefined,
    filters.highlighted !== undefined && filters.highlighted !== null
      ? { highlighted: filters.highlighted }
      : undefined,
    filters.postPoned !== undefined && filters.postPoned !== null
      ? { postPoned: filters.postPoned }
      : undefined,
    filters.degrees && filters.degrees.length !== 0
      ? { degree: { in: filters.degrees } }
      : undefined,
    { visible: filterIsVisible(filters.visible) },
  ] as const);

const whereClause = ({ filterIsVisible, filters }: ActionFilterParams<EducationsControls>) => {
  const clause = filtersClause({ filterIsVisible, filters });
  if (clause.length !== 0) {
    return { AND: [...clause] };
  }
  return {};
};

export const fetchEducationsCount = standardListFetchAction(
  async (
    { filters }: ActionCountParams<EducationsControls>,
    { filterIsVisible },
  ): StandardFetchActionReturn<{
    count: number;
  }> => {
    const count = await db.education.count({ where: whereClause({ filterIsVisible, filters }) });
    return { count };
  },
  { adminOnly: true, authenticated: true },
);

export const fetchEducationsPagination = standardListFetchAction(
  async (
    { filters, page }: ActionPaginationParams<EducationsControls>,
    { filterIsVisible },
  ): StandardFetchActionReturn<ServerSidePaginationParams> => {
    const count = await db.education.count({
      where: whereClause({ filterIsVisible, filters }),
    });
    return clampPagination({ count, page, pageSize: PAGE_SIZES.education });
  },
  { adminOnly: true, authenticated: true },
);

export const fetchEducations = <I extends EducationIncludes>(includes: I) =>
  standardListFetchAction(
    async (
      { filters, limit, ordering, page, visibility }: Omit<EducationsControls<I>, 'includes'>,
      { filterIsVisible },
    ): StandardFetchActionReturn<ApiEducation<I>[]> => {
      let pagination: null | Omit<ServerSidePaginationParams, 'count'> = null;
      if (page !== undefined) {
        ({ data: pagination } = await fetchEducationsPagination(
          { filters, page, visibility },
          { strict: true },
        ));
      }

      const educations = (await db.education.findMany({
        include: {
          courses: fieldIsIncluded('courses', includes)
            ? {
                include: {
                  skills: fieldIsIncluded('skills', includes)
                    ? { where: { visible: filterIsVisible(filters.visible) } }
                    : undefined,
                },
                where: { visible: filterIsVisible(filters.visible) },
              }
            : undefined,
          school: true,
          skills: fieldIsIncluded('skills', includes)
            ? { where: { visible: filterIsVisible(filters.visible) } }
            : undefined,
        },
        orderBy: getEducationsOrdering(ordering),
        skip: pagination ? pagination.pageSize * (pagination.page - 1) : undefined,
        take: pagination ? pagination.pageSize : limit,
        where: whereClause({ filterIsVisible, filters }),
      })) as ApiEducation<I>[];

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
            entityId: { in: educations.map(e => e.id) },
            entityType: DetailEntityType.EDUCATION,
            visible: filterIsVisible(filters.visible),
          },
        });
        return educations.map((edu): ApiEducation<I> => ({
          ...edu,
          details: details.filter(d => d.entityId === edu.id),
        }));
      }
      return educations;
    },
    { adminOnly: false, authenticated: false },
  );
