import { type NextRequest } from "next/server";

import { getAuthUserFromRequest } from "~/application/auth";
import { prisma } from "~/prisma/client";
import { type ExperienceIncludes } from "~/prisma/model";
import { getExperience } from "~/actions/fetches/experiences";
import { ClientResponse, ApiClientGlobalError } from "~/api";
import { parseInclusion, parseVisibility } from "~/api/query";

export async function generateStaticParams() {
  const experiences = await prisma.experience.findMany();
  return experiences.map(e => ({
    id: e.id,
  }));
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const visibility = parseVisibility(request);
  if (visibility === "admin") {
    const user = await getAuthUserFromRequest(request);
    if (!user) {
      return ApiClientGlobalError.NotAuthenticated().response;
    } else if (!user.isAdmin) {
      return ApiClientGlobalError.Forbidden().response;
    }
  }
  const experience = await getExperience(params.id, {
    includes: parseInclusion(request, ["details", "skills"]) as ExperienceIncludes,
    visibility,
  });
  if (!experience) {
    return ApiClientGlobalError.NotFound().response;
  }
  return ClientResponse.OK(experience).response;
}
