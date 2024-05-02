"use server";
import { getAuthedUser } from "~/application/auth/server";
import { isPrismaDoesNotExistError, isPrismaInvalidIdError, prisma } from "~/prisma/client";
import { type Company, type Experience } from "~/prisma/model";
import { ApiClientGlobalError } from "~/api";

export const deleteCompany = async (id: string) => {
  await getAuthedUser();

  return await prisma.$transaction(async tx => {
    let company: Company & { readonly experiences: Experience[] };
    try {
      company = await tx.company.findUniqueOrThrow({
        where: { id },
        include: { experiences: true },
      });
    } catch (e) {
      if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
        throw ApiClientGlobalError.NotFound();
      }
      throw e;
    }
    if (company.experiences.length !== 0) {
      throw ApiClientGlobalError.BadRequest({
        public:
          "The company cannot be deleted because it is still associated with other experiences.",
        internal: `The company cannot be deleted because it is still associated with ${company.experiences.length} other educations.`,
      });
    }

    await tx.company.delete({ where: { id: company.id } });
  });
};
