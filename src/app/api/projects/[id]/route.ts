import { prisma } from "~/prisma/client";
import { type ProjectIncludes } from "~/prisma/model";

import { getProject } from "~/actions/fetches/projects";
import { ClientResponse, ApiClientGlobalError } from "~/api";
import { apiRoute } from "~/api/route";

export async function generateStaticParams() {
  const projects = await prisma.project.findMany();
  return projects.map(p => ({
    id: p.id,
  }));
}

export const GET = apiRoute(async (request, { params }: { params: { id: string } }, query) => {
  const project = await getProject(params.id, {
    includes: query.includes as ProjectIncludes,
    visibility: query.visibility,
  });
  if (!project) {
    return ApiClientGlobalError.NotFound().response;
  }
  return ClientResponse.OK(project).response;
});
