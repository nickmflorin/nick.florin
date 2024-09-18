"use server";
import { getAuthedUser } from "~/application/auth/server";
import { humanizeList } from "~/lib/formatters";
import { isUuid } from "~/lib/typeguards";
import { prisma } from "~/database/prisma";
import { calculateSkillsExperience } from "~/database/model";

import { ApiClientGlobalError } from "~/api";

export const deleteRepositories = async (ids: string[]): Promise<void> => {
  const { user } = await getAuthedUser({ strict: true });

  const invalid = ids.filter(id => !isUuid(id));
  if (invalid.length > 0) {
    throw ApiClientGlobalError.BadRequest(
      `The id(s) ${humanizeList(invalid, {
        conjunction: "and",
        formatter: v => `'${v}'`,
      })} are not valid UUID(s).`,
      { invalid },
    );
  }
  await prisma.$transaction(async tx => {
    const repositories = await tx.repository.findMany({
      include: { skills: true },
      where: { id: { in: ids } },
    });
    const nonexistent = ids.filter(id => !repositories.some(p => p.id === id));
    if (nonexistent.length > 0) {
      return ApiClientGlobalError.BadRequest(
        `The id(s) ${humanizeList(nonexistent, {
          conjunction: "and",
          formatter: v => `'${v}'`,
        })} do not exist).`,
        { nonexistent },
      );
    }
    const skillIds = repositories.flatMap(r => r.skills.map(s => s.id));
    await tx.repository.deleteMany({ where: { id: { in: ids } } });
    await calculateSkillsExperience(tx, skillIds, { user });
  });
};
