import { type PrismaCodec } from '../codecs/prisma-codec';
import { type CanonicalRecord, type RecordCodec } from '../codecs/record-codec';
import { type FieldCodec, type FieldCodecRecord } from '../fields/field-codec';
import { type IssueCollector } from '../issues';

/**
 * One slug reference a record makes to a record of another entity.
 */
export interface SlugReference {
  readonly entity: string;
  readonly slug: string;
}

/**
 * The field-record constraint every binding satisfies: whatever else an entity carries, it has a
 * `slug`, because slugs are the correlation key of the whole transfer system. The slug is
 * nullable at the codec level — authoring it is optional — and {@link ContentBinding.parse}
 * guarantees it is populated, deriving one when the binding knows how.
 */
export type SluggedFieldCodecRecord = {
  readonly slug: FieldCodec<string | undefined, null | string>;
} & FieldCodecRecord;

/**
 * A canonical record as `parse` returns it: fully decoded, finalized, and with the slug
 * guaranteed present — authored or derived.
 */
export type ParsedRecord<TFields extends FieldCodecRecord> = {
  readonly slug: string;
} & CanonicalRecord<TFields>;

/**
 * The definition of one content entity in the transfer system: how its records bind their two
 * representations together. A binding holds the entity's field codecs (from which the fixture
 * schema and both the fixture and canonical types derive), its database codec, its fixture file
 * identity, and its entity-level invariants.
 *
 * Bindings are stateless descriptors. The stores do the moving; a binding only defines what a
 * record of this entity is on each side and how the two sides correspond.
 */
export abstract class ContentBinding<TFields extends SluggedFieldCodecRecord> {
  /**
   * Keys of the entities this one references, in the registry's vocabulary. Declared as keys
   * rather than binding instances so that bindings never import each other. Writes and reference
   * validation follow this ordering.
   */
  public abstract readonly dependsOn: readonly string[];
  public abstract readonly fixtureFile: string;
  /**
   * The single top-level key of the fixture file's YAML document (for example `competencies`).
   */
  public abstract readonly fixtureKey: string;
  public abstract readonly fixtureShape: 'list' | 'single';
  /**
   * The entity's identity in the registry and in issue reports, and the key slug references name
   * it by (for example `competency`).
   */
  public abstract readonly key: string;
  public abstract readonly prisma: PrismaCodec<ParsedRecord<TFields>>;
  public abstract readonly record: RecordCodec<TFields>;

  /**
   * Derives a slug for a record that did not author one, from the record's natural name. The
   * base returns `null`, which makes the slug required; a binding overrides this when its entity
   * has a name a slug can be deterministically derived from.
   */
  protected deriveSlug(_record: CanonicalRecord<TFields>): null | string {
    return null;
  }

  /**
   * A hook applied after decoding and before validation, for canonicalization that needs the
   * whole record — stamping derived content-node slugs, for example. The base is the identity.
   */
  protected finalize(record: CanonicalRecord<TFields>): CanonicalRecord<TFields> {
    return record;
  }

  /**
   * Entity-level invariants that schema validation cannot express. The base checks nothing.
   */
  protected validate(_record: ParsedRecord<TFields>, _issues: IssueCollector): void {
    return undefined;
  }

  /**
   * Additional keys the record may be correlated by when its slug matches nothing on the other
   * side, tried in order after the slug.
   *
   * Slugs are the correlation key of the transfer system, but rows of the reused legacy models
   * predate the slug column: a record whose slug matches nothing may still be the very row the
   * target already holds, under a name that is unique there. Declaring the alternate here rather
   * than querying for it inside a codec is what lets the planning phase see the correlation, so a
   * record that will in fact link to an existing row is never mistaken for a creation.
   */
  public alternateKeys(_record: ParsedRecord<TFields>): readonly string[] {
    return [];
  }

  /**
   * Re-establishes on a record assembled outside the fixture path the canonical invariants that
   * decoding guarantees — collapsed prose, calendar dates at UTC midnight, resolved channel
   * inheritance, stamped slugs.
   *
   * The database codecs build canonical records straight from rows and never run a field codec's
   * `decode`, so without this the two sides of a sync are canonical in different senses and compare
   * unequal on values that are in fact the same. Passing a record out through its own encoding and
   * back in applies every rule exactly once, so it is idempotent by construction.
   */
  public normalize(record: ParsedRecord<TFields>, issues: IssueCollector): ParsedRecord<TFields> {
    return this.parse(this.serialize(record), issues);
  }

  /**
   * Parses one raw fixture record into its canonical form: schema validation and field decoding
   * (via the record codec), then the binding's finalization pass, then the slug guarantee
   * (authored, or derived via {@link ContentBinding.deriveSlug}), then its invariants.
   *
   * Slug derivation happens here — at parse time, deterministically — rather than at database
   * write time, so every fixture consumer (a sync push or a fixture-only generation run) sees the
   * same slug for the same record. Serialization writes the derived slug back to the fixture,
   * making it sticky from then on.
   */
  public parse(raw: unknown, issues: IssueCollector): ParsedRecord<TFields> {
    const decoded = this.finalize(this.record.decode(raw));
    const slug = decoded.slug ?? this.deriveSlug(decoded);
    if (slug === null) {
      throw new TypeError(
        `A '${this.key}' record must carry a slug: none was authored, and this entity has no ` +
          'natural name to derive one from.',
      );
    }
    const parsed = { ...decoded, slug };
    this.validate(parsed, issues);
    return parsed;
  }

  /**
   * Every slug reference the record makes, for cross-reference validation. The base scans the
   * top-level reference fields; aggregate bindings extend it with the references nested inside
   * their trees.
   */
  public references(record: CanonicalRecord<TFields>): SlugReference[] {
    /* The generic mapped type cannot be indexed by a runtime key; the values are re-narrowed by
       the runtime checks below. */
    const values = record as Record<string, unknown>;
    const references: SlugReference[] = [];
    for (const [key, codec] of Object.entries(this.record.fields)) {
      const entity = codec.references;
      if (entity === undefined) {
        continue;
      }
      const value = values[key];
      if (typeof value === 'string') {
        references.push({ entity, slug: value });
      } else if (Array.isArray(value)) {
        for (const slug of value) {
          if (typeof slug === 'string') {
            references.push({ entity, slug });
          }
        }
      }
    }
    return references;
  }

  public serialize(record: ParsedRecord<TFields>): Record<string, unknown> {
    return this.record.encode(record);
  }

  public slugOf(record: ParsedRecord<TFields>): string {
    return record.slug;
  }
}
