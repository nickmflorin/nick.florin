import { type NextRequest } from "next/server";

import { z } from "zod";

import { type SkillIncludes } from "~/database/model";
import { parseOrdering } from "~/lib/ordering";

import {
  SkillsFiltersObj,
  SkillsDefaultOrdering,
  SkillOrderableFields,
  SkillIncludesSchema,
} from "~/actions";
import { fetchSkills } from "~/actions/skills/fetch-skills";
import { ClientResponse } from "~/api";
import { parseQueryParams } from "~/integrations/http";

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;

  const query = parseQueryParams(searchParams.toString());
  const parsed = SkillIncludesSchema.safeParse(query.includes);

  const limit = z.coerce.number().int().positive().safeParse(query.limit).data;
  const visibility =
    z
      .union([z.literal("admin"), z.literal("public")])
      .default("public")
      .safeParse(query.visibility).data ?? "public";

  let includes: SkillIncludes = [];
  if (parsed.success) {
    includes = parsed.data;
  }

  const filters = SkillsFiltersObj.parse(query);

  const ordering = parseOrdering(query, {
    defaultOrdering: SkillsDefaultOrdering,
    fields: [...SkillOrderableFields],
  });

  const fetcher = fetchSkills(includes);
  const { error, data } = await fetcher({ filters, ordering, limit, visibility }, { scope: "api" });
  if (error) {
    return error.response;
  }
  return ClientResponse.OK(data).response;
};
