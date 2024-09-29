import { type NextRequest } from "next/server";

import { z } from "zod";

import type { ExperienceIncludes } from "~/database/model";
import { db } from "~/database/prisma";

import { ExperienceIncludesSchema } from "~/actions-v2";
import { fetchExperience } from "~/actions-v2/experiences/fetch-experience";
import { ClientResponse } from "~/api-v2";
import { parseQueryParams } from "~/integrations/http";

export async function generateStaticParams() {
  const experiences = await db.experience.findMany();
  return experiences.map(r => ({
    id: r.id,
  }));
}

export const GET = async (request: NextRequest, { params }: { params: { id: string } }) => {
  const searchParams = request.nextUrl.searchParams;

  const query = parseQueryParams(searchParams.toString());
  const parsed = ExperienceIncludesSchema.safeParse(query.includes);

  let includes: ExperienceIncludes = [];
  if (parsed.success) {
    includes = parsed.data;
  }

  const visibility =
    z
      .union([z.literal("admin"), z.literal("public")])
      .default("public")
      .safeParse(query.visibility).data ?? "public";

  const fetcher = fetchExperience(includes);
  const { error, data } = await fetcher(params.id, { visibility }, { scope: "api" });
  if (error) {
    return error.response;
  }
  return ClientResponse.OK(data).response;
};
