import { type NextRequest } from "next/server";

import { z } from "zod";

import type { ProjectIncludes } from "~/database/model";
import { db } from "~/database/prisma";

import { ProjectIncludesSchema } from "~/actions-v2";
import { fetchProject } from "~/actions-v2/projects/fetch-project";
import { ClientResponse } from "~/api-v2";
import { parseQueryParams } from "~/integrations/http";

export async function generateStaticParams() {
  const projects = await db.project.findMany();
  return projects.map(r => ({
    id: r.id,
  }));
}

export const GET = async (request: NextRequest, { params }: { params: { id: string } }) => {
  const searchParams = request.nextUrl.searchParams;

  const query = parseQueryParams(searchParams.toString());
  const parsed = ProjectIncludesSchema.safeParse(query.includes);

  let includes: ProjectIncludes = [];
  if (parsed.success) {
    includes = parsed.data;
  }

  const visibility =
    z
      .union([z.literal("admin"), z.literal("public")])
      .default("public")
      .safeParse(query.visibility).data ?? "public";

  const fetcher = fetchProject(includes);
  const { error, data } = await fetcher(params.id, { visibility }, { scope: "api" });
  if (error) {
    return error.response;
  }
  return ClientResponse.OK(data).response;
};
