import { getAuthAdminUser } from "~/application/auth";
import { getSchools } from "~/actions/fetches/get-schools";
import { ClientResponse } from "~/http";

export async function GET() {
  await getAuthAdminUser();
  const schools = await getSchools();
  return ClientResponse.OK(schools).toResponse();
}
