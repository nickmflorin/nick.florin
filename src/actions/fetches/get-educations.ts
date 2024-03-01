import "server-only";
import { cache } from "react";

import clamp from "lodash.clamp";

import { prisma } from "~/prisma/client";
import {
  type ApiEducation,
  DetailEntityType,
  type EduIncludes,
  type EduSkill,
  type EduDetail,
} from "~/prisma/model";
import { constructOrSearch } from "~/prisma/util";

import { EDUCATIONS_ADMIN_TABLE_PAGE_SIZE } from "./constants";

interface GetAdminEducationsParams {
  readonly page: number;
  readonly filters: {
    readonly search: string;
  };
}

export const preloadAdminEducationsCount = (params: Omit<GetAdminEducationsParams, "page">) => {
  void getAdminEducationsCount(params);
};

export const getAdminEducationsCount = cache(
  async ({ filters }: Omit<GetAdminEducationsParams, "page">) =>
    await prisma.education.count({
      where: {
        AND: [constructOrSearch(filters.search, ["major", "concentration", "minor"])],
      },
    }),
);

export const preloadAdminEducations = (params: GetAdminEducationsParams) => {
  void getAdminEducations(params);
};

export const getAdminEducations = cache(
  async ({
    filters,
    page,
  }: GetAdminEducationsParams): Promise<ApiEducation<{ skills: true; details: true }>[]> => {
    const count = await getAdminEducationsCount({ filters });
    const numPages = Math.max(Math.ceil(count / EDUCATIONS_ADMIN_TABLE_PAGE_SIZE), 1);

    const edus = await prisma.education.findMany({
      include: { school: true },
      where: {
        AND: [constructOrSearch(filters.search, ["major", "concentration", "minor"])],
      },
      orderBy: { startDate: "desc" },
      skip: EDUCATIONS_ADMIN_TABLE_PAGE_SIZE * (clamp(page, 1, numPages) - 1),
      take: EDUCATIONS_ADMIN_TABLE_PAGE_SIZE,
    });

    const skills = await prisma.skill.findMany({
      include: { educations: true },
      where: {
        visible: true,
        educations: { some: { education: { id: { in: edus.map(e => e.id) } } } },
      },
    });

    const details = await prisma.detail.findMany({
      where: {
        entityType: DetailEntityType.EDUCATION,
        entityId: { in: edus.map(e => e.id) },
      },
      include: { nestedDetails: true },
      orderBy: { createdAt: "desc" },
    });

    return edus.map(
      (edu): ApiEducation<{ skills: true; details: true }> => ({
        ...edu,
        skills: skills.filter(s => s.educations.some(e => e.educationId === edu.id)),
        details: details.filter(d => d.entityId === edu.id),
      }),
    );
  },
);

export const preloadEducations = <I extends EduIncludes>(includes: I) => {
  void getEducations(includes);
};

export const getEducations = cache(
  async <I extends EduIncludes>(includes: I): Promise<ApiEducation<I>[]> => {
    const edus = await prisma.education.findMany({
      include: { school: true },
      orderBy: { startDate: "desc" },
    });

    let skills: EduSkill[] = [];
    if (includes.skills === true) {
      skills = await prisma.skill.findMany({
        include: { educations: true },
        where: {
          visible: true,
          educations: { some: { education: { id: { in: edus.map(e => e.id) } } } },
        },
      });
    }
    let details: EduDetail[] = [];
    if (includes.details === true) {
      details = await prisma.detail.findMany({
        where: {
          entityType: DetailEntityType.EDUCATION,
          entityId: { in: edus.map(e => e.id) },
        },
        include: { nestedDetails: true },
        orderBy: { createdAt: "desc" },
      });
    }

    const educations = edus.map((edu): ApiEducation<I> => {
      let modified: ApiEducation<I> = { ...edu } as ApiEducation<I>;
      if (includes.skills === true) {
        modified = {
          ...modified,
          skills: skills.filter(s => s.educations.some(e => e.educationId === edu.id)),
        };
      }
      if (includes.details === true) {
        modified = { ...modified, details: details.filter(d => d.entityId === edu.id) };
      }
      return modified as ApiEducation<I>;
    });

    return educations as ApiEducation<I>[];
  },
) as {
  <I extends EduIncludes>(includes: I): Promise<ApiEducation<I>[]>;
};
