import superjson, { type SuperJSONResult } from "superjson";
import { z } from "zod";

/**
 * Strips disallowed values (like Symbols) from object keys in Prisma to avoid NextJS warnings about
 * passing plain objects between server/client boundaries.
 *
 * This method is required primarily due to computed fields in Prisma model extensions.
 *
 * Reference
 * ---------
 * https://github.com/prisma/prisma/issues/20627
 */
export function convertToPlainObject<T>(value: T): T {
  return superjson.parse(superjson.stringify(value));
}

const SuperJSONResultSchema = z.object({
  json: z.union([z.record(z.any()), z.array(z.any())]),
  meta: z.record(z.any()).optional(),
});

export const isSuperJsonResult = (result: unknown): result is SuperJSONResult =>
  SuperJSONResultSchema.safeParse(result).success;
