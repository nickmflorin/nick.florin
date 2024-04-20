import { type ProjectIncludes } from "~/prisma/model";
import { getProjects } from "~/actions/fetches/projects";
import { ClientResponse } from "~/api";
import { apiRoute } from "~/api/route";

export const GET = apiRoute(async (request, params, query) => {
  const courses = await getProjects({
    includes: query.includes as ProjectIncludes,
    visibility: query.visibility,
  });
  return ClientResponse.OK(courses).response;
});
