import { type NextRequest } from "next/server";

import { prisma } from "~/prisma/client";
import { DetailEntityType } from "~/prisma/model";
import { getDetails } from "~/actions/fetches/details";
import { ApiClientGlobalError, ClientResponse } from "~/api";
import { parseInclusion } from "~/api/inclusion";

export async function generateStaticParams() {
  const experiences = await prisma.experience.findMany();
  return experiences.map(e => ({
    id: e.id,
  }));
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const details = await getDetails(params.id, DetailEntityType.EXPERIENCE, {
    includes: parseInclusion(request, ["nestedDetails", "skills"]),
  });
  if (!details) {
    return ApiClientGlobalError.NotFound().response;
  }
  return ClientResponse.OK({ details: details.details, experience: details.entity }).response;
}
