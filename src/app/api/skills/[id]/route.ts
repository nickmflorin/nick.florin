import { type NextRequest } from "next/server";

import { isPrismaDoesNotExistError, isPrismaInvalidIdError, prisma } from "~/prisma/client";
import { type Skill } from "~/prisma/model";
import { includeSkillMetadata } from "~/prisma/model";
import { ClientResponse, ApiClientGlobalError } from "~/api";

export async function generateStaticParams() {
  const skills = await prisma.skill.findMany({ where: { visible: true } });
  return skills.map(skill => ({
    id: skill.id,
  }));
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  let skill: Skill;
  try {
    skill = await prisma.skill.findUniqueOrThrow({ where: { id: params.id } });
  } catch (e) {
    if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
      return ApiClientGlobalError.NotFound().toResponse();
    }
    throw e;
  }
  return ClientResponse.OK(await includeSkillMetadata(skill)).toResponse();
}
