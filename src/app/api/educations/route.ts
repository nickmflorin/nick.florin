import { ClientResponse } from "~/application/http";
import { getEducations } from "~/actions/fetches/get-educations";

export async function GET() {
  const educations = await getEducations({});
  return ClientResponse.OK(educations).toResponse();
}
