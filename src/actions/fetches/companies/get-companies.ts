import "server-only";
import { cache } from "react";

import { prisma } from "~/prisma/client";
import { type CompanyIncludes, type ApiCompany, fieldIsIncluded } from "~/prisma/model";
import { convertToPlainObject } from "~/actions/fetches/serialization";

export const preloadCompanies = <I extends CompanyIncludes>({ includes }: { includes: I }) => {
  void getCompanies({ includes });
};

export const getCompanies = cache(
  async <I extends CompanyIncludes>({ includes }: { includes: I }): Promise<ApiCompany<I>[]> =>
    (
      await prisma.company.findMany({
        include: { experiences: fieldIsIncluded("experiences", includes) },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      })
    ).map(convertToPlainObject) as ApiCompany<I>[],
);
