import "server-only";

import { cache } from "react";

import { getClerkAuthedUser } from "~/application/auth/server";
import { prisma } from "~/prisma/client";
import { type CompanyIncludes, type ApiCompany, fieldIsIncluded } from "~/prisma/model";

import type { ApiStandardDetailQuery } from "~/api/query";
import { convertToPlainObject } from "~/api/serialization";

export type GetCompaniesParams<I extends CompanyIncludes> = ApiStandardDetailQuery<I>;

export const preloadCompanies = <I extends CompanyIncludes>(params: GetCompaniesParams<I>) => {
  void getCompanies(params);
};

export const getCompanies = cache(
  async <I extends CompanyIncludes>({
    includes,
    visibility,
  }: GetCompaniesParams<I>): Promise<ApiCompany<I>[]> => {
    await getClerkAuthedUser({ strict: visibility !== "public" });
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
