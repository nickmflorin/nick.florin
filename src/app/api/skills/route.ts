import { type SkillIncludes } from "~/database/model";

import { getSkills } from "~/actions/fetches/skills";
import { SkillsFiltersSchema, type SkillsFilters } from "~/actions-v2/types";
import { ClientResponse, ApiClientFieldErrors } from "~/api";
import { apiRoute } from "~/api/route";

export const GET = apiRoute(async (request, params, query) => {
  let filters: Partial<SkillsFilters> | undefined = undefined;

  if (query.filters) {
    const parsedQuery = SkillsFiltersSchema.partial().safeParse(query.filters);
    if (!parsedQuery.success) {
      return ApiClientFieldErrors.fromZodError(parsedQuery.error, SkillsFiltersSchema).response;
    }
    filters = parsedQuery.data;
  }
  /* This API request is currently only used in the public realm, so admin visibility is not
     applicable at this point in time. */
  const skills = await getSkills({
    ...query,
    filters,
    includes: query.includes as SkillIncludes,
  });
  return ClientResponse.OK(skills).response;
});
