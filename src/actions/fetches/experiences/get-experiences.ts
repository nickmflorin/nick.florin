import "server-only";

import { cache } from "react";

import { getClerkAuthedUser } from "~/application/auth/server";
import {
  type ApiExperience,
  DetailEntityType,
  type ExperienceIncludes,
  fieldIsIncluded,
  type ExperienceToDetailIncludes,
} from "~/database/model";
import { db } from "~/database/prisma";
import { conditionalAndClause } from "~/database/util";

import { parsePagination, type ApiStandardListQuery } from "~/api/query";
import { convertToPlainObject } from "~/api/serialization";

import { PAGE_SIZES, constructTableSearchClause } from "../constants";
import { getDetails } from "../details";

export type GetExperiencesFilters = {
  readonly search: string;
  readonly highlighted: boolean;
};

export type GetExperiencesParams<I extends ExperienceIncludes> = Omit<
  ApiStandardListQuery<I, Partial<GetExperiencesFilters>>,
  "orderBy"
>;

const whereClause = ({
  filters,
  visibility,
}: Pick<GetExperiencesParams<ExperienceIncludes>, "filters" | "visibility">) =>
  conditionalAndClause([
    { clause: { visible: true }, condition: visibility === "public" },
    filters?.search ? constructTableSearchClause("experience", filters.search) : null,
    filters?.highlighted !== undefined ? { highlighted: filters.highlighted } : null,
  ]);

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
    await getClerkAuthedUser({ strict: visibility === "admin" });
    return await db.experience.count({
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
    limit,
  }: GetExperiencesParams<I>): Promise<ApiExperience<I>[]> => {
    await getClerkAuthedUser({ strict: visibility === "admin" });

    const pagination = await parsePagination({
      page,
      pageSize: PAGE_SIZES.experience,
      getCount: async () => await getExperiencesCount({ filters, visibility }),
    });

    if (pagination !== null && limit !== undefined) {
      throw new Error("The method cannot be used with both pagination and a 'limit' parameter!");
    }
    const experiences = await db.experience.findMany({
      where: whereClause({ filters, visibility }),
      include: {
        company: true,
        skills: fieldIsIncluded("skills", includes)
          ? { where: { visible: visibility === "public" ? true : undefined } }
          : undefined,
      },
      orderBy: { startDate: "desc" },
      skip: pagination ? pagination.pageSize * (pagination.page - 1) : undefined,
      take: pagination ? pagination.pageSize : limit,
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
