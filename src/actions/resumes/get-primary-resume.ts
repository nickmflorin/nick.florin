import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';

import { type BrandResume } from '~/database/model';
import { db } from '~/database/prisma';

import { convertToPlainObject } from '~/api/serialization';

/**
 * The cache tag under which the primary-resume read is stored cross-request.
 *
 * Every mutation that can change which resume is primary — upload, update and delete — must call
 * `updateTag` with this tag so the header's resume actions reflect the change on the next request.
 * The cache life below additionally bounds staleness against out-of-band writes (seeds, scripts).
 */
export const PrimaryResumeCacheTag = 'primary-resume';

/**
 * Returns the resume the site surfaces publicly — the one flagged `primary`, or the most recently
 * uploaded resume when no resume is flagged — and `null` only when no resumes exist at all.
 *
 * The fallback exists because the header and the mobile navigation menu both render their resume
 * actions from this read and show nothing when it resolves to `null`. Treating the flag as
 * required made an unset flag indistinguishable from having no resume at all. Ordering by the flag
 * before the creation date is what makes it an override rather than a requirement.
 */
export const getPrimaryResume = async (): Promise<BrandResume | null> => {
  'use cache';
  cacheTag(PrimaryResumeCacheTag);
  cacheLife('hours');

  const resume = await db.resume.findFirst({
    orderBy: [{ primary: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
  });
  return resume === null ? null : convertToPlainObject(resume);
};
