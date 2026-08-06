import 'server-only';

import { unstable_cache } from 'next/cache';
import { cache } from 'react';

import { type BrandResume } from '~/database/model';
import { db } from '~/database/prisma';

import { convertToPlainObject, deserializeFromCache, serializeForCache } from '~/api/serialization';

/**
 * The cache tag under which the primary-resume read is stored cross-request.
 *
 * Every mutation that can change which resume is primary — upload, update and delete — must call
 * `updateTag` with this tag so the header's resume menu reflects the change on the next request.
 * The time-based revalidation window below additionally bounds staleness against out-of-band
 * writes (seeds, scripts).
 */
export const PrimaryResumeCacheTag = 'primary-resume';

/**
 * The number of seconds a cached primary-resume read may serve before it is refreshed,
 * independent of tag revalidation from the resume mutations.
 */
const PrimaryResumeCacheRevalidateSeconds = 3600;

/* The cached layer stores a superjson payload string rather than the resume itself, because
   `unstable_cache` JSON-serializes stored values - a `Date` field would silently come back as a
   string on a cache hit while the `BrandResume` type continued to claim `Date`. */
const readPrimaryResumePayload = unstable_cache(
  async (): Promise<null | string> => {
    const resumes = await db.resume.findMany({
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      where: { primary: true },
    });
    const resume = resumes.at(0);
    return resume === undefined ? null : serializeForCache(convertToPlainObject(resume));
  },
  ['primary-resume'],
  { revalidate: PrimaryResumeCacheRevalidateSeconds, tags: [PrimaryResumeCacheTag] },
);

export const getPrimaryResume = cache(async (): Promise<BrandResume | null> => {
  const payload = await readPrimaryResumePayload();
  return payload === null ? null : deserializeFromCache<BrandResume>(payload);
});
