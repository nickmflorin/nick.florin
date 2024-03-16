import { type NextRequest } from "next/server";

import { prisma, isPrismaDoesNotExistError, isPrismaInvalidIdError } from "~/prisma/client";
import { type ApiExperience } from "~/prisma/model";
import { ApiClientError, ClientResponse } from "~/api";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  let experience: ApiExperience;
  try {
    experience = await prisma.experience.findUniqueOrThrow({
      where: { id: params.id },
      include: { company: true },
    });
  } catch (e) {
    if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
      return ApiClientError.NotFound().toResponse();
    }
    // This will trigger a 500 internal server error, which should get picked up by the SWR hook.
    throw e;
  }
  return ClientResponse.OK(experience).toResponse();
}
