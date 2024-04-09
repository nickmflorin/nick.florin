import { type NextRequest } from "next/server";

import { prisma } from "~/prisma/client";
import { type SkillIncludes, type ApiSkill } from "~/prisma/model";
import { getSkill } from "~/actions/fetches/skills";
import { ClientResponse, ApiClientError } from "~/api";
import { parseInclusion } from "~/api/query";

export async function generateStaticParams() {
  const skills = await prisma.skill.findMany();
  return skills.map(skill => ({
    id: skill.id,
  }));
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const includes = parseInclusion(request, [
    "experiences",
    "educations",
    "projects",
    "repositories",
  ]) as SkillIncludes;

  let skill: ApiSkill<SkillIncludes>;
  try {
    skill = await getSkill(params.id, { visibility: "public", includes });
  } catch (e) {
    if (e instanceof ApiClientError) {
      return e.response;
    }
    throw e;
  }
  return ClientResponse.OK(skill).response;
}
