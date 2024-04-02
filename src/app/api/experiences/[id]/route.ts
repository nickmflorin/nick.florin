import { type NextRequest } from "next/server";

import { prisma } from "~/prisma/client";
import { getExperience } from "~/actions/fetches/experiences";
import { ApiClientGlobalError, ClientResponse } from "~/api";

export async function generateStaticParams() {
  const experiences = await prisma.experience.findMany();
  return experiences.map(e => ({
    id: e.id,
  }));
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const experience = await getExperience(params.id);
  if (!experience) {
    return ApiClientGlobalError.NotFound().response;
  }
  return ClientResponse.OK(experience).response;
}
