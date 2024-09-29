import { type ApiNestedDetail, type NestedDetailIncludes, fieldIsIncluded } from "~/database/model";
import { db } from "~/database/prisma";

import { standardDetailFetchAction, type StandardFetchActionReturn } from "~/actions";
import { ApiClientGlobalError } from "~/api";

export const fetchNestedDetail = <I extends NestedDetailIncludes>(includes: I) =>
  standardDetailFetchAction(
    async (id, _, { isAdmin, isVisible }): StandardFetchActionReturn<ApiNestedDetail<I>> => {
      const nestedDetail = await db.nestedDetail.findUnique({
        where: { id },
        include: {
          project: {
            include: {
              skills: fieldIsIncluded("skills", includes)
                ? { where: { visible: isVisible } }
                : undefined,
            },
          },
          skills: fieldIsIncluded("skills", includes)
            ? { where: { visible: isVisible } }
            : undefined,
        },
      });
      if (!nestedDetail) {
        return ApiClientGlobalError.NotFound({
          message: "The nestedDetail could not be found.",
        });
      } else if (!isAdmin && !nestedDetail.visible) {
        ApiClientGlobalError.Forbidden({
          message: "The user does not have permission to access this data.",
        });
      }
      return nestedDetail as ApiNestedDetail<I>;
    },
    { authenticated: true, adminOnly: true },
  );
