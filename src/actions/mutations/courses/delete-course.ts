"use server";
import { getAuthAdminUser } from "~/application/auth";
import { isPrismaDoesNotExistError, isPrismaInvalidIdError, prisma } from "~/prisma/client";
import { type Course, type CourseOnSkills } from "~/prisma/model";
import { ApiClientGlobalError } from "~/api";

export const deleteCourse = async (id: string): Promise<void> => {
  const user = await getAuthAdminUser();

  await prisma.$transaction(async tx => {
    let course: Course & { readonly skills: CourseOnSkills[] };
    try {
      course = await tx.course.findUniqueOrThrow({
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
      course.skills.map(sk =>
        tx.skill.update({
          where: { id: sk.skillId },
          data: { courses: { deleteMany: { courseId: id } }, updatedById: user.id },
        }),
      ),
    );
    await tx.course.delete({ where: { id } });
  });
};
