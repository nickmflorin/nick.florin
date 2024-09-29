import { type NextRequest } from "next/server";

import { z } from "zod";

import type { ExperienceIncludes } from "~/database/model";
import { parseOrdering } from "~/lib/ordering";

import {
  ExperiencesFiltersObj,
  ExperiencesDefaultOrdering,
  ExperienceOrderableFields,
  ExperienceIncludesSchema,
} from "~/actions-v2";
import { fetchExperiences } from "~/actions-v2/experiences/fetch-experiences";
import { ClientResponse } from "~/api-v2";
import { parseQueryParams } from "~/integrations/http";

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;

  const query = parseQueryParams(searchParams.toString());
  const parsed = ExperienceIncludesSchema.safeParse(query.includes);

  const limit = z.coerce.number().int().positive().optional().safeParse(query.limit).data;
  const visibility =
    z
      .union([z.literal("admin"), z.literal("public")])
      .default("public")
      .safeParse(query.visibility).data ?? "public";

  let includes: ExperienceIncludes = [];
  if (parsed.success) {
    includes = parsed.data;
  }

  const filters = ExperiencesFiltersObj.parse(query);

  const ordering = parseOrdering(query, {
    defaultOrdering: ExperiencesDefaultOrdering,
    fields: [...ExperienceOrderableFields],
  });

  const fetcher = fetchExperiences(includes);

  const { error, data } = await fetcher({ filters, ordering, limit, visibility }, { scope: "api" });
  if (error) {
    return error.response;
  }
  return ClientResponse.OK(data).response;
};
