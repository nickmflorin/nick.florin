import "server-only";
import { cache } from "react";

import clamp from "lodash.clamp";

import { prisma } from "~/prisma/client";
import { constructOrSearch } from "~/prisma/util";

import { SKILLS_ADMIN_TABLE_PAGE_SIZE } from "./constants";

interface GetSkillsParams {
  readonly page: number;
  readonly filters: {
    readonly educations: string[];
    readonly experiences: string[];
    readonly search: string;
  };
}

export const preloadSkills = (params: GetSkillsParams) => {
  void getSkills(params);
};

export const getSkills = cache(async ({ page, filters }: GetSkillsParams) => {
  const count = await getSkillsCount({ filters });
  const numPages = Math.max(Math.ceil(count / SKILLS_ADMIN_TABLE_PAGE_SIZE), 1);
  return await prisma.skill.findMany({
    where: {
      AND: [
        constructOrSearch(filters.search, ["slug", "label"]),
        {
          educations:
            filters.educations.length !== 0
              ? { some: { educationId: { in: filters.educations } } }
              : undefined,
          experiences:
            filters.experiences.length !== 0
              ? { some: { experienceId: { in: filters.experiences } } }
              : undefined,
        },
      ],
    },
    orderBy: { createdAt: "desc" },
    skip: SKILLS_ADMIN_TABLE_PAGE_SIZE * (clamp(page, 1, numPages) - 1),
    take: SKILLS_ADMIN_TABLE_PAGE_SIZE,
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
