import { type ApiNestedDetail, fieldIsIncluded, type NestedDetailIncludes } from '~/database/model';
import { db } from '~/database/prisma';

import { standardDetailFetchAction, type StandardFetchActionReturn } from '~/actions';
import { ApiClientGlobalError } from '~/api';

export const fetchNestedDetail = <I extends NestedDetailIncludes>(includes: I) =>
  standardDetailFetchAction(
    async (id, _, { isAdmin, isVisible }): StandardFetchActionReturn<ApiNestedDetail<I>> => {
      const nestedDetail = await db.nestedDetail.findUnique({
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
        where: { id },
      });
      if (!nestedDetail) {
        return ApiClientGlobalError.NotFound({
          message: 'The nestedDetail could not be found.',
        });
      } else if (!isAdmin && !nestedDetail.visible) {
        ApiClientGlobalError.Forbidden({
          message: 'The user does not have permission to access this data.',
        });
      }
      return nestedDetail as ApiNestedDetail<I>;
    },
    { adminOnly: true, authenticated: true },
  );
