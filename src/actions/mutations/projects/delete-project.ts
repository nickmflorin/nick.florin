"use server";
import { getAuthAdminUser } from "~/application/auth";
import { isPrismaDoesNotExistError, isPrismaInvalidIdError, prisma } from "~/prisma/client";
import { type Project, type ProjectOnSkills } from "~/prisma/model";
import { ApiClientGlobalError } from "~/api";

export const deleteProject = async (id: string): Promise<void> => {
  const user = await getAuthAdminUser();

  await prisma.$transaction(async tx => {
    let project: Project & { readonly skills: ProjectOnSkills[] };
    try {
      project = await tx.project.findUniqueOrThrow({
        where: { id },
        include: { skills: true },
      });
    } catch (e) {
      if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
        throw ApiClientGlobalError.NotFound();
      }
      throw e;
    }

    await Promise.all(
      project.skills.map(sk =>
        tx.skill.update({
          where: { id: sk.skillId },
          data: { projects: { deleteMany: { projectId: id } }, updatedById: user.id },
        }),
      ),
    );
    await tx.project.delete({ where: { id } });
  });
};
