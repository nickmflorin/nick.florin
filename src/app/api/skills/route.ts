import { type NextRequest } from "next/server";

import { ClientResponse } from "~/application/http";
import { prisma } from "~/prisma/client";
import { includeSkillMetadata } from "~/prisma/query";

import { SkillQuerySchema } from "../types";

export async function GET(request: NextRequest) {
  const query = { showTopSkills: request.nextUrl.searchParams.get("showTopSkills") };
  const parsedQuery = SkillQuerySchema.safeParse(query);
  if (!parsedQuery.success) {
    return ClientResponse.BadRequest("Invalid query parameters!").toResponse();
  }
  const { showTopSkills } = parsedQuery.data;

  const skills = await prisma.skill.findMany({
    where: { includeInTopSkills: true },
  });
  const data = (await includeSkillMetadata(skills)).sort((a, b) => b.experience - a.experience);
  return ClientResponse.OK(
    showTopSkills === "all" ? data : data.slice(0, showTopSkills),
  ).toResponse();
}
