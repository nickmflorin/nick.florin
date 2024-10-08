import type { ApiCompany, CompanyIncludes } from "~/database/model";
import { fieldIsIncluded } from "~/database/model";
import { db } from "~/database/prisma";

import { standardDetailFetchAction, type StandardFetchActionReturn } from "~/actions";
import { ApiClientGlobalError } from "~/api";

export const fetchCompany = <I extends CompanyIncludes>(includes: I) =>
  standardDetailFetchAction(
    async (id, _, { isVisible }): StandardFetchActionReturn<ApiCompany<I>> => {
      const company = (await db.company.findUnique({
        where: { id },
        include: {
          experiences: fieldIsIncluded("experiences", includes)
            ? { where: { visible: isVisible } }
            : undefined,
        },
      })) as ApiCompany<I>;
      if (!company) {
        return ApiClientGlobalError.NotFound({
          message: "The company could not be found.",
        });
      }
      return company as ApiCompany<I>;
    },
    { authenticated: true, adminOnly: true },
  );
