import { z } from 'zod';

import {
  type AnyFieldCodec,
  type CanonicalFields,
  type FieldCodec,
  type FieldCodecRecord,
} from '../fields/field-codec';

import { decodeMeta, encodeMeta, MetaSchema, type RecordIdentity } from './meta';

/**
 * The canonical, fully populated in-memory form of a record: every field decoded, plus the
 * database identity when the record has one. This is the shape invariants are validated against,
 * the shape the future diff operates on, and the hinge both codecs convert through.
 */
export type CanonicalRecord<TFields extends FieldCodecRecord> = {
  readonly meta: null | RecordIdentity;
} & CanonicalFields<TFields>;

interface RecordCodecOptions {
  /**
   * Whether the record carries a `meta:` identity block. Disabled for sub-objects that are not
   * database rows of their own, such as a role's `content` grouping.
   *
   * @default true
   */
  readonly meta?: boolean;
}

/**
 * The fixture-side codec for one record shape: derives a strict zod object from a field-codec
 * record and converts whole records between their fixture and canonical forms. Nested record
 * shapes compose through `recordField`/`recordListField`, so an aggregate's entire tree is
 * expressed as one field record.
 */
export class RecordCodec<TFields extends FieldCodecRecord> {
  private readonly withMeta: boolean;
  public readonly fields: TFields;
  public readonly schema: z.ZodType<Record<string, unknown>>;

  constructor(fields: TFields, options?: RecordCodecOptions) {
    this.fields = fields;
    this.withMeta = options?.meta ?? true;
    const shape: Record<string, z.ZodTypeAny> = Object.fromEntries(
      Object.entries(fields).map(([key, codec]) => [key, codec.schema]),
    );
    if (this.withMeta) {
      shape.meta = MetaSchema.optional();
    }
    this.schema = z.object(shape).strict();
  }

  public decode(raw: unknown): CanonicalRecord<TFields> {
    const parsed = this.schema.parse(raw);
    const result: Record<string, unknown> = {};
    for (const [key, codec] of Object.entries<AnyFieldCodec>(this.fields)) {
      /* The value was validated by this exact codec's schema in the object parse above; the loop
         erases the per-field pairing the types carry, so the checker cannot see it. */
      result[key] = codec.decode(parsed[key] as never);
    }
    const meta = this.withMeta ? parsed.meta : undefined;
    result.meta = meta === undefined ? null : decodeMeta(MetaSchema.parse(meta));
    /* Built key-by-key from `fields`, so the record satisfies the mapped type by construction. */
    return result as CanonicalRecord<TFields>;
  }

  /**
   * Encodes a canonical record into its fixture form, eliding every field whose codec returns
   * `undefined`.
   *
   * Keys are emitted in alphabetical order, after `meta`, rather than in field-declaration order.
   * Declaration order is not a property of the content — a field record assembled by spreading
   * another (`NodeFields` over `NestedNodeFields`) orders its own additions last — so emitting it
   * would make a pull reorder keys inside every affected record and bury the real change in noise.
   */
  public encode(record: CanonicalRecord<TFields>): Record<string, unknown> {
    const encoded: Record<string, unknown> = {};
    /* The loop erases the field-to-value pairing the mapped type carries, so the record access
       and the codec call both need the checker stood down; the pairing holds by construction. */
    const values = record as Record<string, unknown>;
    for (const [key, codec] of Object.entries<AnyFieldCodec>(this.fields)) {
      const value = codec.encode(values[key] as never);
      if (value !== undefined) {
        encoded[key] = value;
      }
    }
    const result: Record<string, unknown> = {};
    if (this.withMeta && record.meta !== null) {
      result.meta = encodeMeta(record.meta);
    }
    for (const key of Object.keys(encoded).sort()) {
      result[key] = encoded[key];
    }
    return result;
  }
}

/**
 * A required nested sub-object, validated and converted by its own {@link RecordCodec}.
 */
export const recordField = <TFields extends FieldCodecRecord>(
  codec: RecordCodec<TFields>,
): FieldCodec<Record<string, unknown>, CanonicalRecord<TFields>> => ({
  decode: value => codec.decode(value),
  encode: value => codec.encode(value),
  schema: codec.schema,
});

/**
 * An ordered list of nested records. Position in the list is the record's order — the canonical
 * form carries no `order` field; the database column derives from the index at write time.
 */
export const recordListField = <TFields extends FieldCodecRecord>(
  codec: RecordCodec<TFields>,
): FieldCodec<Record<string, unknown>[] | undefined, CanonicalRecord<TFields>[]> => ({
  decode: value => (value ?? []).map(item => codec.decode(item)),
  encode: value => (value.length > 0 ? value.map(item => codec.encode(item)) : undefined),
  schema: z.array(codec.schema).optional(),
});
