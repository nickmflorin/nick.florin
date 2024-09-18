import { type RepositoryIncludes } from "~/database/model";

import { getRepositories } from "~/actions/fetches/repositories";
import { ClientResponse } from "~/api";
import { apiRoute } from "~/api/route";

export const GET = apiRoute(async (request, params, query) => {
  const repositories = await getRepositories({
    includes: query.includes as RepositoryIncludes,
    visibility: query.visibility,
  });
  return ClientResponse.OK(repositories).response;
});
