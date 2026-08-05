/**
 * The keys the transfer machinery itself owns and re-derives, and that therefore never funnel
 * through a mapping between representations: audit authorship scalars, position columns stamped
 * from array order, the foreign-key scalars of structural relations, the polymorphic owner pair,
 * and the fixture-side `meta` identity block.
 *
 * Membership here means "always dropped when present" — a key applies to whichever shapes carry
 * it and is ignored on the rest.
 */
export const TransferBookkeepingKeys = [
  'createdById',
  'kind',
  'meta',
  'order',
  'ownerId',
  'ownerType',
  'parentId',
  'profileId',
  'resumeSheetId',
  'updatedById',
] as const;

export type TransferBookkeepingKey = (typeof TransferBookkeepingKeys)[number];

/**
 * Omits every {@link TransferBookkeepingKeys bookkeeping key} the value carries, plus any extra
 * keys the call site excludes deliberately, with the return type derived from the input so the
 * result stays exact. This is the standard opener of a derived object literal in this module:
 * spread the result, then state only the fields the phase adds or transforms.
 *
 * @param {readonly K[]} extra
 *   Additional keys to drop, for the fields the call site transforms after the spread — the
 *   informative, entity-specific exclusions that should stay visible at the mapping.
 */
export const omitBookkeeping = <T extends object, K extends keyof T = never>(
  value: T,
  extra: readonly K[] = [],
): Omit<T, K | TransferBookkeepingKey> => {
  const dropped = new Set<PropertyKey>([...extra, ...TransferBookkeepingKeys]);
  const result: Record<string, unknown> = {};
  /* The generic erases the entry pairing, so enumeration needs the checker stood down; the keys
     and values are copied verbatim from the input. */
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (!dropped.has(key)) {
      result[key] = entry;
    }
  }
  /* Built by copying every non-dropped key, which is precisely what the `Omit` describes. */
  return result as Omit<T, K | TransferBookkeepingKey>;
};
