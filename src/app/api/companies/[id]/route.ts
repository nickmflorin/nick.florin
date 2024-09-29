import { type NextRequest } from "next/server";

import { z } from "zod";

import type { CompanyIncludes } from "~/database/model";
import { db } from "~/database/prisma";

import { CompanyIncludesSchema } from "~/actions-v2";
import { fetchCompany } from "~/actions-v2/companies/fetch-company";
import { ClientResponse } from "~/api-v2";
import { parseQueryParams } from "~/integrations/http";

export async function generateStaticParams() {
  const companies = await db.company.findMany();
  return companies.map(r => ({
    id: r.id,
  }));
}

export const GET = async (request: NextRequest, { params }: { params: { id: string } }) => {
  const searchParams = request.nextUrl.searchParams;

  const query = parseQueryParams(searchParams.toString());
  const parsed = CompanyIncludesSchema.safeParse(query.includes);

  let includes: CompanyIncludes = [];
  if (parsed.success) {
    includes = parsed.data;
  }
  const visibility =
    z
      .union([z.literal("admin"), z.literal("public")])
      .default("public")
      .safeParse(query.visibility).data ?? "public";

  const fetcher = fetchCompany(includes);
  const { error, data } = await fetcher(params.id, { visibility }, { scope: "api" });
  if (error) {
    return error.response;
  }
  return ClientResponse.OK(data).response;
};
