import "server-only";
import { cache } from "react";

import clamp from "lodash.clamp";

import { prisma } from "~/prisma/client";
import { constructOrSearch } from "~/prisma/util";

import { PAGE_SIZE } from "./constants";
import { type SkillsTableFilters } from "./types";

interface GetSkillsParams {
  readonly page: number;
  readonly filters: SkillsTableFilters;
}

export const preloadSkills = (params: GetSkillsParams) => {
  void getSkills(params);
};

export const getSkills = cache(async ({ page, filters }: GetSkillsParams) => {
  const count = await getSkillsCount({ filters });
  const numPages = Math.max(Math.ceil(count / PAGE_SIZE), 1);
  return await prisma.skill.findMany({
    where: {
      AND: [
        constructOrSearch(filters.search, ["slug", "label"]),
        {
          educations:
            filters.educations.length !== 0
              ? { some: { educationId: { in: filters.educations } } }
              : undefined,
        },
      ],
    },
    orderBy: { createdAt: "desc" },
    skip: PAGE_SIZE * (clamp(page, 1, numPages) - 1),
    take: PAGE_SIZE,
  });
});

export const preloadSkillsCount = (params: Omit<GetSkillsParams, "page">) => {
  void getSkillsCount(params);
};

export const getSkillsCount = cache(
  async ({ filters }: Omit<GetSkillsParams, "page">) =>
    await prisma.skill.count({
      where: {
        AND: [
          constructOrSearch(filters.search, ["slug", "label"]),
          {
            educations:
              filters.educations.length !== 0
                ? { some: { educationId: { in: filters.educations } } }
                : undefined,
          },
        ],
      },
    }),
);
