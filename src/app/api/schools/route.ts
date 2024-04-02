import { getAuthAdminUser } from "~/application/auth";
import { getSchools } from "~/actions/fetches/schools";
import { ClientResponse } from "~/api";

export async function GET() {
  await getAuthAdminUser();
  const schools = await getSchools();
  return ClientResponse.OK(schools).response;
}
