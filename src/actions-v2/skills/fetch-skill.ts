import type { ApiSkill, SkillIncludes } from "~/database/model";
import { fieldIsIncluded } from "~/database/model";
import { db } from "~/database/prisma";

import { standardDetailFetchAction, type StandardFetchActionReturn } from "~/actions-v2";
import { ApiClientGlobalError } from "~/api-v2";

export const fetchSkill = <I extends SkillIncludes>(includes: I) =>
  standardDetailFetchAction(
    async (id, _, { isVisible, isAdmin }): StandardFetchActionReturn<ApiSkill<I>> => {
      const skill = await db.skill.findUnique({
        where: { id },
        include: {
          courses: fieldIsIncluded("courses", includes)
            ? { where: { visible: isVisible } }
            : undefined,
          repositories: fieldIsIncluded("repositories", includes)
            ? { where: { visible: isVisible } }
            : undefined,
          projects: fieldIsIncluded("projects", includes),
          educations: fieldIsIncluded("educations", includes)
            ? {
                where: {
                  visible: isVisible,
                },
                include: { school: true },
                orderBy: { startDate: "desc" },
              }
            : undefined,
          experiences: fieldIsIncluded("experiences", includes)
            ? {
                where: { visible: isVisible },
                include: { company: true },
                orderBy: { startDate: "desc" },
              }
            : undefined,
        },
      });
      if (!skill) {
        return ApiClientGlobalError.NotFound({
          message: "The skill could not be found.",
        });
      } else if (!isAdmin && !skill.visible) {
        ApiClientGlobalError.Forbidden({
          message: "The user does not have permission to access this data.",
        });
      }
      return skill as ApiSkill<I>;
    },
    { authenticated: false, adminOnly: false },
  );
