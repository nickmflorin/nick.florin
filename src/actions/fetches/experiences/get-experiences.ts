import "server-only";
import { cache } from "react";

import omit from "lodash.omit";

import { getAuthAdminUser } from "~/application/auth";
import { prisma } from "~/prisma/client";
import {
  type ApiExperience,
  DetailEntityType,
  type ExpIncludes,
  type Skill,
  type ApiDetail,
  type ExperienceOnSkills,
  fieldIsIncluded,
} from "~/prisma/model";
import { constructOrSearch } from "~/prisma/util";
import { parsePagination, type Visibility } from "~/api/query";

import { EXPERIENCES_ADMIN_TABLE_PAGE_SIZE } from "../constants";
import { getDetails } from "../details";

const SEARCH_FIELDS = ["title", "shortTitle"] as const;

type GetExperiencesFilters = {
  readonly search: string;
};

type GetExperiencesParams<I extends ExpIncludes> = {
  readonly visibility?: Visibility;
  readonly includes?: I;
  readonly filters?: GetExperiencesFilters;
  readonly page?: number;
};

const whereClause = ({
  filters,
  visibility = "public",
}: Pick<GetExperiencesParams<ExpIncludes>, "visibility" | "filters">) =>
  ({
    AND:
      filters?.search && visibility === "public"
        ? [constructOrSearch(filters.search, [...SEARCH_FIELDS]), { visible: true }]
        : filters?.search
          ? [constructOrSearch(filters.search, [...SEARCH_FIELDS])]
          : visibility === "public"
            ? { visible: true }
            : undefined,
  }) as const;

export const preloadExperiencesCount = (
  params: Pick<GetExperiencesParams<ExpIncludes>, "visibility" | "filters">,
) => {
  void getExperiencesCount(params);
};

export const getExperiencesCount = cache(
  async ({
    filters,
    visibility = "public",
  }: Pick<GetExperiencesParams<ExpIncludes>, "visibility" | "filters">) => {
    /* TODO: We have to figure out how to get this to render an API response, instead of throwing
       a hard error, in the case that this is being called from the context of a route handler. */
    await getAuthAdminUser({ strict: visibility === "admin" });
    return await prisma.experience.count({
      where: whereClause({ filters, visibility }),
    });
  },
);

export const preloadExperiences = <I extends ExpIncludes>(params: GetExperiencesParams<I>) => {
  void getExperiences(params);
};

export const getExperiences = cache(
  async <I extends ExpIncludes>({
    visibility = "public",
    includes,
    filters,
    page,
  }: GetExperiencesParams<I>): Promise<ApiExperience<I>[]> => {
    /* TODO: We have to figure out how to get this to render an API response, instead of throwing
       a hard error, in the case that this is being called from the context of a route handler. */
    await getAuthAdminUser({ strict: visibility === "admin" });

    const pagination = await parsePagination({
      page,
      // TODO: This will eventually have to be dynamic, specified as a query parameter.
      pageSize: EXPERIENCES_ADMIN_TABLE_PAGE_SIZE,
      getCount: async () => await getExperiencesCount({ filters, visibility }),
    });

    const exps = await prisma.experience.findMany({
      include: { company: true },
      where: whereClause({ filters, visibility }),
      orderBy: { startDate: "desc" },
      skip: pagination ? pagination.pageSize * (pagination.page - 1) : undefined,
      take: pagination ? pagination.pageSize : undefined,
    });

    let experienceSkills: (Skill & { readonly experiences: ExperienceOnSkills[] })[] | undefined =
      undefined;
    if (fieldIsIncluded("skills", includes)) {
      experienceSkills = await prisma.skill.findMany({
        include: { experiences: true },
        where: {
          visible: visibility === "public" ? true : undefined,
          experiences: { some: { experience: { id: { in: exps.map(e => e.id) } } } },
        },
      });
    }

    let details: ApiDetail<["nestedDetails", "skills"]>[] | undefined = undefined;
    if (fieldIsIncluded("details", includes)) {
      details = await getDetails(
        exps.map(e => e.id),
        DetailEntityType.EXPERIENCE,
        { visibility, includes: ["nestedDetails", "skills"] },
      );
    }

    const experiences = exps.map((exp): ApiExperience<I> => {
      let modified: ApiExperience<I> = { ...exp } as ApiExperience<I>;
      if (experienceSkills) {
        modified = {
          ...modified,
          skills: experienceSkills
            .filter(s => s.experiences.some(e => e.experienceId === exp.id))
            .map(s => omit(s, "experiences")),
        };
      }
      if (details) {
        modified = { ...modified, details: details.filter(d => d.entityId === exp.id) };
      }
      return modified as ApiExperience<I>;
    });

    return experiences as ApiExperience<I>[];
  },
) as {
  <I extends ExpIncludes>(params: GetExperiencesParams<I>): Promise<ApiExperience<I>[]>;
};
