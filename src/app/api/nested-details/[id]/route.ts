import { type NextRequest } from "next/server";

import { z } from "zod";

import type { NestedDetailIncludes } from "~/database/model";
import { db } from "~/database/prisma";

import { NestedDetailIncludesSchema } from "~/actions";
import { fetchNestedDetail } from "~/actions/details/fetch-nested-detail";
import { ClientResponse } from "~/api";
import { parseQueryParams } from "~/integrations/http";

export async function generateStaticParams() {
  const nestedDetails = await db.nestedDetail.findMany();
  return nestedDetails.map(r => ({
    id: r.id,
  }));
}

export const GET = async (request: NextRequest, { params }: { params: { id: string } }) => {
  const searchParams = request.nextUrl.searchParams;

  const query = parseQueryParams(searchParams.toString());
  const parsed = NestedDetailIncludesSchema.safeParse(query.includes);

  let includes: NestedDetailIncludes = [];
  if (parsed.success) {
    includes = parsed.data;
  }

  const visibility =
    z
      .union([z.literal("admin"), z.literal("public")])
      .default("public")
      .safeParse(query.visibility).data ?? "public";

  const fetcher = fetchNestedDetail(includes);
  const { error, data } = await fetcher(params.id, { visibility }, { scope: "api" });
  if (error) {
    return error.response;
  }
  return ClientResponse.OK(data).response;
};
