import { prisma } from "~/prisma/client";
import { type ExperienceIncludes } from "~/prisma/model";
import { getExperience } from "~/actions/fetches/experiences";
import { ClientResponse, ApiClientGlobalError } from "~/api";
import { apiRoute } from "~/api/route";

export async function generateStaticParams() {
  const experiences = await prisma.experience.findMany();
  return experiences.map(e => ({
    id: e.id,
  }));
}

export const GET = apiRoute(async (request, { params }: { params: { id: string } }, query) => {
  const experience = await getExperience(params.id, {
    includes: query.includes as ExperienceIncludes,
    visibility: query.visibility,
  });
  if (!experience) {
    return ApiClientGlobalError.NotFound().response;
  }
  return ClientResponse.OK(experience).response;
});
