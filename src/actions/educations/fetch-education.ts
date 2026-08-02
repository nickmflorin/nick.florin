import {
  type ApiEducation,
  DetailEntityType,
  type EducationIncludes,
  fieldIsIncluded,
  removeRedundantTopLevelSkills,
} from '~/database/model';
import { db } from '~/database/prisma';

import { standardDetailFetchAction, type StandardFetchActionReturn } from '~/actions';
import { ApiClientGlobalError } from '~/api';

export const fetchEducation = <I extends EducationIncludes>(includes: I) =>
  standardDetailFetchAction(
    async (id, _, { isAdmin, isVisible }): StandardFetchActionReturn<ApiEducation<I>> => {
      const education = (await db.education.findUnique({
        include: {
          courses: fieldIsIncluded('courses', includes)
            ? {
                include: {
                  skills: fieldIsIncluded('skills', includes)
                    ? { where: { visible: isVisible } }
                    : undefined,
                },
                where: { visible: isVisible },
              }
            : undefined,
          school: true,
          skills: fieldIsIncluded('skills', includes)
            ? { where: { visible: isVisible } }
            : undefined,
        },
        where: { id },
      })) as ApiEducation<I> | null;

      if (!education) {
        return ApiClientGlobalError.NotFound({
          message: 'The education could not be found.',
        });
      } else if (!isAdmin && !education.visible) {
        ApiClientGlobalError.Forbidden({
          message: 'The user does not have permission to access this data.',
        });
      }
      if (fieldIsIncluded('details', includes)) {
        const e = {
          ...education,
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
              entityId: { in: [education.id] },
              entityType: DetailEntityType.EDUCATION,
              visible: isVisible,
            },
          }),
        };
        if (fieldIsIncluded('skills', includes)) {
          return removeRedundantTopLevelSkills(e);
        }
        return e;
      }
      return education;
    },
    { adminOnly: false, authenticated: false },
  );
