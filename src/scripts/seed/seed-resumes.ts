import { list, type ListBlobResult } from "@vercel/blob";

import { type Transaction } from "~/database/prisma";
import { type SeedContext } from "~/scripts/context";
import { stdout } from "~/support";

type Blob = ListBlobResult["blobs"][number];

const fetchBlobs = async () => {
  /* Note: Pagination for the list function is really only applicable if there are > 1000 blobs,
     so this is a definitive edge case. */
  let cursor: string | undefined = undefined;
  let hasMore = true;

  let blobs: Blob[] = [];
  while (hasMore) {
    const response: ListBlobResult = await list({ cursor, prefix: "resumes/", mode: "expanded" });
    blobs = [...blobs, ...response.blobs];
    hasMore = response.hasMore;
    cursor = response.cursor;
  }
  return blobs;
};

const countCharInString = (value: string, char: string) => {
  let count = 0;
  for (let i = 0; i < value.length; i++) {
    if (value[i] === char) {
      count++;
    }
  }
  return count;
};

const blobIsValid = (blob: Blob): [false, string, Blob] | [true, null, Blob] => {
  /* In the case that there are other non-pdf files in the storage bucket, we will log a warning
     and ignore them - but we do not want to throw a hard error. */
  if (!blob.pathname.endsWith(".pdf")) {
    return [false, "The blob is not a PDF file!", blob];
    /* In the case that the blob pathname does not start with 'resumes/', throw an error - because
       this is unexpected when using the 'prefix' option on the 'list' method. */
  } else if (!blob.pathname.startsWith("resumes/")) {
    throw new Error(
      `Encountered invalid blob pathname, '${blob.pathname}'!  The pathname should be ` +
        "in the 'resumes' folder!",
    );
  } else if (countCharInString(blob.pathname, "/") != 1) {
    return [false, "The blob is not a file directly inside of the 'resumes' folder!", blob];
  }
  /* As a final check, before we insert into the database, use a regex to ensure the pathname is
     correct. */
  const regex = /^resumes\/[^\\/]*.pdf$/;
  if (!regex.test(blob.pathname)) {
    return [false, "The blob pathname does not match the expected format!", blob];
  }
  return [true, null, blob];
};

export async function seedResumes(tx: Transaction, ctx: SeedContext) {
  stdout.begin("Seeding Resumes...");
  const blobs = await fetchBlobs();

  const validated = blobs.map(blobIsValid);
  const validBlobs = validated
    .filter((v): v is [true, null, Blob] => v[0])
    .map(([, , blob]) => blob);

  const invalidBlobs = validated
    .filter((v): v is [false, string, Blob] => !v[0])
    .map(([, reason, blob]) => ({ reason, blob }));

  if (invalidBlobs.length > 0) {
    const formatted = invalidBlobs
      .map(({ reason, blob }, index) => `${index + 1}. ${blob.pathname}: ${reason}`)
      .join("\n");
    stdout.error(`Encountered ${invalidBlobs.length} invalid blobs:\n${formatted}`);
  }

  const result = await tx.resume.createMany({
    data: validBlobs.map(blob => ({
      updatedById: ctx.user.id,
      createdById: ctx.user.id,
      updatedAt: new Date(),
      createdAt: blob.uploadedAt,
      size: blob.size,
      filename: blob.pathname.split("/")[1],
      url: blob.url,
      downloadUrl: blob.downloadUrl,
      pathname: blob.pathname,
    })),
  });

  stdout.complete(`Seeded ${result.count} Resumes`);
}
