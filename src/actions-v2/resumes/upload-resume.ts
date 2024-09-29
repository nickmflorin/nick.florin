"use server";
import { put, del, type PutBlobResult } from "@vercel/blob";

import { getAuthedUser } from "~/application/auth/server";
import type { BrandResume } from "~/database/model";
import { db } from "~/database/prisma";
import { logger } from "~/internal/logger";

import { type MutationActionResponse } from "~/actions-v2/mutations";
import { convertToPlainObject } from "~/api/serialization";
import { ApiClientGlobalError } from "~/api-v2";

const resumeFilePath = (name: string) => `resumes/${name}`;

export const uploadResume = async (
  formData: FormData,
): Promise<MutationActionResponse<BrandResume>> => {
  const { user } = await getAuthedUser({ strict: true });

  const resumeFile = formData.get("file") as File;

  return await db.$transaction(async tx => {
    let blob: PutBlobResult;
    try {
      blob = await put(resumeFilePath(resumeFile.name), resumeFile, {
        /* Note: Support for 'private' is planned in the future for Vercel Blob, and should be
           switched once it is available. */
        access: "public",
      });
    } catch (e) {
      logger.errorUnsafe(e, `There was an error uploading resume ${resumeFile.name}.`, {
        file: resumeFile,
      });
      return {
        error: ApiClientGlobalError.BadRequest({
          message: "There was an error uploading the resume.",
        }).json,
      };
    }
    let resume: BrandResume;
    try {
      resume = await tx.resume.create({
        data: {
          createdById: user.id,
          updatedById: user.id,
          downloadUrl: blob.downloadUrl,
          url: blob.url,
          filename: resumeFile.name,
          pathname: blob.pathname,
          size: resumeFile.size,
        },
      });
    } catch (e) {
      logger.errorUnsafe(e, `There was an error creating the resume for the blob ${blob.url}.`, {
        blob,
        file: resumeFile,
      });
      try {
        await del(blob.url);
      } catch (e) {
        logger.errorUnsafe(
          e,
          `There was an error deleting the blob ${blob.url} after the resume model failed to be ` +
            "created.  There will be an erroneous blob in storage as a result.",
          { blob, file: resumeFile },
        );
      }
      return {
        error: ApiClientGlobalError.BadRequest({
          message: "There was an error uploading the resume.",
        }).json,
      };
    }
    return { data: convertToPlainObject(resume) };
  });
};
