import { type JsonDetail } from '~/database/fixtures';
import { type DetailEntityType, type Skill } from '~/database/model';
import { type Transaction } from '~/database/prisma';
import { type cli } from '~/scripts';

import { findCorrespondingProject } from './seed-projects';

export const createDetail = async (
  tx: Transaction,
  ctx: cli.ScriptContext,
  {
    detail: { nestedDetails = [], project, skills: jsonSkills = [], ...jsonDetail },
    entityId,
    entityType,
    skills,
  }: {
    detail: JsonDetail;
    entityId: string;
    entityType: DetailEntityType;
    skills: Skill[];
  },
) => {
  /**
   * This is simply for debugging, since in the case that the slug does not correspond to an actual
   * skill, the Prisma error is not super descriptive.
   */
  const checkSkill = (skill: string) => {
    const sk = skills.find(candidate => candidate.slug === skill);
    if (sk === undefined) {
      throw new Error(`Invalid slug: ${skill}`);
    }
    return skill;
  };

  const projectId = project ? (await findCorrespondingProject(tx, project)).id : undefined;
  return await tx.detail.create({
    data: {
      ...jsonDetail,
      createdById: ctx.user.id,
      entityId,
      entityType,
      nestedDetails: {
        create: nestedDetails.map(({ skills: jsonNestedSkills = [], ...jsonNestedDetail }) => ({
          ...jsonNestedDetail,
          createdById: ctx.user.id,
          skills: {
            connect: jsonNestedSkills.map(sk => ({ slug: checkSkill(sk) })),
          },
          updatedById: ctx.user.id,
        })),
      },
      projectId,
      skills: {
        connect: jsonSkills.map(sk => ({ slug: checkSkill(sk) })),
      },
      updatedById: ctx.user.id,
    },
  });
};
