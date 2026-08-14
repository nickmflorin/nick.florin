import { diffRecords, type LeafChange } from '~/database/content';

const paths = (changes: readonly LeafChange[]): string[] => changes.map(change => change.path);

const at = (changes: readonly LeafChange[], path: string): LeafChange | undefined =>
  changes.find(change => change.path === path);

describe('diffRecords()', () => {
  it('reports no changes between identical records', () => {
    const record = { label: 'React', slug: 'react' };
    expect(diffRecords(record, record)).toStrictEqual([]);
  });

  it('classifies a value appearing where the field was elided as additive', () => {
    const changes = diffRecords({ slug: 'react' }, { experience: 5, slug: 'react' });
    expect(at(changes, 'experience')).toMatchObject({
      after: 5,
      before: undefined,
      classification: 'additive',
    });
  });

  it('classifies a changed value as destructive', () => {
    const changes = diffRecords({ experience: 3, slug: 'react' }, { experience: 5, slug: 'react' });
    expect(at(changes, 'experience')?.classification).toBe('destructive');
  });

  it('classifies a cleared value as destructive, since elision restores the default', () => {
    const changes = diffRecords({ experience: 3, slug: 'react' }, { slug: 'react' });
    expect(at(changes, 'experience')).toMatchObject({
      after: undefined,
      classification: 'destructive',
    });
  });

  it('skips the database identity block at every level', () => {
    const before = { meta: { id: 'a' }, nodes: [{ meta: { id: 'b' }, slug: 'one' }], slug: 'role' };
    const after = { meta: { id: 'c' }, nodes: [{ meta: { id: 'd' }, slug: 'one' }], slug: 'role' };
    expect(diffRecords(before, after)).toStrictEqual([]);
  });

  describe('scalar lists', () => {
    it('diffs them as sets, reporting each member that entered or left', () => {
      const changes = diffRecords(
        { competencies: ['react', 'vue'], slug: 'role' },
        { competencies: ['react', 'svelte'], slug: 'role' },
      );
      expect(at(changes, 'competencies[vue]')?.classification).toBe('destructive');
      expect(at(changes, 'competencies[svelte]')?.classification).toBe('additive');
    });

    it('ignores a reordering, because no such list persists its order', () => {
      const changes = diffRecords(
        { competencies: ['react', 'vue'], slug: 'role' },
        { competencies: ['vue', 'react'], slug: 'role' },
      );
      expect(changes).toStrictEqual([]);
    });
  });

  describe('object lists', () => {
    const before = {
      slug: 'role',
      summary: [
        { content: 'First.', slug: 'opening' },
        { content: 'Second.', slug: 'closing' },
      ],
    };

    it('correlates elements by slug rather than by index', () => {
      const after = {
        slug: 'role',
        summary: [
          { content: 'Inserted.', slug: 'preamble' },
          { content: 'First.', slug: 'opening' },
          { content: 'Second.', slug: 'closing' },
        ],
      };
      const changes = diffRecords(before, after);
      /* Index correlation would report all three elements as changed; slug correlation reports one
         addition and the two moves it caused. */
      expect(at(changes, 'summary[preamble]')?.classification).toBe('additive');
      expect(at(changes, 'summary[opening]')?.classification).toBe('reorder');
      expect(at(changes, 'summary[closing]')?.classification).toBe('reorder');
      expect(paths(changes)).toHaveLength(3);
    });

    it('addresses a nested change by the slug path that reaches it', () => {
      const after = {
        slug: 'role',
        summary: [
          { content: 'Rewritten.', slug: 'opening' },
          { content: 'Second.', slug: 'closing' },
        ],
      };
      const changes = diffRecords(before, after);
      expect(paths(changes)).toStrictEqual(['summary[opening].content']);
      expect(at(changes, 'summary[opening].content')?.classification).toBe('destructive');
    });

    it('reports a removed element as destructive and an added one as additive', () => {
      const after = {
        slug: 'role',
        summary: [
          { content: 'First.', slug: 'opening' },
          { content: 'Third.', slug: 'epilogue' },
        ],
      };
      const changes = diffRecords(before, after);
      expect(at(changes, 'summary[closing]')?.classification).toBe('destructive');
      expect(at(changes, 'summary[epilogue]')?.classification).toBe('additive');
    });

    it('descends through nested object lists', () => {
      const changes = diffRecords(
        { content: [{ children: [{ content: 'A.', slug: 'child' }], slug: 'node' }], slug: 'role' },
        { content: [{ children: [{ content: 'B.', slug: 'child' }], slug: 'node' }], slug: 'role' },
      );
      expect(paths(changes)).toStrictEqual(['content[node].children[child].content']);
    });
  });
});
