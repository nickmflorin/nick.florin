import "server-only";
import { cache } from "react";

import { getAuthAdminUser } from "~/application/auth";
import { prisma } from "~/prisma/client";
import { fieldIsIncluded, type NestedDetailIncludes, type NestedApiDetail } from "~/prisma/model";

import { getNestedDetailSkills } from "./util";

/* Note: The following is only used in the admin, so visibility is not applicable. */
export const getNestedDetail = cache(
  async <I extends NestedDetailIncludes>(
    id: string,
    { includes }: { includes: I },
  ): Promise<NestedApiDetail<I> | null> => {
    getAuthAdminUser({ strict: true });

    if (fieldIsIncluded(["skills"], includes)) {
      const detail = await prisma.nestedDetail.findUnique({
        where: { id },
        include: {
          project: { include: { skills: true } },
          skills: true,
        },
      });
      if (!detail) {
        return null;
      }
      const skills = await getNestedDetailSkills(detail, { visibility: "admin" });
      const { skills: _skills, project: _project, ...rest } = detail;
      return {
        ...rest,
        project: _project
          ? {
              ..._project,
              skills: skills.filter(sk => _project.skills.some(d => d.skillId === sk.id)),
            }
          : null,
        skills: skills.filter(sk => _skills.some(d => d.skillId === sk.id)),
      } as NestedApiDetail<I>;
    }
    return (await prisma.nestedDetail.findUnique({
      where: { id },
      include: { project: true },
    })) as NestedApiDetail<I> | null;
  },
) as {
  <I extends NestedDetailIncludes>(
    id: string,
    params: { includes: I },
  ): Promise<NestedApiDetail<I> | null>;
};
