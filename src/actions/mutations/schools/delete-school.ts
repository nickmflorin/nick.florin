"use server";
import { revalidatePath } from "next/cache";

import { getAuthAdminUser } from "~/application/auth";
import { isPrismaDoesNotExistError, isPrismaInvalidIdError, prisma } from "~/prisma/client";
import { type School, type Education } from "~/prisma/model";
import { ApiClientGlobalError } from "~/api";

export const deleteSchool = async (id: string) => {
  await getAuthAdminUser({ strict: true });

  return await prisma.$transaction(async tx => {
    let school: School & { readonly educations: Education[] };
    try {
      school = await tx.school.findUniqueOrThrow({
        where: { id },
        include: { educations: true },
      });
    } catch (e) {
      if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
        throw ApiClientGlobalError.NotFound();
      }
      throw e;
    }
    if (school.educations.length !== 0) {
      throw ApiClientGlobalError.BadRequest({
        public:
          "The school cannot be deleted because it is still associated with other educations.",
        internal: `The school cannot be deleted because it is still associated with ${school.educations.length} other educations.`,
      });
    }

    await tx.school.delete({ where: { id: school.id } });
    revalidatePath("/api/schools");
    revalidatePath(`/api/schools/${school.id}`);
  });
};
