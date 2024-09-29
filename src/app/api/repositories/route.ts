import { type NextRequest } from "next/server";

import { z } from "zod";

import type { RepositoryIncludes } from "~/database/model";
import { parseOrdering } from "~/lib/ordering";

import {
  RepositoriesFiltersObj,
  RepositoriesDefaultOrdering,
  RepositoryOrderableFields,
  RepositoryIncludesSchema,
} from "~/actions";
import { fetchRepositories } from "~/actions/repositories/fetch-repositories";
import { ClientResponse } from "~/api";
import { parseQueryParams } from "~/integrations/http";

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;

  const query = parseQueryParams(searchParams.toString());
  const parsed = RepositoryIncludesSchema.safeParse(query.includes);

  const limit = z.coerce.number().int().positive().safeParse(query.limit).data;
  const visibility =
    z
      .union([z.literal("admin"), z.literal("public")])
      .default("public")
      .safeParse(query.visibility).data ?? "public";

  let includes: RepositoryIncludes = [];
  if (parsed.success) {
    includes = parsed.data;
  }

  const filters = RepositoriesFiltersObj.parse(query);

  const ordering = parseOrdering(query, {
    defaultOrdering: RepositoriesDefaultOrdering,
    fields: [...RepositoryOrderableFields],
  });

  const fetcher = fetchRepositories(includes);
  const { error, data } = await fetcher({ filters, ordering, limit, visibility }, { scope: "api" });
  if (error) {
    return error.response;
  }
  return ClientResponse.OK(data).response;
};
