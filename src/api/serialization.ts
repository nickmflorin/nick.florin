import { z } from 'zod';

import type * as SuperJSON from 'superjson';

/**
 * Strips disallowed values (like Symbols) from object keys in Prisma to avoid NextJS warnings about
 * passing plain objects between server/client boundaries.
 *
 * This method is required primarily due to computed fields in Prisma model extensions.
 *
 * @see https://github.com/prisma/prisma/issues/20627
 */
export function convertToPlainObject<T>(value: T): T {
  /* eslint-disable-next-line @typescript-eslint/no-require-imports -- Temp workaround for tests. */
  const superjson = require('superjson') as typeof SuperJSON;
  return superjson.parse<T>(superjson.stringify(value));
}

/**
 * Serializes a value into a superjson payload string for storage in caches that JSON-serialize
 * their entries, such as `unstable_cache`.
 *
 * Storing a rich value in such a cache directly would silently downgrade values JSON cannot
 * represent — most notably `Date` fields, which come back as plain strings on a cache hit while
 * the declared types continue to claim `Date`. Round-tripping through superjson preserves them.
 */
export function serializeForCache<T>(value: T): string {
  /* eslint-disable-next-line @typescript-eslint/no-require-imports -- Temp workaround for tests. */
  const superjson = require('superjson') as typeof SuperJSON;
  return superjson.stringify(value);
}

/**
 * Deserializes a superjson payload string produced by {@link serializeForCache}, restoring the
 * rich values (for example `Date` fields) that a JSON-serializing cache cannot represent.
 */
export function deserializeFromCache<T>(payload: string): T {
  /* eslint-disable-next-line @typescript-eslint/no-require-imports -- Temp workaround for tests. */
  const superjson = require('superjson') as typeof SuperJSON;
  return superjson.parse<T>(payload);
}

const SuperJSONResultSchema = z.object({
  json: z.union([z.record(z.any()), z.array(z.any())]),
  meta: z.record(z.any()).optional(),
});

export const isSuperJsonResult = (result: unknown): result is SuperJSON.SuperJSONResult =>
  SuperJSONResultSchema.safeParse(result).success;
