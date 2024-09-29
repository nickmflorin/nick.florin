import { type NextRequest } from "next/server";

import { z } from "zod";

import { parseOrdering } from "~/lib/ordering";

import { ResumesFiltersObj, ResumesDefaultOrdering, ResumeOrderableFields } from "~/actions-v2";
import { fetchResumes } from "~/actions-v2/resumes/fetch-resumes";
import { ClientResponse } from "~/api-v2";
import { parseQueryParams } from "~/integrations/http";

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;

  const query = parseQueryParams(searchParams.toString());

  const limit = z.coerce.number().int().positive().safeParse(query.limit).data;
  const visibility =
    z
      .union([z.literal("admin"), z.literal("public")])
      .default("public")
      .safeParse(query.visibility).data ?? "public";

  const filters = ResumesFiltersObj.parse(query);

  const ordering = parseOrdering(query, {
    defaultOrdering: ResumesDefaultOrdering,
    fields: [...ResumeOrderableFields],
  });

  const { error, data } = await fetchResumes(
    { filters, ordering, limit, visibility },
    { scope: "api" },
  );
  if (error) {
    return error.response;
  }
  return ClientResponse.OK(data).response;
};
