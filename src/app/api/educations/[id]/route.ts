import { type NextRequest } from "next/server";

import { prisma, isPrismaDoesNotExistError, isPrismaInvalidIdError } from "~/prisma/client";
import { type ApiEducation } from "~/prisma/model";
import { ApiClientGlobalError, ClientResponse } from "~/api";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  let education: ApiEducation;
  try {
    education = await prisma.education.findUniqueOrThrow({
      where: { id: params.id },
      include: { school: true },
    });
  } catch (e) {
    if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
      return ApiClientGlobalError.NotFound().toResponse();
    }
    // This will trigger a 500 internal server error, which should get picked up by the SWR hook.
    throw e;
  }
  return ClientResponse.OK(education).toResponse();
}
