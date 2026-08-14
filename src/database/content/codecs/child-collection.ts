import { type Transaction } from '~/database/prisma';

import { type PrismaWriteContext } from './prisma-codec';

/**
 * The database operations one owned child collection needs — the rows of a role's content tree, a
 * profile's contact entries, a sheet's competency groups — supplied by the owner's codec.
 *
 * The adapter knows how to write one model and nothing else; {@link reconcileChildren} owns the
 * identity algebra, so the rule that a child row is correlated by slug and ordered by position is
 * stated once rather than in each of the six collections that follow it.
 */
export interface ChildCollectionAdapter<TChild> {
  create(tx: Transaction, child: TChild, order: number, context: PrismaWriteContext): Promise<void>;
  /**
   * The id of every child row currently under this owner, keyed by slug. Every owned child model
   * carries a `(slug, owner)` unique constraint, which is what makes the key well defined.
   */
  existing(tx: Transaction): Promise<Map<string, string>>;
  remove(tx: Transaction, id: string): Promise<void>;
  slugOf(child: TChild): string;
  update(
    tx: Transaction,
    id: string,
    child: TChild,
    order: number,
    context: PrismaWriteContext,
  ): Promise<void>;
}

/**
 * Brings one owner's child collection to the state the canonical record describes, correlating
 * rows by slug and rewriting every surviving row's `order` from its new position.
 *
 * Reconciling rather than replacing is what preserves each child row's identity and creation
 * timestamp across a push. Deleting and recreating the collection would be simpler and is
 * referentially safe, but it would churn every row's `id` and `createdAt` on every run — including
 * a run that changes nothing — which defeats inheriting creation dates from the legacy rows and
 * makes each pull rewrite the whole file.
 *
 * Removals are applied before writes, so a slug released by one row and claimed by another in the
 * same pass cannot collide on the collection's `(slug, owner)` unique constraint.
 */
export const reconcileChildren = async <TChild>(
  tx: Transaction,
  children: readonly TChild[],
  adapter: ChildCollectionAdapter<TChild>,
  context: PrismaWriteContext,
): Promise<void> => {
  const existing = await adapter.existing(tx);
  const retained = new Set(children.map(child => adapter.slugOf(child)));

  for (const [slug, id] of existing) {
    if (!retained.has(slug)) {
      /* eslint-disable-next-line no-await-in-loop -- The rows are written inside one interactive
         transaction, which does not support concurrent operations. */
      await adapter.remove(tx, id);
    }
  }

  for (const [order, child] of children.entries()) {
    const id = existing.get(adapter.slugOf(child));
    /* eslint-disable-next-line no-await-in-loop -- See above. */
    await (id === undefined
      ? adapter.create(tx, child, order, context)
      : adapter.update(tx, id, child, order, context));
  }
};
