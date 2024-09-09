import { type SchoolIncludes } from "~/prisma/model";

import { getSchools } from "~/actions/fetches/schools";
import { ClientResponse } from "~/api";
import { apiRoute } from "~/api/route";

export const GET = apiRoute(async (request, params, query) => {
  const schools = await getSchools({
    includes: query.includes as SchoolIncludes,
    visibility: query.visibility,
  });
  return ClientResponse.OK(schools).response;
});
