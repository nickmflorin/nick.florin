import { type NextRequest } from "next/server";

import { prisma } from "~/database/prisma";
import { type SkillIncludes } from "~/database/model";

import { getSkill } from "~/actions/fetches/skills";
import { ClientResponse, ApiClientGlobalError } from "~/api";
import { apiRoute } from "~/api/route";

export async function generateStaticParams() {
  const skills = await prisma.skill.findMany();
  return skills.map(c => ({
    id: c.id,
  }));
}

export const GET = apiRoute(
  async (request: NextRequest, { params }: { params: { id: string } }, query) => {
    const skill = await getSkill(params.id, {
      includes: query.includes as SkillIncludes,
      visibility: query.visibility,
    });
    if (!skill) {
      return ApiClientGlobalError.NotFound().response;
    }
    return ClientResponse.OK(skill).response;
  },
);
