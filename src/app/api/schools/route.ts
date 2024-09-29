import { type NextRequest } from "next/server";

import { z } from "zod";

import type { SchoolIncludes } from "~/database/model";
import { parseOrdering } from "~/lib/ordering";

import {
  SchoolsFiltersObj,
  SchoolsDefaultOrdering,
  SchoolOrderableFields,
  SchoolIncludesSchema,
} from "~/actions";
import { fetchSchools } from "~/actions/schools/fetch-schools";
import { ClientResponse } from "~/api";
import { parseQueryParams } from "~/integrations/http";

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;

  const query = parseQueryParams(searchParams.toString());
  const parsed = SchoolIncludesSchema.safeParse(query.includes);

  const limit = z.coerce.number().int().positive().safeParse(query.limit).data;
  const visibility =
    z
      .union([z.literal("admin"), z.literal("public")])
      .default("public")
      .safeParse(query.visibility).data ?? "public";

  let includes: SchoolIncludes = [];
  if (parsed.success) {
    includes = parsed.data;
  }

  const filters = SchoolsFiltersObj.parse(query);

  const ordering = parseOrdering(query, {
    defaultOrdering: SchoolsDefaultOrdering,
    fields: [...SchoolOrderableFields],
  });

  const fetcher = fetchSchools(includes);
  const { error, data } = await fetcher({ filters, ordering, limit, visibility }, { scope: "api" });
  if (error) {
    return error.response;
  }
  return ClientResponse.OK(data).response;
};
