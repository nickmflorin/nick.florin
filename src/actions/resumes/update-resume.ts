'use server';
import { updateTag } from 'next/cache';

import { type z } from 'zod';

import { getAuthedUser } from '~/application/auth/server-v2';
import { type BrandResume } from '~/database/model';
import { db } from '~/database/prisma';

import { getResumesOrdering, type MutationActionResponse } from '~/actions';
import { ResumeSchema } from '~/actions/schemas';
import { ApiClientFormError, ApiClientGlobalError } from '~/api';

import { setResumesPrimaryFlag } from './fetch-resumes';
import { PrimaryResumeCacheTag } from './get-primary-resume';

const UpdateResumeSchema = ResumeSchema.partial();

export const updateResume = async (
  resumeId: string,
  data: z.infer<typeof UpdateResumeSchema>,
): Promise<MutationActionResponse<{ resume: BrandResume; resumes: BrandResume[] }>> => {
  const { error, isAdmin, user } = await getAuthedUser();
  if (error) {
    return { error: error.json };
  } else if (!isAdmin) {
    return {
      error: ApiClientGlobalError.Forbidden({}).json,
    };
  }

  const resume = await db.resume.findUnique({
    where: { id: resumeId },
  });
  if (!resume) {
    return { error: ApiClientGlobalError.NotFound({}).json };
  }
  const parsed = UpdateResumeSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: ApiClientFormError.fromZodError({ error: parsed.error }).json,
    };
  }

  const updated = await db.resume.update({
    data: {
      ...data,
      updatedById: user.id,
    },
    where: { id: resume.id },
  });
  const resumes = await db.resume.findMany({ orderBy: getResumesOrdering() });
  updateTag(PrimaryResumeCacheTag);
  return {
    data: {
      resume: updated,
      resumes: setResumesPrimaryFlag(resumes),
    },
  };
};
