import { type NextRequest } from "next/server";

import { z } from "zod";

import type { SkillIncludes } from "~/database/model";
import { db } from "~/database/prisma";

import { SkillIncludesSchema } from "~/actions-v2";
import { fetchSkill } from "~/actions-v2/skills/fetch-skill";
import { ClientResponse } from "~/api-v2";
import { parseQueryParams } from "~/integrations/http-v2";

export async function generateStaticParams() {
  const skills = await db.skill.findMany();
  return skills.map(r => ({
    id: r.id,
  }));
}

export const GET = async (request: NextRequest, { params }: { params: { id: string } }) => {
  const searchParams = request.nextUrl.searchParams;

  const query = parseQueryParams(searchParams.toString());
  const parsed = SkillIncludesSchema.safeParse(query.includes);

  let includes: SkillIncludes = [];
  if (parsed.success) {
    includes = parsed.data;
  }
  const visibility =
    z
      .union([z.literal("admin"), z.literal("public")])
      .default("public")
      .safeParse(query.visibility).data ?? "public";

  const fetcher = fetchSkill(includes);
  const { error, data } = await fetcher(params.id, { visibility }, { scope: "api" });
  if (error) {
    return error.response;
  }
  return ClientResponse.OK(data).response;
};
