import { prisma } from "~/prisma/client";
import { type EducationIncludes } from "~/prisma/model";
import { getEducation } from "~/actions/fetches/educations";
import { ClientResponse, ApiClientGlobalError } from "~/api";
import { apiRoute } from "~/api/route";

export async function generateStaticParams() {
  const educations = await prisma.education.findMany();
  return educations.map(e => ({
    id: e.id,
  }));
}

export const GET = apiRoute(async (request, { params }: { params: { id: string } }, query) => {
  const education = await getEducation(params.id, {
    includes: query.includes as EducationIncludes,
    visibility: query.visibility,
  });
  if (!education) {
    return ApiClientGlobalError.NotFound().response;
  }
  return ClientResponse.OK(education).response;
});
