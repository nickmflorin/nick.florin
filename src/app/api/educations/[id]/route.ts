import { type NextRequest } from "next/server";

import { z } from "zod";

import type { EducationIncludes } from "~/database/model";
import { db } from "~/database/prisma";

import { EducationIncludesSchema } from "~/actions";
import { fetchEducation } from "~/actions/educations/fetch-education";
import { ClientResponse } from "~/api";
import { parseQueryParams } from "~/integrations/http";

export async function generateStaticParams() {
  const educations = await db.education.findMany();
  return educations.map(r => ({
    id: r.id,
  }));
}

export const GET = async (request: NextRequest, { params }: { params: { id: string } }) => {
  const searchParams = request.nextUrl.searchParams;

  const query = parseQueryParams(searchParams.toString());
  const parsed = EducationIncludesSchema.safeParse(query.includes);

  let includes: EducationIncludes = [];
  if (parsed.success) {
    includes = parsed.data;
  }

  const visibility =
    z
      .union([z.literal("admin"), z.literal("public")])
      .default("public")
      .safeParse(query.visibility).data ?? "public";

  const fetcher = fetchEducation(includes);
  const { error, data } = await fetcher(params.id, { visibility }, { scope: "api" });
  if (error) {
    return error.response;
  }
  return ClientResponse.OK(data).response;
};
