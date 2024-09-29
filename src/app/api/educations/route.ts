import { type NextRequest } from "next/server";

import { z } from "zod";

import type { EducationIncludes } from "~/database/model";
import { parseOrdering } from "~/lib/ordering";

import {
  EducationsFiltersObj,
  EducationsDefaultOrdering,
  EducationOrderableFields,
  EducationIncludesSchema,
} from "~/actions";
import { fetchEducations } from "~/actions/educations/fetch-educations";
import { ClientResponse } from "~/api";
import { parseQueryParams } from "~/integrations/http";

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;

  const query = parseQueryParams(searchParams.toString());
  const parsed = EducationIncludesSchema.safeParse(query.includes);

  const limit = z.coerce.number().int().positive().safeParse(query.limit).data;
  const visibility =
    z
      .union([z.literal("admin"), z.literal("public")])
      .default("public")
      .safeParse(query.visibility).data ?? "public";

  let includes: EducationIncludes = [];
  if (parsed.success) {
    includes = parsed.data;
  }

  const filters = EducationsFiltersObj.parse(query);

  const ordering = parseOrdering(query, {
    defaultOrdering: EducationsDefaultOrdering,
    fields: [...EducationOrderableFields],
  });

  const fetcher = fetchEducations(includes);
  const { error, data } = await fetcher({ filters, ordering, limit, visibility }, { scope: "api" });
  if (error) {
    return error.response;
  }
  return ClientResponse.OK(data).response;
};
