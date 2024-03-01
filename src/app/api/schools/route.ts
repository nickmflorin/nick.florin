import { ClientResponse } from "~/application/http";
import { getSchools } from "~/actions/fetches/get-schools";

export async function GET() {
  const schools = await getSchools();
  return ClientResponse.OK(schools).toResponse();
}
