import { getAuthAdminUser } from "~/application/auth";
import { getCompanies } from "~/actions/fetches/get-companies";
import { ClientResponse } from "~/http";

export async function GET() {
  await getAuthAdminUser();
  const companies = await getCompanies();
  return ClientResponse.OK(companies).toResponse();
}
