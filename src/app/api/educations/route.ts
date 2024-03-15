import { getEducations } from "~/actions/fetches/get-educations";
import { ClientResponse } from "~/api";

export async function GET() {
  const educations = await getEducations({});
  return ClientResponse.OK(educations).toResponse();
}
