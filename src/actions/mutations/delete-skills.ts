"use server";
import { getAuthAdminUser } from "~/application/auth";
import { humanizeList } from "~/lib/formatters";
import { isUuid } from "~/lib/typeguards";
import { prisma } from "~/prisma/client";
import { ApiClientGlobalError } from "~/api";

export const deleteSkills = async (ids: string[]): Promise<void> => {
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
    const skills = await tx.skill.findMany({
      where: { id: { in: ids } },
      include: { experiences: true, educations: true },
    });
    const nonexistent = ids.filter(id => !skills.some(e => e.id === id));
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
      skills.flatMap(skill =>
        skill.experiences.map(exp =>
          tx.experience.update({
            where: { id: exp.experienceId },
            data: { skills: { deleteMany: { skillId: skill.id } }, updatedById: user.id },
          }),
        ),
      ),
    );

    await Promise.all(
      skills.flatMap(skill =>
        skill.educations.map(edu =>
          tx.education.update({
            where: { id: edu.educationId },
            data: { skills: { deleteMany: { skillId: skill.id } }, updatedById: user.id },
          }),
        ),
      ),
    );

    await tx.skill.deleteMany({ where: { id: { in: ids } } });
  });
};
