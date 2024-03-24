import "server-only";
import { cache } from "react";

import clamp from "lodash.clamp";

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
import { type Visibility } from "~/app/api/types";

import { EXPERIENCES_ADMIN_TABLE_PAGE_SIZE } from "./constants";

interface GetAdminExperiencesParams {
  readonly page: number;
  readonly filters: {
    readonly search: string;
  };
}

export const preloadAdminExperiencesCount = (params: Omit<GetAdminExperiencesParams, "page">) => {
  void getAdminExperiencesCount(params);
};

export const getAdminExperiencesCount = cache(
  async ({ filters }: Omit<GetAdminExperiencesParams, "page">) =>
    await prisma.experience.count({
      where: {
        AND: [constructOrSearch(filters.search, ["title", "shortTitle"])],
      },
    }),
);

export const preloadAdminExperiences = (params: GetAdminExperiencesParams) => {
  void getAdminExperiences(params);
};

export const getAdminExperiences = cache(
  async ({
    filters,
    page,
  }: GetAdminExperiencesParams): Promise<ApiExperience<{ skills: true; details: true }>[]> => {
    const count = await getAdminExperiencesCount({ filters });
    const numPages = Math.max(Math.ceil(count / EXPERIENCES_ADMIN_TABLE_PAGE_SIZE), 1);

    const exps = await prisma.experience.findMany({
      include: { company: true },
      where: {
        AND: [constructOrSearch(filters.search, ["title", "shortTitle"])],
      },
      orderBy: { startDate: "desc" },
      skip: EXPERIENCES_ADMIN_TABLE_PAGE_SIZE * (clamp(page, 1, numPages) - 1),
      take: EXPERIENCES_ADMIN_TABLE_PAGE_SIZE,
    });

    const skills = await prisma.skill.findMany({
      include: { experiences: true },
      where: {
        experiences: { some: { experience: { id: { in: exps.map(e => e.id) } } } },
      },
    });

    const details = await prisma.detail.findMany({
      where: {
        entityType: DetailEntityType.EXPERIENCE,
        entityId: { in: exps.map(e => e.id) },
      },
      include: { nestedDetails: true },
      orderBy: { createdAt: "desc" },
    });

    return exps.map(
      (exp): ApiExperience<{ skills: true; details: true }> => ({
        ...exp,
        skills: skills.filter(s => s.experiences.some(e => e.experienceId === exp.id)),
        details: details.filter(d => d.entityId === exp.id),
      }),
    );
  },
);

export const preloadExperiences = <I extends ExpIncludes>(includes: I) => {
  void getExperiences(includes);
};

export const getExperiences = cache(
  async <I extends ExpIncludes>(
    includes: I,
    options?: { visibility?: Visibility },
  ): Promise<ApiExperience<I>[]> => {
    const visibility = options?.visibility ?? "public";
    await getAuthAdminUser({ strict: visibility === "admin" });

    const exps = await prisma.experience.findMany({
      include: { company: true },
      orderBy: { startDate: "desc" },
      where: visibility === "public" ? { visible: true } : undefined,
    });

    let skills: ExpSkill[] = [];
    if (includes.skills === true) {
      skills = await prisma.skill.findMany({
        include: { experiences: true },
        where: {
          visible: visibility === "public" ? true : undefined,
          experiences: { some: { experience: { id: { in: exps.map(e => e.id) } } } },
        },
      });
    }
    let details: ExpDetail[] = [];
    if (includes.details === true) {
      details = await prisma.detail.findMany({
        where: {
          visible: visibility === "public" ? true : undefined,
          entityType: DetailEntityType.EXPERIENCE,
          entityId: { in: exps.map(e => e.id) },
        },
        include: { nestedDetails: true },
        orderBy: { createdAt: "desc" },
      });
    }

    const experiences = exps.map((exp): ApiExperience<I> => {
      let modified: ApiExperience<I> = { ...exp } as ApiExperience<I>;
      if (includes.skills === true) {
        modified = {
          ...modified,
          skills: skills.filter(s => s.experiences.some(e => e.experienceId === exp.id)),
        };
      }
      if (includes.details === true) {
        modified = { ...modified, details: details.filter(d => d.entityId === exp.id) };
      }
      return modified as ApiExperience<I>;
    });

    return experiences as ApiExperience<I>[];
  },
) as {
  <I extends ExpIncludes>(
    includes: I,
    opts?: { visibility?: Visibility },
  ): Promise<ApiExperience<I>[]>;
};
