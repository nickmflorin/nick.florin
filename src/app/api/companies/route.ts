import { getAuthAdminUser } from "~/application/auth";
import { ClientResponse } from "~/application/http";
import { getCompanies } from "~/actions/fetches/get-companies";

export async function GET() {
  await getAuthAdminUser();
  const companies = await getCompanies();
  return ClientResponse.OK(companies).toResponse();
}
