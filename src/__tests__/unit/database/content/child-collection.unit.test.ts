import {
  type ChildCollectionAdapter,
  type PrismaWriteContext,
  reconcileChildren,
} from '~/database/content';
import { type Transaction } from '~/database/prisma';

interface Child {
  readonly slug: string;
  readonly text: string;
}

type Operation =
  | { readonly kind: 'create'; readonly order: number; readonly slug: string }
  | { readonly kind: 'remove'; readonly slug: string }
  | { readonly kind: 'update'; readonly order: number; readonly slug: string };

/**
 * A collection adapter over an in-memory table, recording the operations it is asked to perform.
 * The reconciler owns every decision under test; the adapter only has to remember what it was told.
 */
const fakeAdapter = (
  rows: Map<string, string>,
): { adapter: ChildCollectionAdapter<Child>; operations: Operation[] } => {
  const operations: Operation[] = [];
  const idsToSlugs = new Map([...rows].map(([slug, id]) => [id, slug]));
  return {
    adapter: {
      create: (_tx, child, order) => {
        operations.push({ kind: 'create', order, slug: child.slug });
        return Promise.resolve();
      },
      existing: () => Promise.resolve(new Map(rows)),
      remove: (_tx, id) => {
        operations.push({ kind: 'remove', slug: idsToSlugs.get(id) ?? id });
        return Promise.resolve();
      },
      slugOf: child => child.slug,
      update: (_tx, id, _child, order) => {
        operations.push({ kind: 'update', order, slug: idsToSlugs.get(id) ?? id });
        return Promise.resolve();
      },
    },
    operations,
  };
};

const child = (slug: string): Child => ({ slug, text: slug });

const Tx = {} as Transaction;
const Context = {} as PrismaWriteContext;

describe('reconcileChildren()', () => {
  it('creates a child the collection does not hold yet', async () => {
    expect.hasAssertions();
    const { adapter, operations } = fakeAdapter(new Map());
    await reconcileChildren(Tx, [child('one')], adapter, Context);
    expect(operations).toStrictEqual([{ kind: 'create', order: 0, slug: 'one' }]);
  });

  it('updates a child that survives, rather than replacing it', async () => {
    expect.hasAssertions();
    const { adapter, operations } = fakeAdapter(new Map([['one', 'id-one']]));
    await reconcileChildren(Tx, [child('one')], adapter, Context);
    expect(operations).toStrictEqual([{ kind: 'update', order: 0, slug: 'one' }]);
  });

  it('removes a child the collection no longer describes', async () => {
    expect.hasAssertions();
    const { adapter, operations } = fakeAdapter(
      new Map([
        ['one', 'id-one'],
        ['two', 'id-two'],
      ]),
    );
    await reconcileChildren(Tx, [child('one')], adapter, Context);
    expect(operations).toContainEqual({ kind: 'remove', slug: 'two' });
    expect(operations).toContainEqual({ kind: 'update', order: 0, slug: 'one' });
  });

  it('rewrites every order from the new position, so a reordering needs no removals', async () => {
    expect.hasAssertions();
    const { adapter, operations } = fakeAdapter(
      new Map([
        ['one', 'id-one'],
        ['two', 'id-two'],
      ]),
    );
    await reconcileChildren(Tx, [child('two'), child('one')], adapter, Context);
    expect(operations).toStrictEqual([
      { kind: 'update', order: 0, slug: 'two' },
      { kind: 'update', order: 1, slug: 'one' },
    ]);
  });

  it('applies every removal before any write, so a released slug cannot collide', async () => {
    expect.hasAssertions();
    /* `two` is dropped and `three` is added. Were the write of `three` to run before the removal of
       `two`, a collection whose unique constraint the two rows shared would reject it. */
    const { adapter, operations } = fakeAdapter(
      new Map([
        ['one', 'id-one'],
        ['two', 'id-two'],
      ]),
    );
    await reconcileChildren(Tx, [child('one'), child('three')], adapter, Context);
    const firstWrite = operations.findIndex(operation => operation.kind !== 'remove');
    const lastRemoval = operations.map(operation => operation.kind).lastIndexOf('remove');
    expect(lastRemoval).toBeLessThan(firstWrite);
  });

  it('removes every row when the collection is emptied', async () => {
    expect.hasAssertions();
    const { adapter, operations } = fakeAdapter(
      new Map([
        ['one', 'id-one'],
        ['two', 'id-two'],
      ]),
    );
    await reconcileChildren(Tx, [], adapter, Context);
    expect(operations).toStrictEqual([
      { kind: 'remove', slug: 'one' },
      { kind: 'remove', slug: 'two' },
    ]);
  });
});
