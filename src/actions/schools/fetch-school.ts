import type { ApiSchool, SchoolIncludes } from "~/database/model";
import { fieldIsIncluded } from "~/database/model";
import { db } from "~/database/prisma";

import { standardDetailFetchAction, type StandardFetchActionReturn } from "~/actions";
import { ApiClientGlobalError } from "~/api";

export const fetchSchool = <I extends SchoolIncludes>(includes: I) =>
  standardDetailFetchAction(
    async (id, _, { isVisible }): StandardFetchActionReturn<ApiSchool<I>> => {
      const school = (await db.school.findUnique({
        where: { id },
        include: {
          educations: fieldIsIncluded("educations", includes)
            ? { where: { visible: isVisible } }
            : undefined,
        },
      })) as ApiSchool<I>;
      if (!school) {
        return ApiClientGlobalError.NotFound({
          message: "The school could not be found.",
        });
      }
      return school as ApiSchool<I>;
    },
    { authenticated: true, adminOnly: true },
  );
