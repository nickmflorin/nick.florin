import { getAuthAdminUser } from "~/application/auth";
import { getCompanies } from "~/actions/fetches/get-companies";
import { ClientResponse } from "~/api";

export async function GET() {
  await getAuthAdminUser();
  const companies = await getCompanies();
  return ClientResponse.OK(companies).response;
}
