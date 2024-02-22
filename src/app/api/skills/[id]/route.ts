import { type NextRequest } from "next/server";

import { ClientResponse } from "~/application/http";
import { isPrismaDoesNotExistError, isPrismaInvalidIdError, prisma } from "~/prisma/client";
import { type Skill } from "~/prisma/model";
import { includeSkillMetadata } from "~/prisma/model";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  let skill: Skill;
  try {
    skill = await prisma.skill.findUniqueOrThrow({ where: { id: params.id } });
  } catch (e) {
    if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
      return ClientResponse.NotFound().toResponse();
    }
    throw e;
  }
  return ClientResponse.OK(await includeSkillMetadata(skill)).toResponse();
}
