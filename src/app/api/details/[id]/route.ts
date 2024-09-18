import { type DetailIncludes } from "~/database/model";
import { db } from "~/database/prisma";

import { getDetail } from "~/actions/fetches/details";
import { ClientResponse, ApiClientGlobalError } from "~/api";
import { apiRoute } from "~/api/route";

export async function generateStaticParams() {
  const details = await db.detail.findMany();
  return details.map(c => ({
    id: c.id,
  }));
}

export const GET = apiRoute(async (request, { params }: { params: { id: string } }, query) => {
  const detail = await getDetail(params.id, {
    includes: query.includes as DetailIncludes,
    visibility: query.visibility,
  });
  if (!detail) {
    return ApiClientGlobalError.NotFound().response;
  }
  return ClientResponse.OK(detail).response;
});
