import { type NextRequest } from "next/server";

import { decodeQueryParams } from "~/lib/urls";
import { type SkillIncludes, type ApiSkill } from "~/prisma/model";
import { getSkills } from "~/actions/fetches/skills";
import { ClientResponse, ApiClientFieldErrors } from "~/api";
import { parseInclusion } from "~/api/query";
import { SkillQuerySchema } from "~/api/schemas";

const skillExperience = <I extends SkillIncludes>(skill: ApiSkill<I>): number =>
  skill.experience === null ? skill.autoExperience : skill.experience;

export async function GET(request: NextRequest) {
  const includes = parseInclusion(request, [
    "experiences",
    "educations",
    "projects",
  ]) as SkillIncludes;
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
    includes,
  });
  const data = skills.sort((a, b) => skillExperience(b) - skillExperience(a));
  return ClientResponse.OK(showTopSkills === "all" ? data : data.slice(0, showTopSkills)).response;
}
