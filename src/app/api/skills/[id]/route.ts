import { type NextRequest } from "next/server";

import { getAuthUserFromRequest } from "~/application/auth";
import { prisma } from "~/prisma/client";
import { type SkillIncludes } from "~/prisma/model";
import { getSkill } from "~/actions/fetches/skills";
import { ClientResponse, ApiClientGlobalError } from "~/api";
import { parseInclusion, parseVisibility } from "~/api/query";

export async function generateStaticParams() {
  const skills = await prisma.skill.findMany();
  return skills.map(c => ({
    id: c.id,
  }));
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const visibility = parseVisibility(request);
  if (visibility === "admin") {
    const user = await getAuthUserFromRequest(request);
    if (!user) {
      return ApiClientGlobalError.NotAuthenticated().response;
    } else if (!user.isAdmin) {
      return ApiClientGlobalError.Forbidden().response;
    }
  }
  const skill = await getSkill(params.id, {
    includes: parseInclusion(request, [
      "educations",
      "experiences",
      "repositories",
      "projects",
      "courses",
    ]) as SkillIncludes,
    visibility,
  });
  if (!skill) {
    return ApiClientGlobalError.NotFound().response;
  }
  return ClientResponse.OK(skill).response;
}
