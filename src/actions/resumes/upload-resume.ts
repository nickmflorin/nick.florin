'use server';
import { revalidateTag } from 'next/cache';

import { del, put, type PutBlobResult } from '@vercel/blob';

import { getAuthedUser } from '~/application/auth/server-v2';
import { type BrandResume } from '~/database/model';
import { db } from '~/database/prisma';
import { logger } from '~/internal/logger';

import { type MutationActionResponse } from '~/actions/mutations';
import { ApiClientGlobalError } from '~/api';
import { convertToPlainObject } from '~/api/serialization';

import { PrimaryResumeCacheTag } from './get-primary-resume';

const resumeFilePath = (name: string) => `resumes/${name}`;

/**
 * The access level used when persisting a resume file to Vercel Blob storage.
 *
 * Public access is used because Vercel Blob does not currently support private access for
 * uploaded files.
 */
const ResumeBlobAccessLevel = 'public';

export const uploadResume = async (
  formData: FormData,
): Promise<MutationActionResponse<BrandResume>> => {
  const { error, isAdmin, user } = await getAuthedUser();
  if (error) {
    return { error: error.json };
  } else if (!isAdmin) {
    return {
      error: ApiClientGlobalError.Forbidden({}).json,
    };
  }

  const resumeFile = formData.get('file') as File;

  return await db.$transaction(async tx => {
    let blob: PutBlobResult;
    try {
      blob = await put(resumeFilePath(resumeFile.name), resumeFile, {
        access: ResumeBlobAccessLevel,
      });
    } catch (e) {
      logger.errorUnsafe(e, `There was an error uploading resume ${resumeFile.name}.`, {
        file: resumeFile,
      });
      return {
        error: ApiClientGlobalError.BadRequest({
          message: 'There was an error uploading the resume.',
        }).json,
      };
    }
    let resume: BrandResume;
    try {
      resume = await tx.resume.create({
        data: {
          createdById: user.id,
          downloadUrl: blob.downloadUrl,
          filename: resumeFile.name,
          pathname: blob.pathname,
          size: resumeFile.size,
          updatedById: user.id,
          url: blob.url,
        },
      });
    } catch (e) {
      logger.errorUnsafe(e, `There was an error creating the resume for the blob ${blob.url}.`, {
        blob,
        file: resumeFile,
      });
      try {
        await del(blob.url);
      } catch (deletionError) {
        logger.errorUnsafe(
          deletionError,
          `There was an error deleting the blob ${blob.url} after the resume model failed to be ` +
            'created.  There will be an erroneous blob in storage as a result.',
          { blob, file: resumeFile },
        );
      }
      return {
        error: ApiClientGlobalError.BadRequest({
          message: 'There was an error uploading the resume.',
        }).json,
      };
    }
    revalidateTag(PrimaryResumeCacheTag);
    return { data: convertToPlainObject(resume) };
  });
};
