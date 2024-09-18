import { prisma } from "~/database/prisma";
import { type RepositoryIncludes } from "~/database/model";

import { getRepository } from "~/actions/fetches/repositories";
import { ClientResponse, ApiClientGlobalError } from "~/api";
import { apiRoute } from "~/api/route";

export async function generateStaticParams() {
  const repositories = await prisma.repository.findMany();
  return repositories.map(r => ({
    id: r.id,
  }));
}

export const GET = apiRoute(async (request, { params }: { params: { id: string } }, query) => {
  const repository = await getRepository(params.id, {
    includes: query.includes as RepositoryIncludes,
    visibility: query.visibility,
  });
  if (!repository) {
    return ApiClientGlobalError.NotFound().response;
  }
  return ClientResponse.OK(repository).response;
});
