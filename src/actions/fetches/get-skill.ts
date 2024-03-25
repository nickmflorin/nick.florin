import "server-only";
import { cache } from "react";

import { getAuthAdminUser } from "~/application/auth";
import { prisma, isPrismaDoesNotExistError, isPrismaInvalidIdError } from "~/prisma/client";
import { type ApiSkill, type Skill } from "~/prisma/model";
import { conditionalFilters } from "~/prisma/util";
import { ApiClientGlobalError } from "~/api";

import { type Visibility } from "../visibility";

import { toApiSkill } from "./get-skills";

export const preloadSkill = (id: string, { visibility = "public" }: { visibility: Visibility }) => {
  void getSkill(id, { visibility });
};

// This method is currently not used but is being left here for future use.
export const getSkill = cache(
  async (id: string, { visibility = "public" }: { visibility: Visibility }): Promise<ApiSkill> => {
    let skill: Skill;
    /* TODO: We have to figure out how to get this to render an API response, instead of throwing
       a hard error, in the case that this is being called from the context of a route handler. */
    await getAuthAdminUser({ strict: visibility === "admin" });
    try {
      skill = await prisma.skill.findUniqueOrThrow({
        where: { id },
      });
    } catch (e) {
      if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
        throw ApiClientGlobalError.NotFound();
      }
      throw e;
    }
    if (skill.visible === false && visibility === "public") {
      throw ApiClientGlobalError.Forbidden();
    }

    const experiences = await prisma.experience.findMany({
      include: { company: true, skills: true },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      where: {
        AND: conditionalFilters([
          visibility === "public" ? { visible: true } : undefined,
          {
            skills: {
              some: { skillId: { in: [skill.id] } },
            },
          },
        ]),
      },
    });

    const educations = await prisma.education.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      include: { skills: true, school: true },
      where: {
        AND: conditionalFilters([
          visibility === "public" ? { visible: true } : undefined,
          {
            skills: {
              some: { skillId: { in: [skill.id] } },
            },
          },
        ]),
      },
    });

    return toApiSkill({ skill, experiences, educations });
  },
);
