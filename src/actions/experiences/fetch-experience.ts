import {
  type ApiExperience,
  DetailEntityType,
  type ExperienceIncludes,
  fieldIsIncluded,
  removeRedundantTopLevelSkills,
} from '~/database/model';
import { db } from '~/database/prisma';

import { standardDetailFetchAction, type StandardFetchActionReturn } from '~/actions';
import { ApiClientGlobalError } from '~/api';

export const fetchExperience = <I extends ExperienceIncludes>(includes: I) =>
  standardDetailFetchAction(
    async (id, _, { isAdmin, isVisible }): StandardFetchActionReturn<ApiExperience<I>> => {
      let experience = (await db.experience.findUnique({
        include: {
          company: true,
          skills: fieldIsIncluded('skills', includes)
            ? { where: { visible: isVisible } }
            : undefined,
        },
        where: { id },
      })) as ApiExperience<I> | null;

      if (!experience) {
        return ApiClientGlobalError.NotFound({
          message: 'The experience could not be found.',
        });
      } else if (!isAdmin && !experience.visible) {
        ApiClientGlobalError.Forbidden({
          message: 'The user does not have permission to access this data.',
        });
      }
      if (fieldIsIncluded('details', includes)) {
        experience = removeRedundantTopLevelSkills({
          ...experience,
          details: await db.detail.findMany({
            include: {
              nestedDetails: {
                include: {
                  project: {
                    include: {
                      skills: fieldIsIncluded('skills', includes)
                        ? { where: { visible: isVisible } }
                        : undefined,
                    },
                  },
                  skills: fieldIsIncluded('skills', includes)
                    ? { where: { visible: isVisible } }
                    : undefined,
                },
                orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
                where: {
                  visible: isVisible,
                },
              },
              project: {
                include: {
                  skills: fieldIsIncluded('skills', includes)
                    ? { where: { visible: isVisible } }
                    : undefined,
                },
              },
              skills: fieldIsIncluded('skills', includes)
                ? { where: { visible: isVisible } }
                : undefined,
            },
            where: {
              entityId: { in: [experience.id] },
              entityType: DetailEntityType.EXPERIENCE,
              visible: isVisible,
            },
          }),
        });
      }
      return experience;
    },
    { adminOnly: false, authenticated: false },
  );
