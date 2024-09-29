import { type NextRequest } from "next/server";

import { z } from "zod";

import type { RepositoryIncludes } from "~/database/model";
import { db } from "~/database/prisma";

import { RepositoryIncludesSchema } from "~/actions";
import { fetchRepository } from "~/actions/repositories/fetch-repository";
import { ClientResponse } from "~/api";
import { parseQueryParams } from "~/integrations/http";

export async function generateStaticParams() {
  const repositories = await db.repository.findMany();
  return repositories.map(r => ({
    id: r.id,
  }));
}

export const GET = async (request: NextRequest, { params }: { params: { id: string } }) => {
  const searchParams = request.nextUrl.searchParams;

  const query = parseQueryParams(searchParams.toString());
  const parsed = RepositoryIncludesSchema.safeParse(query.includes);

  let includes: RepositoryIncludes = [];
  if (parsed.success) {
    includes = parsed.data;
  }

  const visibility =
    z
      .union([z.literal("admin"), z.literal("public")])
      .default("public")
      .safeParse(query.visibility).data ?? "public";

  const fetcher = fetchRepository(includes);
  const { error, data } = await fetcher(params.id, { visibility }, { scope: "api" });
  if (error) {
    return error.response;
  }
  return ClientResponse.OK(data).response;
};
