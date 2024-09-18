import { type ExperienceIncludes } from "~/database/model";

import { getExperiences } from "~/actions/fetches/experiences";
import { ClientResponse } from "~/api";
import { apiRoute } from "~/api/route";

export const GET = apiRoute(async (request, params, query) => {
  const experiences = await getExperiences({
    includes: query.includes as ExperienceIncludes,
    visibility: query.visibility,
  });
  return ClientResponse.OK(experiences).response;
});
