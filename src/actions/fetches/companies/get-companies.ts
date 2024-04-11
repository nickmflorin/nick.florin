import "server-only";
import { cache } from "react";

import { getAuthAdminUser } from "~/application/auth";
import { prisma } from "~/prisma/client";
import { type CompanyIncludes, type ApiCompany, fieldIsIncluded } from "~/prisma/model";
import type { Visibility } from "~/api/query";
import { convertToPlainObject } from "~/api/serialization";

export const preloadCompanies = <I extends CompanyIncludes>(params: {
  includes: I;
  visibility: Visibility;
}) => {
  void getCompanies(params);
};

export const getCompanies = cache(
  async <I extends CompanyIncludes>({
    includes,
    visibility,
  }: {
    includes: I;
    visibility: Visibility;
  }): Promise<ApiCompany<I>[]> => {
    await getAuthAdminUser({ strict: visibility !== "public" });
    return (
      await prisma.company.findMany({
        include: {
          experiences: fieldIsIncluded("experiences", includes)
            ? { where: { visible: visibility === "public" ? true : undefined } }
            : undefined,
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      })
    ).map(convertToPlainObject) as ApiCompany<I>[];
  },
);
