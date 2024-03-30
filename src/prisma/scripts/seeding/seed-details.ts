import { prisma } from "../../client";
import { type DetailEntityType, type Skill } from "../../model";
import { type JsonDetail } from "../fixtures/schemas";

import { findCorrespondingSkillsSync } from "./seed-skills";
import { type SeedContext } from "./types";

export const createDetail = (
  ctx: SeedContext,
  {
    skills,
    entityId,
    entityType,
    detail: { nestedDetails = [], skills: jsonSkills = [], ...jsonDetail },
  }: {
    detail: JsonDetail;
    skills: Skill[];
    entityId: string;
    entityType: DetailEntityType;
  },
) =>
  prisma.detail.create({
    data: {
      ...jsonDetail,
      entityId,
      entityType,
      createdById: ctx.user.id,
      updatedById: ctx.user.id,
      skills: {
        create: findCorrespondingSkillsSync(jsonSkills, skills).map(sk => ({
          assignedById: ctx.user.id,
          skillId: sk.id,
        })),
      },
      nestedDetails: {
        create: nestedDetails.map(({ skills: jsonNestedSkills = [], ...jsonNestedDetail }) => ({
          ...jsonNestedDetail,
          createdById: ctx.user.id,
          updatedById: ctx.user.id,
          skills: {
            create: findCorrespondingSkillsSync(jsonNestedSkills, skills).map(sk => ({
              assignedById: ctx.user.id,
              skillId: sk.id,
            })),
          },
        })),
      },
    },
  });
