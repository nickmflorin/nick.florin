import { type ApiSchool, fieldIsIncluded, type SchoolIncludes } from '~/database/model';
import { db } from '~/database/prisma';

import { standardDetailFetchAction, type StandardFetchActionReturn } from '~/actions';
import { ApiClientGlobalError } from '~/api';

export const fetchSchool = <I extends SchoolIncludes>(includes: I) =>
  standardDetailFetchAction(
    async (id, _, { isVisible }): StandardFetchActionReturn<ApiSchool<I>> => {
      const school = (await db.school.findUnique({
        include: {
          educations: fieldIsIncluded('educations', includes)
            ? { where: { visible: isVisible } }
            : undefined,
        },
        where: { id },
      })) as ApiSchool<I> | null;
      if (!school) {
        return ApiClientGlobalError.NotFound({
          message: 'The school could not be found.',
        });
      }
      return school;
    },
    { adminOnly: true, authenticated: true },
  );
