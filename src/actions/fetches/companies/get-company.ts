import "server-only";

import { cache } from "react";

import { getClerkAuthedUser } from "~/application/auth/server";
import { logger } from "~/application/logger";
import { isUuid } from "~/lib/typeguards";
import { prisma } from "~/prisma/client";
import { fieldIsIncluded, type ApiCompany, type CompanyIncludes } from "~/prisma/model";

import type { ApiStandardDetailQuery } from "~/api/query";
import { convertToPlainObject } from "~/api/serialization";

export type GetCompanyParams<I extends CompanyIncludes> = ApiStandardDetailQuery<I>;

export const preloadCompany = <I extends CompanyIncludes>(
  id: string,
  params: GetCompanyParams<I>,
) => {
  void getCompany(id, params);
};

export const getCompany = cache(
  async <I extends CompanyIncludes>(
    id: string,
    { includes, visibility }: GetCompanyParams<I>,
  ): Promise<ApiCompany<I> | null> => {
    await getClerkAuthedUser({ strict: visibility !== "public" });
    if (!isUuid(id)) {
      logger.error(`Unexpectedly received invalid ID, '${id}', when fetching a company.`, {
        id,
        includes,
      });
      return null;
    }
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        experiences: fieldIsIncluded("experiences", includes)
          ? { where: { visible: visibility === "public" ? true : undefined } }
          : undefined,
      },
    });
    if (company) {
      return convertToPlainObject(company) as ApiCompany<I>;
    }
    return null;
  },
) as {
  <I extends CompanyIncludes>(
    id: string,
    params: GetCompanyParams<I>,
  ): Promise<ApiCompany<I> | null>;
};
