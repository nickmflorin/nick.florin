import { type CompanyIncludes } from "~/database/model";

import { getCompanies } from "~/actions/fetches/companies";
import { ClientResponse } from "~/api";
import { apiRoute } from "~/api/route";

export const GET = apiRoute(async (request, params, query) => {
  const courses = await getCompanies({
    includes: query.includes as CompanyIncludes,
    visibility: query.visibility,
  });
  return ClientResponse.OK(courses).response;
});
