import { ClientResponse } from "~/application/http";
import { getExperiences } from "~/fetches/get-experiences";

export async function GET() {
  const experiences = await getExperiences({});
  return ClientResponse.OK(experiences).toResponse();
}
