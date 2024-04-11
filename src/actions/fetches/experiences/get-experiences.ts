import "server-only";
import { cache } from "react";

import { getAuthAdminUser } from "~/application/auth";
import { prisma } from "~/prisma/client";
import {
  type ApiExperience,
  DetailEntityType,
  type ExperienceIncludes,
  fieldIsIncluded,
  type ExperienceToDetailIncludes,
} from "~/prisma/model";
import { parsePagination, type Visibility } from "~/api/query";
import { convertToPlainObject } from "~/api/serialization";

import { PAGE_SIZES, constructTableSearchClause } from "../constants";
import { getDetails } from "../details";

interface GetExperiencesFilters {
  readonly search: string;
}

type GetExperiencesParams<I extends ExperienceIncludes> = {
  visibility: Visibility;
  includes: I;
  filters?: GetExperiencesFilters;
  page?: number;
};

const whereClause = ({
  filters,
  visibility,
}: Pick<GetExperiencesParams<ExperienceIncludes>, "visibility" | "filters">) =>
  ({
    AND:
      filters?.search && visibility === "public"
        ? [constructTableSearchClause("experience", filters.search), { visible: true }]
        : filters?.search
          ? [constructTableSearchClause("experience", filters.search)]
          : visibility === "public"
            ? { visible: true }
            : undefined,
  }) as const;

export const preloadExperiencesCount = (
  params: Pick<GetExperiencesParams<ExperienceIncludes>, "visibility" | "filters">,
) => {
  void getExperiencesCount(params);
};

export const getExperiencesCount = cache(
  async ({
    filters,
    visibility,
  }: Pick<GetExperiencesParams<ExperienceIncludes>, "visibility" | "filters">) => {
    /* TODO: We have to figure out how to get this to render an API response, instead of throwing
       a hard error, in the case that this is being called from the context of a route handler. */
    await getAuthAdminUser({ strict: visibility === "admin" });
    return await prisma.experience.count({
      where: whereClause({ filters, visibility }),
    });
  },
);

export const preloadExperiences = <I extends ExperienceIncludes>(
  params: GetExperiencesParams<I>,
) => {
  void getExperiences(params);
};

export const getExperiences = cache(
  async <I extends ExperienceIncludes>({
    visibility,
    includes,
    filters,
    page,
  }: GetExperiencesParams<I>): Promise<ApiExperience<I>[]> => {
    await getAuthAdminUser({ strict: visibility === "admin" });

    const pagination = await parsePagination({
      page,
      pageSize: PAGE_SIZES.experience,
      getCount: async () => await getExperiencesCount({ filters, visibility }),
    });

    const experiences = await prisma.experience.findMany({
      where: whereClause({ filters, visibility }),
      include: {
        company: true,
        skills: fieldIsIncluded("skills", includes)
          ? { where: { visible: visibility === "public" ? true : undefined } }
          : undefined,
      },
      orderBy: { startDate: "desc" },
      skip: pagination ? pagination.pageSize * (pagination.page - 1) : undefined,
      take: pagination ? pagination.pageSize : undefined,
    });

    if (fieldIsIncluded("details", includes)) {
      const details = await getDetails(
        experiences.map(e => e.id),
        DetailEntityType.EXPERIENCE,
        {
          visibility,
          includes: (fieldIsIncluded("skills", includes)
            ? ["nestedDetails", "skills"]
            : ["nestedDetails"]) as ExperienceToDetailIncludes<I>,
        },
      );
      return experiences.map(
        (edu): ApiExperience<I> =>
          convertToPlainObject({
            ...edu,
            details: details.filter(d => d.entityId === edu.id),
          }) as ApiExperience<I>,
      );
    }
    return experiences.map(convertToPlainObject) as ApiExperience<I>[];
  },
) as {
  <I extends ExperienceIncludes>(params: GetExperiencesParams<I>): Promise<ApiExperience<I>[]>;
};
