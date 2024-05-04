"use server";
import { getAuthedUser } from "~/application/auth/server";
import { humanizeList } from "~/lib/formatters";
import { isUuid } from "~/lib/typeguards";
import { prisma } from "~/prisma/client";
import { calculateSkillsExperience } from "~/prisma/model";
import { ApiClientGlobalError } from "~/api";

export const deleteCourses = async (ids: string[]): Promise<void> => {
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
    const courses = await tx.course.findMany({
      where: { id: { in: ids } },
      include: { skills: true },
    });
    const nonexistent = ids.filter(id => !courses.some(p => p.id === id));
    if (nonexistent.length > 0) {
      return ApiClientGlobalError.BadRequest(
        `The id(s) ${humanizeList(nonexistent, {
          conjunction: "and",
          formatter: v => `'${v}'`,
        })} do not exist).`,
        { nonexistent },
      );
    }
    const skillIds = courses.flatMap(r => r.skills.map(s => s.id));
    await tx.course.deleteMany({ where: { id: { in: ids } } });
    await calculateSkillsExperience(tx, skillIds, { user, persist: true });
  });
};
