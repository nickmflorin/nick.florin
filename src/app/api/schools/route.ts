import { type NextRequest } from "next/server";

import { getAuthAdminUser } from "~/application/auth";
import { type SchoolIncludes } from "~/prisma/model";
import { getSchools } from "~/actions/fetches/schools";
import { ClientResponse } from "~/api";
import { parseInclusion } from "~/api/query";

export async function GET(request: NextRequest) {
  await getAuthAdminUser();
  const schools = await getSchools({
    includes: parseInclusion(request, ["educations"] as const) as SchoolIncludes,
  });
  return ClientResponse.OK(schools).response;
}
