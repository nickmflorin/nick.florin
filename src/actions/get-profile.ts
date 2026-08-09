import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';

import { type Profile } from '~/database/model';
import { db } from '~/database/prisma';
import { logger } from '~/internal/logger';

import { convertToPlainObject } from '~/api/serialization';

/**
 * The cache tag under which the profile read is stored cross-request.
 *
 * No CMS mutation writes the profile today (it changes through seeding and scripts), so nothing
 * revalidates the tag on demand — the cache life bounds the staleness instead. Any future profile
 * mutation must call `updateTag` with this tag.
 */
export const ProfileCacheTag = 'profile';

export const preloadProfile = () => {
  void getProfile();
};

/**
 * Returns the profile the header renders from, or `null` when none exists.
 *
 * The profile only changes out-of-band (seeds, scripts), so an hour bounds staleness without
 * giving up the first-paint benefit: the header renders from the cache rather than waiting on a
 * database round trip on every request.
 */
export const getProfile = async (): Promise<null | Profile> => {
  'use cache';
  cacheTag(ProfileCacheTag);
  cacheLife('hours');

  const profiles = await db.profile.findMany({ orderBy: { createdAt: 'desc' }, take: 1 });
  const profile = profiles.at(0);
  if (profile === undefined) {
    logger.error(
      'No profile found!  The layout will not include the social buttons in the header.',
    );
    return null;
  }
  return convertToPlainObject(profile);
};
