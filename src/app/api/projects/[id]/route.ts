import { type NextRequest } from "next/server";

import { prisma } from "~/prisma/client";
import { getProject } from "~/actions/fetches/projects";
import { ApiClientGlobalError, ClientResponse } from "~/api";

export async function generateStaticParams() {
  const projects = await prisma.project.findMany();
  return projects.map(s => ({
    id: s.id,
  }));
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const project = await getProject(params.id);
  if (!project) {
    return ApiClientGlobalError.NotFound().response;
  }
  return ClientResponse.OK(project).response;
}
