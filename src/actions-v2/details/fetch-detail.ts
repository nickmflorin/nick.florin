import { type ApiDetail, type DetailIncludes, fieldIsIncluded } from "~/database/model";
import { db } from "~/database/prisma";

import { standardDetailFetchAction, type StandardFetchActionReturn } from "~/actions-v2";
import { ApiClientGlobalError } from "~/api-v2";

export const fetchDetail = <I extends DetailIncludes>(includes: I) =>
  standardDetailFetchAction(
    async (id, _, { isAdmin, isVisible }): StandardFetchActionReturn<ApiDetail<I>> => {
      const detail = await db.detail.findUnique({
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
          nestedDetails: fieldIsIncluded("nestedDetails", includes)
            ? {
                orderBy: [{ createdAt: "desc" }, { id: "desc" }],
                include: {
                  skills: fieldIsIncluded("skills", includes)
                    ? { where: { visible: isVisible } }
                    : undefined,
                  project: {
                    include: {
                      skills: fieldIsIncluded("skills", includes)
                        ? { where: { visible: isVisible } }
                        : undefined,
                    },
                  },
                },
              }
            : undefined,
        },
      });
      if (!detail) {
        return ApiClientGlobalError.NotFound({
          message: "The detail could not be found.",
        });
      } else if (!isAdmin && !detail.visible) {
        ApiClientGlobalError.Forbidden({
          message: "The user does not have permission to access this data.",
        });
      }
      return detail as ApiDetail<I>;
    },
    { authenticated: true, adminOnly: true },
  );
