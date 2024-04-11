import { type NextRequest } from "next/server";

import { getAuthUserFromRequest } from "~/application/auth";
import { decodeQueryParams } from "~/lib/urls";
import { type SkillIncludes, type ApiSkill } from "~/prisma/model";
import { getSkills } from "~/actions/fetches/skills";
import { ClientResponse, ApiClientFieldErrors, ApiClientGlobalError } from "~/api";
import { parseInclusion, parseVisibility } from "~/api/query";
import { SkillQuerySchema } from "~/api/schemas";

const skillExperience = <I extends SkillIncludes>(skill: ApiSkill<I>): number =>
  skill.experience === null ? skill.autoExperience : skill.experience;

export async function GET(request: NextRequest) {
  const visibility = parseVisibility(request);
  if (visibility === "admin") {
    const user = await getAuthUserFromRequest(request);
    if (!user) {
      return ApiClientGlobalError.NotAuthenticated().response;
    } else if (!user.isAdmin) {
      return ApiClientGlobalError.Forbidden().response;
    }
  }
  const parsedQuery = SkillQuerySchema.safeParse(decodeQueryParams(request.nextUrl.searchParams));
  if (!parsedQuery.success) {
    return ApiClientFieldErrors.fromZodError(parsedQuery.error, SkillQuerySchema).response;
  }
  const { showTopSkills, ...filters } = parsedQuery.data;

  /* This API request is currently only used in the public realm, so admin visibility is not
     applicable at this point in time. */
  const skills = await getSkills({
    visibility: "public",
    filters,
    includes: parseInclusion(request, [
      "experiences",
      "educations",
      "projects",
      "repositories",
    ]) as SkillIncludes,
  });
  const data = skills.sort((a, b) => skillExperience(b) - skillExperience(a));
  return ClientResponse.OK(showTopSkills === "all" ? data : data.slice(0, showTopSkills)).response;
}
