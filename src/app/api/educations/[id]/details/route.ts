import { prisma } from "~/prisma/client";
import { DetailEntityType, type DetailIncludes } from "~/prisma/model";

import { getEntityDetails } from "~/actions/fetches/details";
import { ApiClientGlobalError, ClientResponse } from "~/api";
import { apiRoute } from "~/api/route";

export async function generateStaticParams() {
  const educations = await prisma.education.findMany();
  return educations.map(e => ({
    id: e.id,
  }));
}

export const GET = apiRoute(async (request, { params }: { params: { id: string } }, query) => {
  const detail = await getEntityDetails(params.id, DetailEntityType.EDUCATION, {
    includes: query.includes as DetailIncludes,
    visibility: query.visibility,
  });
  if (!detail) {
    return ApiClientGlobalError.NotFound().response;
  }
  return ClientResponse.OK(detail).response;
});
