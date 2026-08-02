import { type ApiDetail, type DetailIncludes, fieldIsIncluded } from '~/database/model';
import { db } from '~/database/prisma';

import { standardDetailFetchAction, type StandardFetchActionReturn } from '~/actions';
import { ApiClientGlobalError } from '~/api';

export const fetchDetail = <I extends DetailIncludes>(includes: I) =>
  standardDetailFetchAction(
    async (id, _, { isAdmin, isVisible }): StandardFetchActionReturn<ApiDetail<I>> => {
      const detail = await db.detail.findUnique({
        include: {
          nestedDetails: fieldIsIncluded('nestedDetails', includes)
            ? {
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
              }
            : undefined,
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
        where: { id },
      });
      if (!detail) {
        return ApiClientGlobalError.NotFound({
          message: 'The detail could not be found.',
        });
      } else if (!isAdmin && !detail.visible) {
        ApiClientGlobalError.Forbidden({
          message: 'The user does not have permission to access this data.',
        });
      }
      return detail as ApiDetail<I>;
    },
    { adminOnly: true, authenticated: true },
  );
