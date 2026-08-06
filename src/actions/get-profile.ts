import 'server-only';

import { unstable_cache } from 'next/cache';
import { cache } from 'react';

import { type Profile } from '~/database/model';
import { db } from '~/database/prisma';
import { logger } from '~/internal/logger';

import { convertToPlainObject, deserializeFromCache, serializeForCache } from '~/api/serialization';

/**
 * The cache tag under which the profile read is stored cross-request.
 *
 * No CMS mutation writes the profile today (it changes through seeding and scripts), so nothing
 * revalidates the tag on demand — the time-based revalidation window below bounds the staleness
 * instead. Any future profile mutation must call `updateTag` with this tag.
 */
export const ProfileCacheTag = 'profile';

/**
 * The number of seconds a cached profile read may serve before it is refreshed. The profile only
 * changes out-of-band (seeds, scripts), so an hour bounds staleness without giving up the
 * first-paint benefit: the header's profile section renders from the cross-request cache rather
 * than waiting on a database round trip inside its Suspense boundary on every request.
 */
const ProfileCacheRevalidateSeconds = 3600;

/* The cached layer stores a superjson payload string rather than the profile itself, because
   `unstable_cache` JSON-serializes stored values - a `Date` field would silently come back as a
   string on a cache hit while the `Profile` type continued to claim `Date`. */
const readProfilePayload = unstable_cache(
  async (): Promise<null | string> => {
    const profiles = await db.profile.findMany({ orderBy: { createdAt: 'desc' }, take: 1 });
    const profile = profiles.at(0);
    if (profile === undefined) {
      logger.error(
        'No profile found!  The layout will not include the social buttons in the header.',
      );
      return null;
    }
    return serializeForCache(convertToPlainObject(profile));
  },
  ['profile'],
  { revalidate: ProfileCacheRevalidateSeconds, tags: [ProfileCacheTag] },
);

export const preloadProfile = () => {
  void getProfile();
};

export const getProfile = cache(async (): Promise<null | Profile> => {
  const payload = await readProfilePayload();
  return payload === null ? null : deserializeFromCache<Profile>(payload);
});
