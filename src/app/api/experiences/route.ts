import { getExperiences } from "~/actions/fetches/get-experiences";
import { ClientResponse } from "~/api";

export async function GET() {
  const experiences = await getExperiences({});
  return ClientResponse.OK(experiences).toResponse();
}
