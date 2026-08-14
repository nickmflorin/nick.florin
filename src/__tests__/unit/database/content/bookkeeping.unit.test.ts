import { omitBookkeeping, TransferBookkeepingKeys } from '~/database/content/bookkeeping';

describe('omitBookkeeping()', () => {
  it('drops every bookkeeping key the value carries', () => {
    const record = Object.fromEntries(
      TransferBookkeepingKeys.map(key => [key, 'dropped'] as const),
    );
    expect(omitBookkeeping({ ...record, slug: 'react' })).toStrictEqual({ slug: 'react' });
  });

  it('ignores the bookkeeping keys the value does not carry', () => {
    expect(omitBookkeeping({ label: 'React', slug: 'react' })).toStrictEqual({
      label: 'React',
      slug: 'react',
    });
  });

  it('drops the extra keys the call site excludes, alongside the bookkeeping keys', () => {
    const record = { company: 'acme', content: {}, meta: { id: 'a' }, slug: 'engineer' };
    expect(omitBookkeeping(record, ['company', 'content'])).toStrictEqual({ slug: 'engineer' });
  });

  it('preserves a retained key whose value is null or undefined, rather than eliding it', () => {
    const result = omitBookkeeping({ description: null, order: 3, shortLabel: undefined });
    expect(result).toStrictEqual({ description: null, shortLabel: undefined });
    expect('shortLabel' in result).toBe(true);
  });

  it('returns an empty object when every key is dropped', () => {
    expect(omitBookkeeping({ meta: { id: 'a' }, order: 1 })).toStrictEqual({});
  });

  it('does not mutate the value it is given', () => {
    const record = { meta: { id: 'a' }, slug: 'react' };
    omitBookkeeping(record);
    expect(record).toStrictEqual({ meta: { id: 'a' }, slug: 'react' });
  });
});
