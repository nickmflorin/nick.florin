import { type NextRequest } from "next/server";

import { decodeQueryParams } from "~/lib/urls";
import { type ApiSkill } from "~/prisma/model";
import { getSkills } from "~/actions/fetches/get-skills";
import { SkillQuerySchema } from "~/actions/schemas";
import { ClientResponse, ApiClientFormError } from "~/http";

const skillExperience = (skill: ApiSkill): number =>
  skill.experience === null ? skill.autoExperience : skill.experience;

export async function GET(request: NextRequest) {
  const parsedQuery = SkillQuerySchema.safeParse(decodeQueryParams(request.nextUrl.searchParams));
  if (!parsedQuery.success) {
    return ApiClientFormError.BadRequest(parsedQuery.error, SkillQuerySchema).toResponse();
  }
  const { showTopSkills, ...filters } = parsedQuery.data;
  const skills = await getSkills({ visibility: "public", filters });

  const data = skills.sort((a, b) => skillExperience(b) - skillExperience(a));
  return ClientResponse.OK(
    showTopSkills === "all" ? data : data.slice(0, showTopSkills),
  ).toResponse();
}
