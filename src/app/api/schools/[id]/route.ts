import { type NextRequest } from "next/server";

import { z } from "zod";

import type { SchoolIncludes } from "~/database/model";
import { db } from "~/database/prisma";

import { SchoolIncludesSchema } from "~/actions-v2";
import { fetchSchool } from "~/actions-v2/schools/fetch-school";
import { ClientResponse } from "~/api-v2";
import { parseQueryParams } from "~/integrations/http";

export async function generateStaticParams() {
  const schools = await db.school.findMany();
  return schools.map(r => ({
    id: r.id,
  }));
}

export const GET = async (request: NextRequest, { params }: { params: { id: string } }) => {
  const searchParams = request.nextUrl.searchParams;

  const query = parseQueryParams(searchParams.toString());
  const parsed = SchoolIncludesSchema.safeParse(query.includes);

  let includes: SchoolIncludes = [];
  if (parsed.success) {
    includes = parsed.data;
  }
  const visibility =
    z
      .union([z.literal("admin"), z.literal("public")])
      .default("public")
      .safeParse(query.visibility).data ?? "public";

  const fetcher = fetchSchool(includes);
  const { error, data } = await fetcher(params.id, { visibility }, { scope: "api" });
  if (error) {
    return error.response;
  }
  return ClientResponse.OK(data).response;
};
