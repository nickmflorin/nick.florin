import { prisma } from "~/database/prisma";
import { type SchoolIncludes } from "~/database/model";

import { getSchool } from "~/actions/fetches/schools";
import { ClientResponse, ApiClientGlobalError } from "~/api";
import { apiRoute } from "~/api/route";

export async function generateStaticParams() {
  const schools = await prisma.school.findMany();
  return schools.map(c => ({
    id: c.id,
  }));
}

export const GET = apiRoute(async (request, { params }: { params: { id: string } }, query) => {
  const school = await getSchool(params.id, {
    includes: query.includes as SchoolIncludes,
    visibility: query.visibility,
  });
  if (!school) {
    return ApiClientGlobalError.NotFound().response;
  }
  return ClientResponse.OK(school).response;
});
