import { type NextRequest } from "next/server";

import { z } from "zod";

import type { DetailIncludes } from "~/database/model";
import { db } from "~/database/prisma";

import { DetailIncludesSchema } from "~/actions";
import { fetchDetail } from "~/actions/details/fetch-detail";
import { ClientResponse } from "~/api";
import { parseQueryParams } from "~/integrations/http";

export async function generateStaticParams() {
  const details = await db.detail.findMany();
  return details.map(r => ({
    id: r.id,
  }));
}

export const GET = async (request: NextRequest, { params }: { params: { id: string } }) => {
  const searchParams = request.nextUrl.searchParams;

  const query = parseQueryParams(searchParams.toString());
  const parsed = DetailIncludesSchema.safeParse(query.includes);

  let includes: DetailIncludes = [];
  if (parsed.success) {
    includes = parsed.data;
  }

  const visibility =
    z
      .union([z.literal("admin"), z.literal("public")])
      .default("public")
      .safeParse(query.visibility).data ?? "public";

  const fetcher = fetchDetail(includes);
  const { error, data } = await fetcher(params.id, { visibility }, { scope: "api" });
  if (error) {
    return error.response;
  }
  return ClientResponse.OK(data).response;
};
