"use server";
import { type z } from "zod";

import { getAuthedUser } from "~/application/auth/server-v2";
import { type BrandResume } from "~/database/model";
import { db } from "~/database/prisma";

import { type MutationActionResponse } from "~/actions";
import { getResumesOrdering } from "~/actions";
import { ResumeSchema } from "~/actions/schemas";
import { ApiClientGlobalError, ApiClientFormError } from "~/api";

import { setResumesPrimaryFlag } from "./fetch-resumes";

const UpdateResumeSchema = ResumeSchema.partial();

export const updateResume = async (
  resumeId: string,
  data: z.infer<typeof UpdateResumeSchema>,
): Promise<MutationActionResponse<{ resume: BrandResume; resumes: BrandResume[] }>> => {
  const { user, error, isAdmin } = await getAuthedUser();
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
    where: { id: resume.id },
    data: {
      ...data,
      createdById: user.id,
      updatedById: user.id,
    },
  });
  const resumes = await db.resume.findMany({ orderBy: getResumesOrdering() });
  return {
    data: {
      resume: updated,
      resumes: setResumesPrimaryFlag(resumes),
    },
  };
};
