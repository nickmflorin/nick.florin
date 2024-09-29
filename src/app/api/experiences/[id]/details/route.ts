import { type NextRequest } from "next/server";

import { z } from "zod";

import { DetailEntityType, type DetailIncludes } from "~/database/model";
import { db } from "~/database/prisma";
import { parseOrdering } from "~/lib/ordering";

import {
  DetailsFiltersObj,
  DetailsDefaultOrdering,
  DetailOrderableFields,
  DetailIncludesSchema,
} from "~/actions-v2";
import { fetchEntityDetails } from "~/actions-v2/details/fetch-entity-details";
import { ClientResponse } from "~/api-v2";
import { parseQueryParams } from "~/integrations/http";

export async function generateStaticParams() {
  const experiences = await db.experience.findMany();
  return experiences.map(e => ({
    id: e.id,
  }));
}

export const GET = async (request: NextRequest, { params }: { params: { id: string } }) => {
  const searchParams = request.nextUrl.searchParams;

  const query = parseQueryParams(searchParams.toString());
  const parsed = DetailIncludesSchema.safeParse(query.includes);

  const limit = z.coerce.number().int().positive().optional().safeParse(query.limit).data;
  const visibility =
    z
      .union([z.literal("admin"), z.literal("public")])
      .default("public")
      .safeParse(query.visibility).data ?? "public";

  let includes: DetailIncludes = [];
  if (parsed.success) {
    includes = parsed.data;
  }

  const filters = DetailsFiltersObj.parse(query);

  const ordering = parseOrdering(query, {
    defaultOrdering: DetailsDefaultOrdering,
    fields: [...DetailOrderableFields],
  });

  const fetcher = fetchEntityDetails(includes, DetailEntityType.EXPERIENCE);

  const { error, data } = await fetcher(
    params.id,
    { filters, ordering, limit, visibility },
    { scope: "api" },
  );
  if (error) {
    return error.response;
  }
  return ClientResponse.OK(data).response;
};
