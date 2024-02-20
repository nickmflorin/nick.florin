import "server-only";
import { cache } from "react";

import { prisma, isPrismaDoesNotExistError, isPrismaInvalidIdError } from "~/prisma/client";
import { type ApiSkill, type Skill } from "~/prisma/model";
import { includeSkillMetadata } from "~/prisma/model";

export const preloadSkill = (id: string) => {
  void getSkill(id);
};

export const getSkill = cache(async (id: string): Promise<ApiSkill | null> => {
  let skill: Skill;
  try {
    skill = await prisma.skill.findUniqueOrThrow({ where: { id } });
  } catch (e) {
    if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
      return null;
    }
    throw e;
  }
  return await includeSkillMetadata(skill);
});
