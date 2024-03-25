import "server-only";
import { cache } from "react";

import { getAuthAdminUser } from "~/application/auth";
import { prisma } from "~/prisma/client";
import {
  type ApiExperience,
  DetailEntityType,
  type ExpIncludes,
  type ExpSkill,
  type ExpDetail,
} from "~/prisma/model";
import { constructOrSearch } from "~/prisma/util";
import { parsePagination } from "~/actions/pagination";
import { type Visibility } from "~/actions/visibility";

import { EXPERIENCES_ADMIN_TABLE_PAGE_SIZE } from "./constants";

const SEARCH_FIELDS = ["title", "shortTitle"] as const;

type GetExperiencesFilters = {
  readonly search: string;
};

type GetExperiencesParams<I extends ExpIncludes> = {
  visibility?: Visibility;
  includes?: I;
  filters?: GetExperiencesFilters;
  page?: number;
};

export const preloadExperiencesCount = (
  params: Pick<GetExperiencesParams<ExpIncludes>, "visibility" | "filters">,
) => {
  void getExperiencesCount(params);
};

export const getExperiencesCount = cache(
  async ({
    filters,
    visibility,
  }: Pick<GetExperiencesParams<ExpIncludes>, "visibility" | "filters">) =>
    await prisma.experience.count({
      where: {
        AND:
          filters?.search && visibility === "public"
            ? [constructOrSearch(filters.search, [...SEARCH_FIELDS]), { visible: true }]
            : filters?.search
              ? [constructOrSearch(filters.search, [...SEARCH_FIELDS])]
              : visibility === "public"
                ? { visible: true }
                : undefined,
      },
    }),
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
    await getAuthAdminUser({ strict: visibility === "admin" });

    const pagination = await parsePagination({
      page,
      filters,
      visibility,
      // TODO: This will eventually have to be dynamic, specified as a query parameter.
      pageSize: EXPERIENCES_ADMIN_TABLE_PAGE_SIZE,
      getCount: getExperiencesCount,
    });

    const exps = await prisma.experience.findMany({
      include: { company: true },
      where: {
        AND:
          filters?.search && visibility === "public"
            ? [constructOrSearch(filters.search, [...SEARCH_FIELDS]), { visible: true }]
            : filters?.search
              ? [constructOrSearch(filters.search, [...SEARCH_FIELDS])]
              : visibility === "public"
                ? { visible: true }
                : undefined,
      },
      orderBy: { startDate: "desc" },
      skip: pagination ? pagination.pageSize * (pagination.page - 1) : undefined,
      take: pagination ? pagination.pageSize : undefined,
    });

    let skills: ExpSkill[] = [];
    if (includes?.skills === true) {
      skills = await prisma.skill.findMany({
        include: { experiences: true },
        where: {
          visible: visibility === "public" ? true : undefined,
          experiences: { some: { experience: { id: { in: exps.map(e => e.id) } } } },
        },
      });
    }
    let details: ExpDetail[] = [];
    if (includes?.details === true) {
      details = await prisma.detail.findMany({
        where: {
          visible: visibility === "public" ? true : undefined,
          entityType: DetailEntityType.EXPERIENCE,
          entityId: { in: exps.map(e => e.id) },
        },
        // Accounts for cases where multiple details were created at the same time due to seeding.
        include: { nestedDetails: { orderBy: [{ createdAt: "desc" }, { id: "desc" }] } },
        // Accounts for cases where multiple details were created at the same time due to seeding.
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      });
    }

    const experiences = exps.map((exp): ApiExperience<I> => {
      let modified: ApiExperience<I> = { ...exp } as ApiExperience<I>;
      if (includes?.skills === true) {
        modified = {
          ...modified,
          skills: skills.filter(s => s.experiences.some(e => e.experienceId === exp.id)),
        };
      }
      if (includes?.details === true) {
        modified = { ...modified, details: details.filter(d => d.entityId === exp.id) };
      }
      return modified as ApiExperience<I>;
    });

    return experiences as ApiExperience<I>[];
  },
) as {
  <I extends ExpIncludes>(params: GetExperiencesParams<I>): Promise<ApiExperience<I>[]>;
};
