import 'server-only';

import { unstable_cache as unstableCache } from 'next/cache';
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
/* Ordering by `primary` before `createdAt` is what makes the flag an override rather than a
   requirement: a flagged resume always wins, and the most recently uploaded one stands in when no
   resume carries the flag. Restricting the read to `primary: true` instead meant that a database
   with no flag set - which is the state a fresh seed or a cleared flag leaves behind - silently
   removed the resume actions from the header entirely. */
const readPrimaryResumePayload = unstableCache(
  async (): Promise<null | string> => {
    const resume = await db.resume.findFirst({
      orderBy: [{ primary: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
    });
    return resume === null ? null : serializeForCache(convertToPlainObject(resume));
  },
  ['primary-resume'],
  { revalidate: PrimaryResumeCacheRevalidateSeconds, tags: [PrimaryResumeCacheTag] },
);

/**
 * Returns the resume the site surfaces publicly — the one flagged `primary`, or the most recently
 * uploaded resume when no resume is flagged — and `null` only when no resumes exist at all.
 *
 * The fallback exists because the header and the mobile navigation menu both render their resume
 * actions from this read and show nothing when it resolves to `null`. Treating the flag as
 * required made an unset flag indistinguishable from having no resume at all.
 */
export const getPrimaryResume = cache(async (): Promise<BrandResume | null> => {
  const payload = await readPrimaryResumePayload();
  return payload === null ? null : deserializeFromCache<BrandResume>(payload);
});
