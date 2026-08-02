import { type ApiSkill, fieldIsIncluded, type SkillIncludes } from '~/database/model';
import { db } from '~/database/prisma';

import { standardDetailFetchAction, type StandardFetchActionReturn } from '~/actions';
import { ApiClientGlobalError } from '~/api';

export const fetchSkill = <I extends SkillIncludes>(includes: I) =>
  standardDetailFetchAction(
    async (id, _, { isAdmin, isVisible }): StandardFetchActionReturn<ApiSkill<I>> => {
      const skill = await db.skill.findUnique({
        include: {
          courses: fieldIsIncluded('courses', includes)
            ? { where: { visible: isVisible } }
            : undefined,
          educations: fieldIsIncluded('educations', includes)
            ? {
                include: { school: true },
                orderBy: { startDate: 'desc' },
                where: {
                  visible: isVisible,
                },
              }
            : undefined,
          experiences: fieldIsIncluded('experiences', includes)
            ? {
                include: { company: true },
                orderBy: { startDate: 'desc' },
                where: { visible: isVisible },
              }
            : undefined,
          projects: fieldIsIncluded('projects', includes),
          repositories: fieldIsIncluded('repositories', includes)
            ? { where: { visible: isVisible } }
            : undefined,
        },
        where: { id },
      });
      if (!skill) {
        return ApiClientGlobalError.NotFound({
          message: 'The skill could not be found.',
        });
      } else if (!isAdmin && !skill.visible) {
        ApiClientGlobalError.Forbidden({
          message: 'The user does not have permission to access this data.',
        });
      }
      return skill as ApiSkill<I>;
    },
    { adminOnly: false, authenticated: false },
  );
