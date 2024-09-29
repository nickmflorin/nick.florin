import type { ApiEducation, EducationIncludes } from "~/database/model";
import { DetailEntityType, fieldIsIncluded } from "~/database/model";
import { db } from "~/database/prisma";
import { conditionalFilters } from "~/database/util";

import {
  constructTableSearchClause,
  PAGE_SIZES,
  type ServerSidePaginationParams,
  clampPagination,
  type EducationsControls,
  getEducationsOrdering,
  standardListFetchAction,
  type StandardFetchActionReturn,
  type ActionFilterParams,
  type ActionCountParams,
  type ActionPaginationParams,
} from "~/actions";

const filtersClause = ({ filters, filterIsVisible }: ActionFilterParams<EducationsControls>) =>
  conditionalFilters([
    filters.search ? constructTableSearchClause("education", filters.search) : undefined,
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

const whereClause = ({ filters, filterIsVisible }: ActionFilterParams<EducationsControls>) => {
  const clause = filtersClause({ filters, filterIsVisible });
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
    const count = await db.education.count({ where: whereClause({ filters, filterIsVisible }) });
    return { count };
  },
  { authenticated: true, adminOnly: true },
);

export const fetchEducationsPagination = standardListFetchAction(
  async (
    { filters, page }: ActionPaginationParams<EducationsControls>,
    { filterIsVisible },
  ): StandardFetchActionReturn<ServerSidePaginationParams> => {
    const count = await db.education.count({
      where: whereClause({ filters, filterIsVisible }),
    });
    return clampPagination({ count, page, pageSize: PAGE_SIZES.education });
  },
  { authenticated: true, adminOnly: true },
);

export const fetchEducations = <I extends EducationIncludes>(includes: I) =>
  standardListFetchAction(
    async (
      { filters, ordering, page, limit, visibility }: Omit<EducationsControls<I>, "includes">,
      { filterIsVisible },
    ): StandardFetchActionReturn<ApiEducation<I>[]> => {
      let pagination: Omit<ServerSidePaginationParams, "count"> | null = null;
      if (page !== undefined) {
        ({ data: pagination } = await fetchEducationsPagination(
          { filters, page, visibility },
          { strict: true },
        ));
      }

      const educations = await db.education.findMany({
        where: whereClause({ filters, filterIsVisible }),
        include: {
          school: true,
          skills: fieldIsIncluded("skills", includes)
            ? { where: { visible: filterIsVisible(filters.visible) } }
            : undefined,
          courses: fieldIsIncluded("courses", includes)
            ? {
                where: { visible: filterIsVisible(filters.visible) },
                include: {
                  skills: fieldIsIncluded("skills", includes)
                    ? { where: { visible: filterIsVisible(filters.visible) } }
                    : undefined,
                },
              }
            : undefined,
        },
        orderBy: getEducationsOrdering(ordering),
        skip: pagination ? pagination.pageSize * (pagination.page - 1) : undefined,
        take: pagination ? pagination.pageSize : limit,
      });

      if (fieldIsIncluded("details", includes)) {
        const details = await db.detail.findMany({
          where: {
            entityType: DetailEntityType.EDUCATION,
            entityId: { in: educations.map(e => e.id) },
            visible: filterIsVisible(filters.visible),
          },
          include: {
            project: {
              include: {
                skills: fieldIsIncluded("skills", includes)
                  ? { where: { visible: filterIsVisible(filters.visible) } }
                  : undefined,
              },
            },
            skills: fieldIsIncluded("skills", includes)
              ? { where: { visible: filterIsVisible(filters.visible) } }
              : undefined,
            nestedDetails: {
              orderBy: [{ createdAt: "desc" }, { id: "desc" }],
              where: {
                visible: filterIsVisible(filters.visible),
              },
              include: {
                skills: fieldIsIncluded("skills", includes)
                  ? { where: { visible: filterIsVisible(filters.visible) } }
                  : undefined,
                project: {
                  include: {
                    skills: fieldIsIncluded("skills", includes)
                      ? { where: { visible: filterIsVisible(filters.visible) } }
                      : undefined,
                  },
                },
              },
            },
          },
        });
        return educations.map(
          (edu): ApiEducation<I> =>
            ({ ...edu, details: details.filter(d => d.entityId === edu.id) }) as ApiEducation<I>,
        );
      }
      return educations as ApiEducation<I>[];
    },
    { authenticated: false, adminOnly: false },
  );
