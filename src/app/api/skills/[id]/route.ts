import { type NextRequest } from "next/server";

import { prisma } from "~/prisma/client";
import { type ApiSkill } from "~/prisma/model";
import { getSkill } from "~/actions/fetches/get-skill";
import { ClientResponse, ApiClientGlobalError } from "~/http";

/* export async function generateStaticParams() {
     const skills = await prisma.skill.findMany();
     return skills.map(skill => ({
       id: skill.id,
     }));
   } */

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const skill = await getSkill(params.id, { visibility: "public" });
  if (!skill) {
    return ApiClientGlobalError.NotFound().toResponse();
  }
  return ClientResponse.OK(skill).toResponse();
}
