"use server";
import { z } from "zod";

import { ClientError } from "~/application/errors";
import { slugify } from "~/lib/formatters";
import { getAuthUser } from "~/server/auth";
import { prisma } from "~/prisma/client";
import { type Skill } from "~/prisma/model";

const UpdateSkillSchema = z.object({
  label: z.string().optional(),
  slug: z.string().optional(),
  refreshSlug: z.boolean().optional(),
});

export const updateSkill = async (
  id: string,
  { refreshSlug, slug, ...data }: z.infer<typeof UpdateSkillSchema>,
): Promise<Skill> => {
  const user = await getAuthUser();
  /* Note: We may want to return the error in the response body in the future, for now this is
     fine - since it is not expected. */
  if (!user) {
    throw ClientError.NotAuthenticated();
  } else if (!user.isAdmin) {
    throw ClientError.Forbidden();
  }
  const skill = await prisma.skill.findUniqueOrThrow({ where: { id } });
  const currentLabel = data.label !== undefined ? data.label : skill.label;

  let updateData: Omit<z.infer<typeof UpdateSkillSchema>, "refreshSlug"> = { ...data };
  if (slug !== undefined || refreshSlug === true) {
    updateData = { ...updateData, slug: slug !== undefined ? slug : slugify(currentLabel) };
  }
  return await prisma.skill.update({
    where: { id },
    data: { ...updateData, updatedById: user.id },
  });
};
