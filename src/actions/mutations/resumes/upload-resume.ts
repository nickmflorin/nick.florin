"use server";
import { revalidatePath } from "next/cache";

import { put, del, type PutBlobResult } from "@vercel/blob";

import { getAuthAdminUser } from "~/application/auth";
import { logger } from "~/application/logger";
import { prisma } from "~/prisma/client";
import type { BrandResume } from "~/prisma/model";
import { ApiClientGlobalError, type ApiClientGlobalErrorJson } from "~/api";
import { convertToPlainObject } from "~/api/serialization";

const resumeFilePath = (name: string) => `resumes/${name}`;

export const uploadResume = async (
  formData: FormData,
): Promise<BrandResume | ApiClientGlobalErrorJson> => {
  const user = await getAuthAdminUser({ strict: true });

  const resumeFile = formData.get("file") as File;

  return await prisma.$transaction(async tx => {
    let blob: PutBlobResult;
    try {
      blob = await put(resumeFilePath(resumeFile.name), resumeFile, {
        /* Note: Support for 'private' is planned in the future for Vercel Blob, and should be
         switched once it is available. */
        access: "public",
      });
    } catch (e) {
      logger.error(`There was an error uploading resume ${resumeFile.name}:\n${e}`, {
        file: resumeFile,
        error: e,
      });
      return ApiClientGlobalError.BadRequest("There was an error uploading the resume.").json;
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
      logger.error(`There was an error creating the resume for the blob ${blob.url}:\n${e}`, {
        blob,
        error: e,
        file: resumeFile,
      });
      try {
        await del(blob.url);
      } catch (e) {
        logger.error(
          `There was an error deleting the blob ${blob.url} after the resume model failed to be ` +
            `created.  There will be an erroneous blob in storage as a result:\n${e}`,
          {
            blob,
            file: resumeFile,
            error: e,
          },
        );
      }
      return ApiClientGlobalError.BadRequest("There was an error uploading the resume.").json;
    }
    revalidatePath("/api/resumes");
    return convertToPlainObject(resume);
  });
};
