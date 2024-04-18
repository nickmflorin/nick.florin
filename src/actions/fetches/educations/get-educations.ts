import "server-only";
import { cache } from "react";

import { getAuthAdminUser } from "~/application/auth";
import { prisma } from "~/prisma/client";
import {
  type ApiEducation,
  DetailEntityType,
  type EducationIncludes,
  fieldIsIncluded,
  type EducationToDetailIncludes,
} from "~/prisma/model";
import { parsePagination, type Visibility } from "~/api/query";
import { convertToPlainObject } from "~/api/serialization";

import { PAGE_SIZES, constructTableSearchClause } from "../constants";
import { getDetails } from "../details";

interface GetEducationsFilters {
  readonly search: string;
}

type GetEducationsParams<I extends EducationIncludes> = {
  visibility: Visibility;
  includes: I;
  filters?: GetEducationsFilters;
  page?: number;
  limit?: number;
};

const whereClause = ({
  filters,
  visibility,
}: Pick<GetEducationsParams<EducationIncludes>, "visibility" | "filters">) =>
  ({
    AND:
      filters?.search && visibility === "public"
        ? [constructTableSearchClause("education", filters.search), { visible: true }]
        : filters?.search
          ? [constructTableSearchClause("education", filters.search)]
          : visibility === "public"
            ? { visible: true }
            : undefined,
  }) as const;

export const preloadEducationsCount = (
  params: Pick<GetEducationsParams<EducationIncludes>, "visibility" | "filters">,
) => {
  void getEducationsCount(params);
};

export const getEducationsCount = cache(
  async ({
    filters,
    visibility,
  }: Pick<GetEducationsParams<EducationIncludes>, "visibility" | "filters">) => {
    /* TODO: We have to figure out how to get this to render an API response, instead of throwing
       a hard error, in the case that this is being called from the context of a route handler. */
    await getAuthAdminUser({ strict: visibility === "admin" });
    return await prisma.education.count({
      where: whereClause({ filters, visibility }),
    });
  },
);

export const preloadEducations = <I extends EducationIncludes>(params: GetEducationsParams<I>) => {
  void getEducations(params);
};

export const getEducations = cache(
  async <I extends EducationIncludes>({
    visibility,
    includes,
    filters,
    page,
    limit,
  }: GetEducationsParams<I>): Promise<ApiEducation<I>[]> => {
    await getAuthAdminUser({ strict: visibility === "admin" });

    const pagination = await parsePagination({
      page,
      pageSize: PAGE_SIZES.education,
      getCount: async () => await getEducationsCount({ filters, visibility }),
    });

    if (pagination !== null && limit !== undefined) {
      throw new Error("The method cannot be used with both pagination and a 'limit' parameter!");
    }

    const educations = await prisma.education.findMany({
      where: whereClause({ filters, visibility }),
      include: {
        school: true,
        skills: fieldIsIncluded("skills", includes)
          ? { where: { visible: visibility === "public" ? true : undefined } }
          : undefined,
        courses: fieldIsIncluded("courses", includes)
          ? {
              include: {
                skills: fieldIsIncluded("skills", includes)
                  ? { where: { visible: visibility === "public" ? true : undefined } }
                  : undefined,
              },
              where: { visible: visibility === "public" ? true : undefined },
            }
          : undefined,
      },
      orderBy: { startDate: "desc" },
      skip: pagination ? pagination.pageSize * (pagination.page - 1) : undefined,
      take: pagination ? pagination.pageSize : limit,
    });

    if (fieldIsIncluded("details", includes)) {
      const details = await getDetails(
        educations.map(e => e.id),
        DetailEntityType.EDUCATION,
        {
          visibility,
          includes: (fieldIsIncluded("skills", includes)
            ? ["nestedDetails", "skills"]
            : ["nestedDetails"]) as EducationToDetailIncludes<I>,
        },
      );
      return educations.map(
        (edu): ApiEducation<I> =>
          convertToPlainObject({
            ...edu,
            details: details.filter(d => d.entityId === edu.id),
          }) as ApiEducation<I>,
      );
    }
    return educations.map(convertToPlainObject) as ApiEducation<I>[];
  },
) as {
  <I extends EducationIncludes>(params: GetEducationsParams<I>): Promise<ApiEducation<I>[]>;
};
