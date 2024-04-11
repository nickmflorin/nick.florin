import "server-only";
import { cache } from "react";

import { getAuthAdminUser } from "~/application/auth";
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

export const getSchools = cache(
  async <I extends SchoolIncludes>({
    includes,
    visibility,
  }: {
    includes: I;
    visibility: Visibility;
  }): Promise<ApiSchool<I>[]> => {
    await getAuthAdminUser({ strict: visibility !== "public" });
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
