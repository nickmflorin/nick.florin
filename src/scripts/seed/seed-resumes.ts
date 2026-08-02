import { list, type ListBlobResult } from '@vercel/blob';

import { type Transaction } from '~/database/prisma';
import { type cli } from '~/scripts';
import { stdout } from '~/support';

type Blob = ListBlobResult['blobs'][number];

const fetchBlobs = async () => {
  /* Pagination for the list function is really only applicable if there are > 1000 blobs, so this
     is a definitive edge case. */
  let cursor: string | undefined = undefined;
  let hasMore = true;

  let blobs: Blob[] = [];
  while (hasMore) {
    /* eslint-disable-next-line no-await-in-loop -- Each request depends on the cursor returned
       by the previous one. */
    const response: ListBlobResult = await list({ cursor, mode: 'expanded', prefix: 'resumes/' });
    blobs = [...blobs, ...response.blobs];
    hasMore = response.hasMore;
    cursor = response.cursor;
  }
  return blobs;
};

const countCharInString = (value: string, char: string) => {
  let count = 0;
  for (const character of value) {
    if (character === char) {
      count++;
    }
  }
  return count;
};

const blobIsValid = (blob: Blob): [false, string, Blob] | [true, null, Blob] => {
  /* In the case that there are other non-pdf files in the storage bucket, we will log a warning
     and ignore them - but we do not want to throw a hard error. */
  if (!blob.pathname.endsWith('.pdf')) {
    return [false, 'The blob is not a PDF file!', blob];
    /* In the case that the blob pathname does not start with 'resumes/', throw an error - because
       this is unexpected when using the 'prefix' option on the 'list' method. */
  } else if (!blob.pathname.startsWith('resumes/')) {
    throw new Error(
      `Encountered invalid blob pathname, '${blob.pathname}'!  The pathname should be ` +
        "in the 'resumes' folder!",
    );
  } else if (countCharInString(blob.pathname, '/') !== 1) {
    return [false, "The blob is not a file directly inside of the 'resumes' folder!", blob];
  }
  const regex = /^resumes\/[^\\/]*.pdf$/;
  if (!regex.test(blob.pathname)) {
    return [false, 'The blob pathname does not match the expected format!', blob];
  }
  return [true, null, blob];
};

export async function seedResumes(tx: Transaction, ctx: cli.ScriptContext) {
  stdout.begin('Seeding Resumes...');
  const blobs = await fetchBlobs();

  const validated = blobs.map(blobIsValid);
  const validBlobs = validated
    .filter((v): v is [true, null, Blob] => v[0])
    .map(([, , blob]) => blob);

  const invalidBlobs = validated
    .filter((v): v is [false, string, Blob] => !v[0])
    .map(([, reason, blob]) => ({ blob, reason }));

  if (invalidBlobs.length > 0) {
    const formatted = invalidBlobs
      .map(({ blob, reason }, index) => `${index + 1}. ${blob.pathname}: ${reason}`)
      .join('\n');
    stdout.error(`Encountered ${invalidBlobs.length} invalid blobs:\n${formatted}`);
  }

  const result = await tx.resume.createMany({
    data: validBlobs.map(blob => ({
      createdAt: blob.uploadedAt,
      createdById: ctx.user.id,
      downloadUrl: blob.downloadUrl,
      filename: blob.pathname.split('/')[1],
      pathname: blob.pathname,
      size: blob.size,
      updatedAt: new Date(),
      updatedById: ctx.user.id,
      url: blob.url,
    })),
  });

  stdout.complete(`Seeded ${result.count} Resumes`);
}
