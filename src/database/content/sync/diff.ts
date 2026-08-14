import { isEqual } from 'lodash-es';

import { isRecordType } from '~/lib/typeguards';

/**
 * What a single change does to information that already exists.
 *
 * `additive` fills something absent, which is always safe to apply. `destructive` overwrites or
 * clears an authored value, or removes a record — the two failure modes the confirmation gate
 * exists to prevent happening silently. `reorder` changes nothing about a record's content but
 * changes the position it renders in, which is invisible in a field-by-field diff and so is called
 * out on its own.
 */
export type ChangeClass = 'additive' | 'destructive' | 'reorder';

/**
 * One difference between two encoded records, at the finest granularity the shapes allow.
 *
 * Values are the encoded (fixture-shaped) ones, in which a field carrying its default is absent
 * rather than present-and-defaulted. That absence is what makes the classification meaningful: a
 * value appearing where there was none is additive, and only a value that was really there can be
 * destroyed.
 */
export interface LeafChange {
  readonly after: unknown;
  readonly before: unknown;
  readonly classification: ChangeClass;
  readonly path: string;
}

/**
 * Classifies a leaf change from the value it replaces, which is all the classification depends on:
 * a change is additive exactly when there was nothing there before. The new value carries no
 * information here — it is only ever reached once the two have been found unequal, so a change from
 * an absent value is additive whatever it lands on.
 */
const classify = (before: unknown): ChangeClass =>
  before === undefined ? 'additive' : 'destructive';

const isObjectList = (value: unknown[]): boolean =>
  value.length > 0 && value.every(item => isRecordType(item) && typeof item.slug === 'string');

const slugOf = (item: unknown): string =>
  isRecordType(item) && typeof item.slug === 'string' ? item.slug : '';

const join = (path: string, segment: string): string =>
  path === '' ? segment : `${path}.${segment}`;

/**
 * Diffs two lists of records that carry slugs, correlating elements by slug rather than by index.
 *
 * Index correlation would report a single insertion as a change to every element after it; slug
 * correlation reports it as one addition, and reports a genuine move as a move. This is the same
 * reasoning that makes slugs the correlation key between the two sides of a sync, applied one level
 * down.
 */
const diffObjectList = (path: string, before: unknown[], after: unknown[]): LeafChange[] => {
  const beforeBySlug = new Map(before.map((item, index) => [slugOf(item), { index, item }]));
  const afterBySlug = new Map(after.map((item, index) => [slugOf(item), { index, item }]));
  const changes: LeafChange[] = [];

  for (const [slug, { item }] of beforeBySlug) {
    if (!afterBySlug.has(slug)) {
      changes.push({
        after: undefined,
        before: item,
        classification: 'destructive',
        path: `${path}[${slug}]`,
      });
    }
  }
  for (const [slug, { index, item }] of afterBySlug) {
    const previous = beforeBySlug.get(slug);
    if (previous === undefined) {
      changes.push({
        after: item,
        before: undefined,
        classification: 'additive',
        path: `${path}[${slug}]`,
      });
      continue;
    }
    changes.push(...diffValues(`${path}[${slug}]`, previous.item, item));
    if (previous.index !== index) {
      changes.push({
        after: index,
        before: previous.index,
        classification: 'reorder',
        path: `${path}[${slug}]`,
      });
    }
  }
  return changes;
};

/**
 * Diffs two lists of scalars as sets. Every such list in the content model — competency links,
 * channel grants, a sheet's roles — is persisted as a relation whose order carries no meaning, so
 * reporting a reordering of one would be reporting a change that cannot exist.
 */
const diffScalarList = (path: string, before: unknown[], after: unknown[]): LeafChange[] => {
  const changes: LeafChange[] = [];
  for (const value of before) {
    if (!after.some(candidate => isEqual(candidate, value))) {
      changes.push({
        after: undefined,
        before: value,
        classification: 'destructive',
        path: `${path}[${String(value)}]`,
      });
    }
  }
  for (const value of after) {
    if (!before.some(candidate => isEqual(candidate, value))) {
      changes.push({
        after: value,
        before: undefined,
        classification: 'additive',
        path: `${path}[${String(value)}]`,
      });
    }
  }
  return changes;
};

const diffValues = (path: string, before: unknown, after: unknown): LeafChange[] => {
  if (isEqual(before, after)) {
    return [];
  }
  if (Array.isArray(before) && Array.isArray(after)) {
    return isObjectList(before) || isObjectList(after)
      ? diffObjectList(path, before, after)
      : diffScalarList(path, before, after);
  }
  if (isRecordType(before) && isRecordType(after)) {
    return diffRecords(before, after, path);
  }
  return [{ after, before, classification: classify(before), path }];
};

/**
 * Every difference between two encoded records, as a flat list of leaf changes addressed by path.
 *
 * Both sides are compared in their encoded form so that the diff speaks in the vocabulary the
 * fixture is authored in. The database identity block is skipped at every level: it is bookkeeping
 * that exists on one side and not the other by design, and a record correlated by slug is the same
 * record whatever its row id.
 */
export const diffRecords = (
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  path = '',
): LeafChange[] => {
  const keys = new Set([...Object.keys(after), ...Object.keys(before)]);
  keys.delete('meta');
  return [...keys].sort().flatMap(key => diffValues(join(path, key), before[key], after[key]));
};
