import "server-only";
import { cache } from "react";

import { getClerkAuthedUser } from "~/application/auth/server";
import { prisma } from "~/prisma/client";
import { type SchoolIncludes, type ApiSchool, fieldIsIncluded } from "~/prisma/model";
import type { Visibility } from "~/api/query";
import { convertToPlainObject } from "~/api/serialization";

export const preloadSchools = <I extends SchoolIncludes>(params: {
  includes: I;
  visibility: Visibility;
}) => {
  void getSchools(params);
};

export type GetSchoolsParams<I extends SchoolIncludes> = {
  includes: I;
  visibility: Visibility;
};

export const getSchools = cache(
  async <I extends SchoolIncludes>({
    includes,
    visibility,
  }: GetSchoolsParams<I>): Promise<ApiSchool<I>[]> => {
    await getClerkAuthedUser({ strict: visibility !== "public" });
    return (
      await prisma.school.findMany({
        include: {
          educations: fieldIsIncluded("educations", includes)
            ? { where: { visible: visibility === "public" ? true : undefined } }
            : undefined,
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      })
    ).map(convertToPlainObject) as ApiSchool<I>[];
  },
);
