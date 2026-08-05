import { type z } from 'zod';

/**
 * The paired, two-way conversion for a single field of a content entity: one zod schema that
 * validates the raw fixture value, and the two transform halves that move the value between its
 * fixture representation and its canonical in-memory representation.
 *
 * The schema is responsible for validation only — it never coerces or transforms. Transformation
 * belongs to {@link FieldCodec.decode} and {@link FieldCodec.encode}, which are deliberately fused
 * into one object so that a representation rule (a date stored as `YYYY-MM-DD`, a default elided
 * from the fixture) is stated exactly once and cannot drift between the push and pull directions.
 *
 * `F` is the fixture-side type as it appears after schema validation; for an elidable field it
 * includes `undefined`, and `encode` returning `undefined` is what elides the field. `C` is the
 * canonical type, which is always fully populated.
 */
export interface FieldCodec<F, C> {
  decode(value: F): C;
  encode(value: C): F;
  /**
   * The entity key this field references by slug, when the field is a slug reference. Consumed by
   * cross-reference validation; absent on ordinary value fields.
   */
  readonly references?: string;
  readonly schema: z.ZodType<F>;
}

/**
 * The shape-erased form of {@link FieldCodec}, usable as a generic constraint. The `never`
 * parameters make every concrete codec assignable regardless of its value types.
 */
export interface AnyFieldCodec {
  decode(value: never): unknown;
  encode(value: never): unknown;
  readonly references?: string;
  readonly schema: z.ZodTypeAny;
}

export type FieldCodecRecord = Record<string, AnyFieldCodec>;

export type FieldCanonical<T extends AnyFieldCodec> = ReturnType<T['decode']>;

export type FieldFixture<T extends AnyFieldCodec> = ReturnType<T['encode']>;

/**
 * The canonical record shape derived from a field-codec record — the single source from which an
 * entity's canonical type is inferred rather than declared by hand.
 */
export type CanonicalFields<TFields extends FieldCodecRecord> = {
  readonly [K in keyof TFields]: FieldCanonical<TFields[K]>;
};
