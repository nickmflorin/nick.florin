import { type EducationIncludes } from "~/prisma/model";

import { getEducations } from "~/actions/fetches/educations";
import { ClientResponse } from "~/api";
import { apiRoute } from "~/api/route";

export const GET = apiRoute(async (request, params, query) => {
  const educations = await getEducations({
    includes: query.includes as EducationIncludes,
    visibility: query.visibility,
  });
  return ClientResponse.OK(educations).response;
});
