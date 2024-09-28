import { type Required } from "utility-types";

import type { ApiEducation, EducationIncludes, EducationToDetailIncludes } from "~/database/model";
import { DetailEntityType, fieldIsIncluded } from "~/database/model";
import { db } from "~/database/prisma";
import { conditionalFilters } from "~/database/util";

import { visibilityIsAdmin } from "~/actions-v2";
import {
  constructTableSearchClause,
  PAGE_SIZES,
  type ServerSidePaginationParams,
  isVisible,
  clampPagination,
  type EducationsControls,
  getEducationsOrdering,
  standardListFetchAction,
  type StandardFetchActionReturn,
} from "~/actions-v2";
import { fetchDetails } from "~/actions-v2/details/fetch-details";
import { ApiClientGlobalError } from "~/api-v2";

const filtersClause = ({
  filters,
  visibility,
}: Pick<EducationsControls, "filters" | "visibility">) =>
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
    { visible: isVisible(visibility, filters.visible) },
  ] as const);

const whereClause = ({
  filters,
  visibility,
}: Pick<EducationsControls, "filters" | "visibility">) => {
  const clause = filtersClause({ filters, visibility });
  if (clause.length !== 0) {
    return { AND: [...clause] };
  }
  return {};
};

export const fetchEducationsCount = standardListFetchAction(
  async ({
    filters,
    visibility,
  }: Pick<EducationsControls, "filters" | "visibility">): StandardFetchActionReturn<{
    count: number;
  }> => {
    /* This check may be redundant, because of the 'adminOnly' flag in the standard fetch action
       method - but we want to include this just in case. */
    if (!visibilityIsAdmin(visibility) && filters.visible === false) {
      return ApiClientGlobalError.Forbidden({
        message: "The user does not have permission to access this data.",
      });
    }
    const count = await db.education.count({ where: whereClause({ filters, visibility }) });
    return { count };
  },
  { authenticated: true, adminOnly: true },
);

export const fetchEducationsPagination = standardListFetchAction(
  async ({
    filters,
    page,
    visibility,
  }: Required<
    Pick<EducationsControls, "filters" | "visibility" | "page">,
    "page"
  >): StandardFetchActionReturn<ServerSidePaginationParams> => {
    /* This check may be redundant, because of the 'adminOnly' flag in the standard fetch action
       method - but we want to include this just in case. */
    if (!visibilityIsAdmin(visibility) && filters.visible === false) {
      return ApiClientGlobalError.Forbidden({
        message: "The user does not have permission to access this data.",
      });
    }
    const count = await db.education.count({
      where: whereClause({ filters, visibility }),
    });
    return clampPagination({ count, page, pageSize: PAGE_SIZES.education });
  },
  { authenticated: true, adminOnly: true },
);

export const fetchEducations = <I extends EducationIncludes>(includes: I) =>
  standardListFetchAction(
    async ({
      filters,
      ordering,
      page,
      limit,
      visibility,
    }: Omit<EducationsControls<I>, "includes">): StandardFetchActionReturn<ApiEducation<I>[]> => {
      if (!visibilityIsAdmin(visibility) && filters.visible === false) {
        return ApiClientGlobalError.Forbidden({
          message: "The user does not have permission to access this data.",
        });
      }
      let pagination: Omit<ServerSidePaginationParams, "count"> | null = null;
      if (page !== undefined) {
        ({ data: pagination } = await fetchEducationsPagination(
          { filters, page, visibility },
          { strict: true },
        ));
      }

      const educations = await db.education.findMany({
        where: whereClause({ filters, visibility }),
        include: {
          school: true,
          skills: fieldIsIncluded("skills", includes)
            ? { where: { visible: isVisible(visibility, filters.visible) } }
            : undefined,
          courses: fieldIsIncluded("courses", includes)
            ? {
                where: { visible: isVisible(visibility, filters.visible) },
                include: {
                  skills: fieldIsIncluded("skills", includes)
                    ? { where: { visible: isVisible(visibility, filters.visible) } }
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
        const fetcher = fetchDetails(
          (fieldIsIncluded("skills", includes)
            ? ["nestedDetails", "skills"]
            : ["nestedDetails"]) as EducationToDetailIncludes<I>,
        );
        const { data: details, error } = await fetcher(
          {
            filters: {
              visible: isVisible(visibility, filters.visible),
              entityIds: educations.map(e => e.id),
              entityTypes: [DetailEntityType.EDUCATION],
            },
            visibility,
          },
          { strict: false, scope: "api" },
        );
        if (error) {
          return error;
        }
        return educations.map(
          (edu): ApiEducation<I> =>
            ({ ...edu, details: details.filter(d => d.entityId === edu.id) }) as ApiEducation<I>,
        );
      }
      return educations as ApiEducation<I>[];
    },
    { authenticated: false, adminOnly: false },
  );
