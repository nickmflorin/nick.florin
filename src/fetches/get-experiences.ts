import "server-only";
import { cache } from "react";

import { prisma } from "~/prisma/client";
import {
  type ApiExperience,
  DetailEntityType,
  type ExpIncludes,
  type ExpSkill,
  type ExpDetail,
} from "~/prisma/model";

export const preloadExperiences = <I extends ExpIncludes>(includes: I) => {
  void getExperiences(includes);
};

export const getExperiences = cache(
  async <I extends ExpIncludes>(includes: I): Promise<ApiExperience<I>[]> => {
    const exps = await prisma.experience.findMany({
      include: { company: true },
      orderBy: { startDate: "desc" },
    });

    let skills: ExpSkill[] = [];
    if (includes.skills === true) {
      skills = await prisma.skill.findMany({
        include: { experiences: true },
        where: { experiences: { some: { experience: { id: { in: exps.map(e => e.id) } } } } },
      });
    }
    let details: ExpDetail[] = [];
    if (includes.details === true) {
      details = await prisma.detail.findMany({
        where: {
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
  <I extends ExpIncludes>(includes: I): Promise<ApiExperience<I>[]>;
};
