import "server-only";
import { cache } from "react";

import { prisma } from "~/prisma/client";
import {
  type ApiEducation,
  DetailEntityType,
  type EduIncludes,
  type EduSkill,
  type EduDetail,
} from "~/prisma/model";

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
        where: { educations: { some: { education: { id: { in: edus.map(e => e.id) } } } } },
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
