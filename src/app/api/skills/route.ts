import { type NextRequest } from "next/server";

import { ClientResponse } from "~/application/http";
import { prisma } from "~/prisma/client";
import { type ApiSkill } from "~/prisma/model";
import { includeSkillMetadata } from "~/prisma/model";

import { SkillQuerySchema } from "../types";

const skillExperience = (skill: ApiSkill): number =>
  skill.experience === null ? skill.autoExperience : skill.experience;

export async function GET(request: NextRequest) {
  const query = { showTopSkills: request.nextUrl.searchParams.get("showTopSkills") };
  const parsedQuery = SkillQuerySchema.safeParse(query);
  if (!parsedQuery.success) {
    return ClientResponse.BadRequest("Invalid query parameters!").toResponse();
  }
  const { showTopSkills } = parsedQuery.data;

  const skills = await prisma.skill.findMany({
    where: { includeInTopSkills: true, visible: true },
  });

  const data = (await includeSkillMetadata(skills)).sort(
    (a, b) => skillExperience(b) - skillExperience(a),
  );
  return ClientResponse.OK(
    showTopSkills === "all" ? data : data.slice(0, showTopSkills),
  ).toResponse();
}
