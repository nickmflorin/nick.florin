import "server-only";
import { cache } from "react";

import { prisma } from "~/prisma/client";
import { type SchoolIncludes, type ApiSchool, fieldIsIncluded } from "~/prisma/model";
import { convertToPlainObject } from "~/actions/fetches/serialization";

export const preloadSchools = <I extends SchoolIncludes>({ includes }: { includes: I }) => {
  void getSchools({ includes });
};

export const getSchools = cache(
  async <I extends SchoolIncludes>({ includes }: { includes: I }): Promise<ApiSchool<I>[]> =>
    (
      await prisma.school.findMany({
        include: { educations: fieldIsIncluded("educations", includes) },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      })
    ).map(convertToPlainObject) as ApiSchool<I>[],
);
