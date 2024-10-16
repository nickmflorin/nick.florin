import { type JsonDetail } from "~/database/fixtures";
import { type DetailEntityType, type Skill } from "~/database/model";
import { type Transaction } from "~/database/prisma";
import { type cli } from "~/scripts";

import { findCorrespondingProject } from "./seed-projects";

export const createDetail = async (
  tx: Transaction,
  ctx: cli.ScriptContext,
  {
    entityId,
    entityType,
    skills,
    detail: { nestedDetails = [], project, skills: jsonSkills = [], ...jsonDetail },
  }: {
    detail: JsonDetail;
    skills: Skill[];
    entityId: string;
    entityType: DetailEntityType;
  },
) => {
  /* This is simply for debugging, since in the case that the slug does not correspond to an
     actual skill, the Prisma error is not super descriptive. */
  const checkSkill = (skill: string) => {
    const sk = skills.find(sk => sk.slug === skill);
    if (sk === undefined) {
      throw new Error(`Invalid slug: ${skill}`);
    }
    return skill;
  };

  const projectId = project ? (await findCorrespondingProject(tx, project)).id : undefined;
  return await tx.detail.create({
    data: {
      ...jsonDetail,
      entityId,
      entityType,
      createdById: ctx.user.id,
      updatedById: ctx.user.id,
      projectId,
      skills: {
        connect: jsonSkills.map(sk => ({ slug: checkSkill(sk) })),
      },
      nestedDetails: {
        create: nestedDetails.map(({ skills: jsonNestedSkills = [], ...jsonNestedDetail }) => ({
          ...jsonNestedDetail,
          createdById: ctx.user.id,
          updatedById: ctx.user.id,
          skills: {
            connect: jsonNestedSkills.map(sk => ({ slug: checkSkill(sk) })),
          },
        })),
      },
    },
  });
};
