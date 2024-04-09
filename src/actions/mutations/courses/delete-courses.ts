"use server";
import { getAuthAdminUser } from "~/application/auth";
import { humanizeList } from "~/lib/formatters";
import { isUuid } from "~/lib/typeguards";
import { prisma } from "~/prisma/client";
import { ApiClientGlobalError } from "~/api";

export const deleteCourses = async (ids: string[]): Promise<void> => {
  const user = await getAuthAdminUser();

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
    await Promise.all(
      courses.flatMap(e =>
        e.skills.map(sk =>
          tx.skill.update({
            where: { id: sk.skillId },
            data: { courses: { deleteMany: { courseId: e.id } }, updatedById: user.id },
          }),
        ),
      ),
    );
    await tx.course.deleteMany({ where: { id: { in: ids } } });
  });
};
