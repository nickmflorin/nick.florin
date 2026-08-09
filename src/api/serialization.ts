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

const SuperJSONResultSchema = z.object({
  json: z.union([z.record(z.any()), z.array(z.any())]),
  meta: z.record(z.any()).optional(),
});

export const isSuperJsonResult = (result: unknown): result is SuperJSON.SuperJSONResult =>
  SuperJSONResultSchema.safeParse(result).success;
