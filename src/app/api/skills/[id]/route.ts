import { type NextRequest } from "next/server";

import { prisma } from "~/prisma/client";
import { type ApiSkill } from "~/prisma/model";
import { getSkill } from "~/actions/fetches/get-skill";
import { ClientResponse, ApiClientError } from "~/api";
import { parseInclusion } from "~/api/inclusion";

export async function generateStaticParams() {
  const skills = await prisma.skill.findMany();
  return skills.map(skill => ({
    id: skill.id,
  }));
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const includes = parseInclusion(request, ["experiences", "educations", "projects"]);

  let skill: ApiSkill<typeof includes>;
  try {
    skill = await getSkill(params.id, { visibility: "public", includes });
  } catch (e) {
    if (e instanceof ApiClientError) {
      return e.toResponse();
    }
    throw e;
  }
  return ClientResponse.OK(skill).toResponse();
}
