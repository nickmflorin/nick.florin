import { type SkillIncludes } from "~/prisma/model";
import { getSkills } from "~/actions/fetches/skills";
import { ClientResponse, ApiClientFieldErrors } from "~/api";
import { apiRoute } from "~/api/route";
import { SkillsFiltersSchema, type SkillsFilters } from "~/api/schemas/filters";

export const GET = apiRoute(async (request, params, query) => {
  let filters: SkillsFilters | undefined = undefined;
  if (query.filters) {
    const parsedQuery = SkillsFiltersSchema.safeParse(query.filters);
    if (!parsedQuery.success) {
      return ApiClientFieldErrors.fromZodError(parsedQuery.error, SkillsFiltersSchema).response;
    }
    filters = parsedQuery.data;
  }
  console.log({ query, filters });

  /* This API request is currently only used in the public realm, so admin visibility is not
     applicable at this point in time. */
  const skills = await getSkills({
    visibility: query.visibility,
    filters,
    limit: query.limit,
    includes: query.includes as SkillIncludes,
  });
  return ClientResponse.OK(skills).response;
});
