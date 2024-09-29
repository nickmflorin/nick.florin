"use server";
import { del } from "@vercel/blob";

import { getAuthedUser } from "~/application/auth/server-v2";
import { type BrandResume } from "~/database/model";
import { db } from "~/database/prisma";

import { type MutationActionResponse } from "~/actions";
import { getResumesOrdering } from "~/actions";
import { ApiClientGlobalError } from "~/api";

import { setResumesPrimaryFlag } from "./fetch-resumes";

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
    /* TODO: We may want to log a warning if we are deleing a resume that exists in the DB but not
       in the blob storage... We would have to use the 'list' method. */
    await del(resume.url);

    /* Deleting a resume can cause the prioritization flag to switch if there were multiple resumes
       with 'primary' set to 'true'. */
    const resumes = await db.resume.findMany({ orderBy: getResumesOrdering() });
    return { data: setResumesPrimaryFlag(resumes) };
  });
};
