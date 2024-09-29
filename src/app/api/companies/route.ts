import { type NextRequest } from "next/server";

import { z } from "zod";

import type { CompanyIncludes } from "~/database/model";
import { parseOrdering } from "~/lib/ordering";

import {
  CompaniesFiltersObj,
  CompaniesDefaultOrdering,
  CompanyOrderableFields,
  CompanyIncludesSchema,
} from "~/actions-v2";
import { fetchCompanies } from "~/actions-v2/companies/fetch-companies";
import { ClientResponse } from "~/api-v2";
import { parseQueryParams } from "~/integrations/http";

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;

  const query = parseQueryParams(searchParams.toString());
  const parsed = CompanyIncludesSchema.safeParse(query.includes);

  const limit = z.coerce.number().int().positive().safeParse(query.limit).data;
  const visibility =
    z
      .union([z.literal("admin"), z.literal("public")])
      .default("public")
      .safeParse(query.visibility).data ?? "public";

  let includes: CompanyIncludes = [];
  if (parsed.success) {
    includes = parsed.data;
  }

  const filters = CompaniesFiltersObj.parse(query);

  const ordering = parseOrdering(query, {
    defaultOrdering: CompaniesDefaultOrdering,
    fields: [...CompanyOrderableFields],
  });

  const fetcher = fetchCompanies(includes);
  const { error, data } = await fetcher({ filters, ordering, limit, visibility }, { scope: "api" });
  if (error) {
    return error.response;
  }
  return ClientResponse.OK(data).response;
};
