import { type NextRequest } from "next/server";

import { ApiClientError } from "~/application/errors";
import { ClientResponse } from "~/application/http";
import { prisma, isPrismaDoesNotExistError, isPrismaInvalidIdError } from "~/prisma/client";
import { DetailEntityType, type Education } from "~/prisma/model";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  let education: Education;
  try {
    education = await prisma.education.findUniqueOrThrow({
      where: { id: params.id },
    });
  } catch (e) {
    if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
      return ApiClientError.NotFound().toResponse();
    }
    // This will trigger a 500 internal server error, which should get picked up by the SWR hook.
    throw e;
  }
  const r = ClientResponse.OK({
    education,
    details: await prisma.detail.findMany({
      where: { entityId: education.id, entityType: DetailEntityType.EDUCATION },
      include: { nestedDetails: { orderBy: [{ createdAt: "desc" }, { id: "desc" }] } },
      /* In order to prevent the details from shifting around in the form whenever a page
         refresh is performed after one or more details are modified, we need to rely on a
         consistent ordering of the details based on attributes that are indepenedent of
         modifications to the details.

         For instance, if we were to use the 'updatedAt' field to order the details, then the
         details would shift around everytime one of them was modified in the frontend.

         Instead, we use the 'createdAt' field to order the details - but there is one caveat:
         because some of the details are created during the seeding process in a script, the
         'createdAt' values can be exactly the same - which can still lead to details shifting
         around in the frontend after one or more are modified.  While this is an edge case, and
         wouldn't happen in practice (outside of a seeding process), since we do want to allow
         the data in the application to be seeded for flexibility, we have to account for it.

         To account for this, the 'id' field is used as a secondary ordering attribute, which is
         guaranteed to be unique and not change, for each detail.  Then, the sorting is
         performed first based on whether or not the 'createdAt' values are the same, and if
         they are, the 'id' field is used as a fallback. */
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    }),
  }).toResponse();
  console.log(r);
  return r;
}
