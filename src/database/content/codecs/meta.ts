import { z } from 'zod';

/**
 * The database identity of a record, surfaced in fixtures as the optional `meta:` block. A record
 * authored by hand has none — the first push writes it back — while a record pulled from the
 * database keeps the identity it had. Correlation between the two sides relies on slugs, not on
 * this block.
 */
export interface RecordIdentity {
  readonly createdAt: Date;
  readonly id: string;
  readonly updatedAt: Date;
}

export const MetaSchema = z
  .object({
    createdAt: z.string().datetime(),
    id: z.string().uuid(),
    updatedAt: z.string().datetime(),
  })
  .strict();

export type FixtureMeta = z.infer<typeof MetaSchema>;

export const decodeMeta = (meta: FixtureMeta): RecordIdentity => ({
  createdAt: new Date(meta.createdAt),
  id: meta.id,
  updatedAt: new Date(meta.updatedAt),
});

export const encodeMeta = (identity: RecordIdentity): FixtureMeta => ({
  createdAt: identity.createdAt.toISOString(),
  id: identity.id,
  updatedAt: identity.updatedAt.toISOString(),
});
