'use server';
import { del } from '@vercel/blob';

import { getAuthedUser } from '~/application/auth/server-v2';
import { type BrandResume } from '~/database/model';
import { db } from '~/database/prisma';

import { getResumesOrdering, type MutationActionResponse } from '~/actions';
import { ApiClientGlobalError } from '~/api';

import { setResumesPrimaryFlag } from './fetch-resumes';

/**
 * Fetches all resumes with the `primary` flag reconciled via {@link setResumesPrimaryFlag}.
 *
 * This is used after a resume is deleted, because deleting a resume can require a different
 * resume to be flagged as primary.
 */
const getResumesWithPrimaryFlag = async (): Promise<BrandResume[]> => {
  const resumes = await db.resume.findMany({ orderBy: getResumesOrdering() });
  return setResumesPrimaryFlag(resumes);
};

export const deleteResume = async (id: string): Promise<MutationActionResponse<BrandResume[]>> => {
  const { error, isAdmin } = await getAuthedUser();
  if (error) {
    return { error: error.json };
  } else if (!isAdmin) {
    return {
      error: ApiClientGlobalError.Forbidden({}).json,
    };
  }
  const resume = await db.resume.findUnique({ where: { id } });
  if (!resume) {
    return { error: ApiClientGlobalError.NotFound({}).json };
  }
  return await db.$transaction(async tx => {
    await tx.resume.delete({ where: { id: resume.id } });
    await del(resume.url);
    return { data: await getResumesWithPrimaryFlag() };
  });
};
