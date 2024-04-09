import "server-only";
import { cache } from "react";

import { getAuthAdminUser } from "~/application/auth";
import { prisma } from "~/prisma/client";
import { type ApiDetail, type DetailIncludes, fieldIsIncluded } from "~/prisma/model";
import { convertToPlainObject } from "~/actions/fetches/serialization";

import { includeSkills, getDetailSkills } from "./util";
/* Note: The following is only used in the admin, so visibility is not applicable. */
export const getDetail = cache(
  async <I extends DetailIncludes>(
    id: string,
    { includes }: { includes: I },
  ): Promise<ApiDetail<I> | null> => {
    getAuthAdminUser({ strict: true });

    if (fieldIsIncluded(["skills", "nestedDetails"], includes)) {
      const detail = await prisma.detail.findUnique({
        where: { id },
        include: {
          project: { include: { skills: true } },
          skills: true,
          nestedDetails: {
            /* Accounts for cases where multiple details were created at the same time due to
               seeding. */
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            include: { skills: true, project: { include: { skills: true } } },
          },
        },
      });
      if (!detail) {
        return null;
      }
      // The skills for all projects, details and nested details associated with the entity(s).
      const skills = await getDetailSkills(detail, { visibility: "admin" });
      return convertToPlainObject(includeSkills({ detail, skills })) as ApiDetail<I>;
    } else if (fieldIsIncluded("skills", includes)) {
      const detail = await prisma.detail.findUnique({
        where: { id },
        include: {
          project: { include: { skills: true } },
          skills: true,
        },
      });
      if (!detail) {
        return null;
      }
      // The skills for all projects, details and nested details associated with the entity(s).
      const skills = await getDetailSkills(detail, { visibility: "admin" });
      return convertToPlainObject(includeSkills({ detail, skills })) as ApiDetail<I>;
    } else if (fieldIsIncluded("nestedDetails", includes)) {
      return convertToPlainObject(
        await prisma.detail.findUnique({
          where: { id },
          include: {
            project: true,
            nestedDetails: {
              /* Accounts for cases where multiple details were created at the same time due to
               seeding. */
              orderBy: [{ createdAt: "desc" }, { id: "desc" }],
              include: { project: true },
            },
          },
        }),
      ) as ApiDetail<I> | null;
    } else {
      return convertToPlainObject(
        await prisma.detail.findUnique({
          where: { id },
          include: { project: true },
        }),
      ) as ApiDetail<I> | null;
    }
  },
) as {
  <I extends DetailIncludes>(id: string, params: { includes: I }): Promise<ApiDetail<I> | null>;
};
